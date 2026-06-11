//  import { Link } from 'react-router-dom'

// import { format, formatDistanceToNow } from 'date-fns'
// import { fr } from 'date-fns/locale'
// import { FaCalendar, FaMapMarkerAlt, FaStar, FaClock } from 'react-icons/fa'

// const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'

// const EventCard = ({ event, categorie }) => {
//   const dateDebut = event.dateDebut ? new Date(event.dateDebut) : null

//   // 1. Date formatée : "ven. 22 mai"
//   const dateFormatted = dateDebut ? format(dateDebut, 'EEE d MMM', { locale: fr }) : ''
  
//   // 2. Heure : "19:30"
//   const heureFormatted = dateDebut ? format(dateDebut, 'HH:mm') : ''
  
//   const isSoon = dateDebut && dateDebut - new Date() < 1 * 24 * 60 * 60 * 1000 // < 1 jours

//   // 3. "Dans 3 jours" / "Aujourd'hui" / "Hier"
//   const relativeTime = dateDebut 
//     ? formatDistanceToNow(dateDebut, { 
//         locale: fr, 
//         addSuffix: true // <- ajoute "dans" ou "il y a"
//       }) 
//     : ''

//   return (
//     // <Link to={`/event/${event.id}`}>
//       <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition cursor-pointer group">
//         <div className="relative">
//           <img
//             src={`${API_BASE_URL}${event.imagesUrls?.[0] || ''}`}
//             alt={event.titre}
//             className="w-full h-48 object-cover group-hover:scale-105 transition duration-300"
//           />
          
//           <div className="absolute top-3 right-3 bg-yellow-400 text-gray-900 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
//             <FaStar size={12} /> {event.rating ?? '0.0'}
//           </div>
          
//           <div className="absolute top-3 left-3 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
//             {categorie?.nom || 'Sans catégorie'}
//           </div>
//         </div>

//         <div className="p-4">
//           <h3 className="font-bold text-lg mb-2 line-clamp-2">{event.titre}</h3>

//           <div className="space-y-2 text-sm text-gray-600 mb-3">
//             <div className="flex items-center gap-2">
//               <FaMapMarkerAlt className="text-blue-600" />
//               <span>{event.ville}</span>
//             </div>
            
//             {/* Date + "dans X jours" sur la même ligne */}
//             <div className="flex items-center gap-2">
//               <FaCalendar className="text-blue-600" />
//               <span className="capitalize">{dateFormatted}</span>
//               <span className={`text-xs px-2 py-0.5 rounded-full ${isSoon ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
//                  {relativeTime} {/*// <- "dans 3 jours" */}
//               </span>
//             </div>
            
//             <div className="flex items-center gap-2">
//               <FaClock className="text-blue-600" />
//               <span>{heureFormatted}</span>
//             </div>

//             <div className="max-h-96 overflow-y-auto pr-4 text-gray-700 leading-relaxed whitespace-pre-line scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
//               {event.description}
//             </div>
//           </div>

//           <div className="flex justify-between items-center pt-3 border-t">
//             <span className="text-2xl font-bold text-blue-600">{event.prix}DH</span>
//             <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-semibold transition">
//               <Link to={`/events/${event.id}`}>Explorer</Link> 
//             </button>
//           </div>
//         </div>
//       </div>
//     // </Link>
//   )
// }

// export default EventCard


