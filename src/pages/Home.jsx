import { useEffect, useState } from 'react'

import HeroSection from '../components/HeroSection'
import Sidebar from '../components/Sidebar'
import EventGrid from '../components/EventGrid'
import Category from '../components/Category'

import { getPublishedEvents } from '../services/eventService'
import { getCategories } from '../services/categorieService'

import About from '../pages/About'
import ContactUs from '../pages/ContactUs'

const Home = () => {
  // DATA
  const [categories, setCategories] = useState([])
  const [searchQuery, setSearchQuery] = useState('')

  // =====================
  // CATEGORIES
  // =====================
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const cats = await getCategories()

        setCategories([
          { id: 0, nom: 'All', iconUrl: '/uploads/categories/all.svg' },
          ...cats
        ])
      } catch (err) {
        console.error(err)
      }
    }

    fetchCategories()
  }, [])

  // =====================
  // HANDLERS
  // =====================
  const handleSearch = (query) => {
    setSearchQuery(query)
    if (typeof setPage === 'function') setPage(0) // Sécurité si setPage n'est pas défini ici
  }

  return (
    /* 
      Changement du fond : 'bg-[#FAF6F0]' (Teinte sable/riad chaleureuse) 
      au lieu du 'bg-gray-50' trop impersonnel et froid.
    */
    <div className="flex flex-col min-h-screen bg-[#FAF6F0] text-[#2D2219]">

      {/* HeroSection : Devra utiliser un bouton ou des dégradés Ocre/Bleu */}
      <HeroSection />

      {/* Section À Propos : Sur fond blanc pur pour créer un contraste de structure */}
      <section id='about' className="bg-white border-y border-orange-100/50">
        <About />
      </section>

      {/* Section Catégories */}
      <div className="max-w-7xl mx-auto px-6 pt-12">
        <Category categories={categories} />
      </div>

      {/* Liste des événements mis en avant */}
      <div className="flex-1 w-full">
        <div className="max-w-7xl mx-auto py-12 px-6 lg:px-0">
          
          {/* 
            Titre personnalisé : 'text-[#0F4C81]' (Bleu profond) 
            avec une petite touche de décoration marocaine possible en CSS 
          */}
          <h2 className="text-3xl font-bold mb-8 px-6 text-[#0F4C81] relative after:content-[''] after:block after:w-16 after:h-1 after:bg-[#D97706] after:mt-2">
            Événements à venir au Maroc
          </h2>

          {/* C'est ici que tu appelleras ton <EventGrid /> personnalisé */}

          {/* Exemple de bouton CTA "Voir tous les événements" inspiré de la charte */}
          <div className="mt-8 text-center">
            <button className="px-6 py-3 bg-[#D97706] hover:bg-[#C2410C] text-white font-medium rounded-xl shadow-md shadow-orange-700/10 transition-all duration-200">
              Découvrir tous les événements
            </button>
          </div>

        </div>
      </div>

      {/* Section Contact : Sur fond bleu profond pour finir sur une note élégante */}
      <section id='contact' className="bg-[#0F4C81] text-white">
        <ContactUs />
      </section>
      
    </div>
  )
}

export default Home