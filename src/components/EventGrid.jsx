
// import { useEffect, useState } from 'react'
// import EventCard from './EventCard'
// import { getCategories } from '../services/categorieService'

// const EventGrid = ({ events }) => {
//   const [categoriesMap, setCategoriesMap] = useState({})

//   useEffect(() => {
//     const fetchCategories = async () => {
//       try {
//         const cats = await getCategories()
//         const map = cats.reduce((acc, cat) => {
//           acc[String(cat.id)] = cat // <- String() pour éviter mismatch number/string
//           return acc
//         }, {})
//         setCategoriesMap(map)
//       } catch (err) {
//         console.error(err)
//       }
//     }
//     fetchCategories()
//   }, [])

//   // Condition APRÈS les hooks
//   if (!events || events.length === 0) {
//     return (
//       <div className="text-center py-20">
//         <p className="text-gray-500 text-lg">Aucun événement trouvé</p>
//       </div>
//     )
//   }

//   // Loader le temps que les cats chargent
//   if (Object.keys(categoriesMap).length === 0) {
//     return <div className="text-center py-20">Chargement catégories...</div>
//   }

//   return (
//     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
//       {events.map(event => (
//         <EventCard 
//           key={event.id} 
//           event={event} 
//           categorie={categoriesMap[String(event.categorieId)]} // <- String() aussi ici
//         />
//       ))}
//     </div>
//   )
// }

// export default EventGrid


import { useEffect, useState } from 'react'
import EventCard from './EventCard'
import { getCategories } from '../services/categorieService'

const EventGrid = ({ events }) => {
  const [categoriesMap, setCategoriesMap] = useState({})
  const [isLoadingCats, setIsLoadingCats] = useState(true)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const cats = await getCategories()
        if (Array.isArray(cats)) {
          const map = cats.reduce((acc, cat) => {
            acc[String(cat.id)] = cat
            return acc
          }, {})
          setCategoriesMap(map)
        }
      } catch (err) {
        console.error("Erreur lors de la récupération des catégories:", err)
      } finally {
        setIsLoadingCats(false) // Garantit qu'on sort du loader quoi qu'il arrive
      }
    }
    fetchCategories()
  }, [])

  // 1. Si aucun événement n'est trouvé (Filtres vides ou base vide)
  if (!events || events.length === 0) {
    return (
      <div className="text-center py-24 bg-white rounded-2xl border border-slate-100 shadow-sm max-w-xl mx-auto my-8">
        <p className="text-slate-400 text-lg font-medium">Aucun événement ne correspond à votre recherche</p>
        <p className="text-slate-400 text-sm mt-1">Essayez de modifier vos filtres ou de changer de ville.</p>
      </div>
    )
  }

  // 2. Optionnel : Squelette de chargement initial (Uniquement au tout premier montage global si nécessaire)
  // Note : Il est préférable de laisser les cartes s'afficher même si l'objet est vide.
  // Si tu veux un loader global propre pour Rovista pendant que TOUT charge :
  if (isLoadingCats && Object.keys(categoriesMap).length === 0 && events.length === 0) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {events.map(event => {
        const categoryIdStr = String(event.categorieId || event.categorie_id); // Gère les deux formats de naming (camelCase/snake_case)
        const associatedCategory = categoriesMap[categoryIdStr];

        return (
          <EventCard 
            key={event.id} 
            event={event} 
            // On passe la catégorie si elle existe, sinon une structure de secours pour éviter les crashs dans EventCard
            categorie={associatedCategory || { nom: 'Événement', couleur: 'gray' }} 
          />
        )
      })}
    </div>
  )
}

export default EventGrid