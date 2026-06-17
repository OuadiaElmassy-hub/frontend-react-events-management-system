import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import HeroSection from '../components/HeroSection'
import EventGrid from '../components/EventGrid'
import Category from '../components/Category'

import { getPublishedEvents } from '../services/eventService'
import { getCategories } from '../services/categorieService'

import About from '../pages/About'
import ContactUs from '../pages/ContactUs'

const Home = () => {
  const [categories, setCategories] = useState([])
  const [recentEvents, setRecentEvents] = useState([])
  const [loadingEvents, setLoadingEvents] = useState(true)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const cats = await getCategories()
        setCategories([
          { id: 0, nom: 'All', iconUrl: '/uploads/categories/all.svg' },
          ...cats
        ])
      } catch (err) {
        console.error("Erreur lors de la récupération des catégories :", err)
      }
    }
    fetchCategories()
  }, [])

  useEffect(() => {
    const fetchRecentEvents = async () => {
      try {
        setLoadingEvents(true)
        const response = await getPublishedEvents({
          page: 0,
          size: 4, // 4 événements offrent un meilleur équilibre visuel en grille
          categorieId: null,
          keyword: "",
          ville: "",
          date: "",
          prixMax: 2000
        })
        setRecentEvents(response.content || [])
      } catch (err) {
        console.error("Erreur lors de la récupération des événements :", err)
        setRecentEvents([])
      } finally {
        setLoadingEvents(false)
      }
    }
    fetchRecentEvents()
  }, [])

  return (
    <div className="flex flex-col min-h-screen bg-[#FAF6F0] text-[#2D2219] antialiased">

      {/* HeroSection */}
      <HeroSection />

      {/* Section À Propos */}
      <section id='about' className="bg-white border-y border-orange-100/30 shadow-[0_4px_20px_rgba(217,119,6,0.02)]">
        <About />
      </section>

      {/* Section Catégories */}
      <div className="max-w-7xl mx-auto w-full px-6 pt-16">
        <div className="text-center mb-8">
          <span className="text-xs font-bold uppercase tracking-widest text-[#D97706]">Exploration</span>
          <h3 className="text-xl font-bold text-[#0F4C81] mt-1">Parcourir par catégorie</h3>
        </div>
        <Category categories={categories} />
      </div>

      {/* Liste des événements mis en avant */}
      <div className="w-full py-16">
        <div className="max-w-7xl mx-auto px-6">
          
          <div className="mb-10 px-6">
            <span className="text-xs font-bold uppercase tracking-widest text-[#D97706] block mb-1">
              Sélection exclusive
            </span>
            <h2 className="text-3xl font-extrabold text-[#0F4C81] relative inline-block after:content-[''] after:block after:w-12 after:h-1 after:bg-[#D97706] after:mt-2 after:rounded-full">
              Événements à venir au Maroc
            </h2>
          </div>
          
          {/* Grille avec état de chargement épuré */}
          <div className="px-6">
            {loadingEvents ? (
              <div className="flex flex-col justify-center items-center py-20 gap-3">
                <div className="animate-spin rounded-full h-10 w-10 border-2 border-t-transparent border-[#D97706]"></div>
                <p className="text-xs text-gray-400 font-medium tracking-wide">Chargement de l'agenda...</p>
              </div>
            ) : recentEvents.length > 0 ? (
              <div className="transition-all duration-300">
                <EventGrid events={recentEvents} />
              </div>
            ) : (
              <div className="text-center py-16 bg-white/50 backdrop-blur-xs rounded-2xl border border-orange-100/40">
                <p className="text-sm text-gray-400">
                  Aucun événement disponible pour le moment.
                </p>
              </div>
            )}
          </div>

          {/* Bouton CTA "Voir tous les événements" */}
          <div className="mt-14 text-center">
            <Link to="/events#events-list">
              <button className="px-8 py-3.5 bg-[#D97706] hover:bg-[#C2410C] text-white text-sm font-semibold rounded-xl shadow-lg shadow-orange-700/15 hover:shadow-orange-700/25 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer">
                Découvrir tous les événements
              </button>
            </Link>
          </div>

        </div>
      </div>

      {/* Section Contact */}
      <section id='contact' className="bg-[#0F4C81] text-white shadow-[0_-8px_30px_rgba(15,76,129,0.1)]">
        <ContactUs />
      </section>
      
    </div>
  )
}

export default Home