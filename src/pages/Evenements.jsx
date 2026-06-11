import { useSearchParams } from 'react-router-dom'
import { useEffect, useState, useCallback } from 'react'

import HeroSection from '../components/HeroSection'
import Sidebar from '../components/Sidebar'
import EventGrid from '../components/EventGrid'
import Category from '../components/Category'

import { getPublishedEvents } from '../services/eventService'
import { getCategories } from '../services/categorieService'
import SearchBar from '../components/SearchBar'

const Evenements = () => {
  // =====================
  // STATE DATA
  // =====================
  const [events, setEvents] = useState([])
  const [categories, setCategories] = useState([])
  const [totalPages, setTotalPages] = useState(0)
  const [size] = useState(8)

  // =====================
  // URL PARAMS
  // =====================
  const [searchParams, setSearchParams] = useSearchParams()

  const page = Number(searchParams.get("page")) || 0
  const searchQuery = searchParams.get("keyword") || ""
  const ville = searchParams.get("ville") || ""
  const date = searchParams.get("date") || ""
  const prixMax = searchParams.get("prixMax") !== null ? Number(searchParams.get("prixMax")) : 200
  const categorieId = searchParams.get("categorieId") ? Number(searchParams.get("categorieId")) : null

  const filters = { ville, date, prixMax }

  // =====================
  // UPDATE PARAMS HELPER
  // =====================
  const updateParams = useCallback((newParams) => {
    setSearchParams(prev => {
        const current = Object.fromEntries(prev);
        
        // Fusion des anciens et nouveaux paramètres
        const updated = { ...current, ...newParams };

        // Nettoyage des valeurs vides pour éviter de polluer l'URL
        if (updated.keyword === "") delete updated.keyword;
        if (updated.ville === "") delete updated.ville;
        if (updated.date === "") delete updated.date;
        if (updated.prixMax === "200") delete updated.prixMax;
        if (updated.categorieId === "" || updated.categorieId === "0") delete updated.categorieId;

        return updated;
    });
  }, [setSearchParams]);

  // =====================
  // CATEGORIES FETCH
  // =====================
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const cats = await getCategories()
        setCategories([
          { id: 0, nom: 'All', imgUrl: '/uploads/categories-images/all.svg' },
          ...cats
        ])
      } catch (err) {
        console.error(err)
      }
    }
    fetchCategories()
  }, [])

  // =====================
  // EVENTS LOAD (useCallback pour éviter les boucles)
  // =====================
  const loadEvents = useCallback(async () => {
    try {
      const response = await getPublishedEvents({
        page,
        size,
        categorieId,
        keyword: searchQuery,
        ville,
        date,
        prixMax
      })

      setEvents(response.content || [])
      setTotalPages(response.totalPages || 0)
    } catch (err) {
      console.error(err)
      setEvents([])
    }
  }, [page, size, categorieId, searchQuery, ville, date, prixMax])

  useEffect(() => {
    loadEvents()
  }, [loadEvents])

  // =====================
  // HANDLERS
  // =====================
  const handleSearch = (query) => {
    updateParams({
      keyword: query || "",
      page: "0" // On reset la page uniquement lors d'une NOUVELLE recherche
    })
  }

//   const handleFilterChange = (newFilters) => {
//     updateParams({
//       ville: newFilters.ville || "",
//       date: newFilters.date || "",
//       prixMax: String(newFilters.prixMax ?? 200),
//       page: "0" // On reset la page uniquement quand un filtre change
//     })
//   }

    const handleFilterChange = (newFilters) => {
    // On récupère les valeurs actuelles pour comparer
    const currentVille = searchParams.get("ville") || "";
    const currentDate = searchParams.get("date") || "";
    const currentPrixMax = Number(searchParams.get("prixMax")) || 200;

    // Est-ce qu'un filtre a VRAIMENT changé ?
    const hasChanged = 
        newFilters.ville !== currentVille ||
        newFilters.date !== currentDate ||
        Number(newFilters.prixMax) !== currentPrixMax;

    // Si rien n'a changé (simple re-render), on ne fait rien
    if (!hasChanged) return;

    // Si ça a changé, on applique les filtres ET on reset la page à 0
    updateParams({
        ville: newFilters.ville || "",
        date: newFilters.date || "",
        prixMax: String(newFilters.prixMax ?? 200),
        page: "0" 
    });
    };

    
  const handleCategorieChange = (id) => {
    updateParams({
      categorieId: id !== 0 ? String(id) : "",
      page: "0" // On reset la page au changement de catégorie
    })
  }

  const goPrev = () => {
    if (page > 0) {
      updateParams({ page: String(page - 1) })
    }
  }

  const goNext = () => {
    if (page < totalPages - 1) {
      updateParams({ page: String(page + 1) })
    }
  }

  // =====================
  // UI
  // =====================
  
  return (
    <div className="flex flex-col min-h-full bg-gray-50">
      <HeroSection />

      {/* Search bar */}
      <div className="bg-white border-b border-gray-100 px-4 py-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Événements</h1>
          <SearchBar onSearch={handleSearch} defaultValue={searchQuery} />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-8">
        <Category
          categories={categories}
          selectedCategorie={categorieId ?? 0}
          onCategorieChange={handleCategorieChange}
        />
      </div>

      <div className="flex-1 w-full">
        <div className="max-w-7xl mx-auto py-8 px-6 lg:px-0">
          
          <section id='list'>
            <h2 className="text-3xl font-bold mb-8 px-6">
              Événements à venir
            </h2>
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-1">
              <Sidebar
                filters={filters}
                onFilterChange={handleFilterChange}
              />
            </div>

            <div className="lg:col-span-3 pr-6">
              <EventGrid events={events} />

              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 mt-8">
                  <button
                    disabled={page === 0}
                    onClick={goPrev}
                    className="px-4 py-2 bg-gray-200 cursor-pointer rounded disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 font-medium hover:bg-gray-300 transition-colors"
                  >
                    Précédent
                  </button>

                  <span className="text-sm font-medium text-gray-600">
                    Page {page + 1} / {totalPages}
                  </span>

                  <button
                    disabled={page >= totalPages - 1}
                    onClick={goNext}
                    className="px-4 py-2 bg-gray-200 cursor-pointer rounded disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 font-medium hover:bg-gray-300 transition-colors"
                  >
                    Suivant
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Evenements