import { Link } from 'react-router-dom'
import { format, formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import { FaCalendar, FaMapMarkerAlt, FaStar, FaClock, FaChevronRight } from 'react-icons/fa'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

const EventCard = ({ event, categorie }) => {
  const dateDebut = event.dateDebut ? new Date(event.dateDebut) : null

  // 1. Date formatée : "Ven. 22 Mai"
  const dateFormatted = dateDebut ? format(dateDebut, 'EEE d MMM', { locale: fr }) : ''
  
  // 2. Heure : "19:30"
  const heureFormatted = dateDebut ? format(dateDebut, 'HH:mm') : ''
  
  // 3. Vérification si l'événement a lieu bientôt (< 24h) ou s'il est déjà passé
  const maintenant = new Date()
  const isSoon = dateDebut && (dateDebut - maintenant > 0) && (dateDebut - maintenant < 1 * 24 * 60 * 60 * 1000)
  const isPast = dateDebut && (dateDebut - maintenant < 0)

  // 4. Temps relatif : "dans 3 jours" / "il y a 2 heures"
  const relativeTime = dateDebut 
    ? formatDistanceToNow(dateDebut, { locale: fr, addSuffix: true }) 
    : ''

  // Détermination du style du badge de temps relatif
  const getRelativeTimeBadgeClass = () => {
    if (isPast) return 'bg-gray-100 text-gray-600'
    if (isSoon) return 'bg-rose-100 text-rose-700 font-medium animate-pulse'
    return 'bg-emerald-50 text-emerald-700 font-medium'
  }

  return (
    <Link 
      to={`/events/${event.id}`} 
      className="block bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-xl transition-all duration-300 group"
    >
      {/* Conteneur de l'image */}
      <div className="relative h-48 overflow-hidden bg-slate-100 shrink-0">
        <img
          src={event.imagesUrls?.[0] ? `${API_BASE_URL}${event.imagesUrls[0]}` : 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=600&q=80'}
          alt={event.titre}
          className="w-full h-full object-cover group-hover:scale-105 transition duration-500 ease-out"
          loading="lazy"
        />
        
        {/* Badge Note / Rating */}
        <div className="absolute top-3 right-3 bg-slate-900/80 backdrop-blur-md text-amber-400 px-2.5 py-1 rounded-xl text-xs font-bold flex items-center gap-1 shadow-sm">
          <FaStar size={11} className="fill-current" /> 
          <span>{event.rating ? Number(event.rating).toFixed(1) : '0.0'}</span>
        </div>
        
        {/* Badge Catégorie */}
        <div className="absolute top-3 left-3 bg-amber-600 text-white px-3 py-1 rounded-xl text-xs font-semibold shadow-sm">
          {categorie?.nom || 'Événement'}
        </div>
      </div>

      {/* Contenu textuel */}
      <div className="p-5 flex flex-col justify-between min-h-[220px]">
        <div>
          {/* Titre */}
          <h3 className="font-bold text-slate-800 text-base mb-2 group-hover:text-amber-600 transition-colors line-clamp-1 title-case">
            {event.titre}
          </h3>

          {/* Description condensée (Évite de casser la grille) */}
          <p className="text-xs text-slate-400 line-clamp-2 mb-4 leading-relaxed">
            {event.description || "Aucune description fournie pour cet événement."}
          </p>

          {/* Métadonnées (Ville, Date, Heure) */}
          <div className="space-y-2.5 text-xs text-slate-600">
            {/* Ville */}
            <div className="flex items-center gap-2">
              <FaMapMarkerAlt className="text-amber-600 size-3.5 shrink-0" />
              <span className="font-medium text-slate-700">{event.ville}</span>
            </div>
            
            {/* Date + Compte à rebours */}
            <div className="flex items-center gap-2 flex-wrap">
              <FaCalendar className="text-amber-600 size-3.5 shrink-0" />
              <span className="capitalize font-medium text-slate-700">{dateFormatted}</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full ${getRelativeTimeBadgeClass()}`}>
                 {relativeTime}
              </span>
            </div>
            
            {/* Heure */}
            <div className="flex items-center gap-2">
              <FaClock className="text-amber-600 size-3.5 shrink-0" />
              <span className="text-slate-500">{heureFormatted || '--:--'}</span>
            </div>
          </div>
        </div>

        {/* Pied de la carte : Prix & Action */}
        <div className="flex justify-between items-center pt-4 mt-4 border-t border-slate-50">
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Prix</span>
            <span className="text-lg font-extrabold text-slate-900">
              {event.prix === 0 ? (
                <span className="text-emerald-600 font-bold">Gratuit</span>
              ) : (
                `${event.prix} DH`
              )}
            </span>
          </div>
          
          <div className="inline-flex items-center gap-1 bg-amber-600 hover:bg-amber-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow-md shadow-amber-600/10 transition-colors">
            <span>Explorer</span>
            <FaChevronRight size={10} className="group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>
      </div>
    </Link>
  )
}

export default EventCard