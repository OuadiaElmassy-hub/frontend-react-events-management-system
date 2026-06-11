// import { useParams, Link, useNavigate } from 'react-router-dom'
// import { useState, useEffect } from 'react'
// import { 
//   FaCalendar, 
//   FaMapMarkerAlt, 
//   FaEuroSign, 
//   FaStar, 
//   FaTicketAlt, 
//   FaArrowLeft, 
//   FaClock, 
//   FaUsers 
// } from 'react-icons/fa'

// // Mock data - remplace par fetch API
// const mockEvent = {
//   id: 1,
//   titre: 'Concert Rock Legends - Tournée 2026',
//   lieu: 'Accor Arena, Paris',
//   adresse: '8 Bd de Bercy, 75012 Paris',
//   date: '15 Décembre 2025',
//   heure: '20h00',
//   prix: 89,
//   note: '4.8',
//   nbAvis: 342,
//   categorie: 'Concert',
//   image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200',
//   placesDispo: 450,
//   description: `Plongez dans une soirée légendaire avec les plus grands noms du rock réunis sur une même scène.

// Le groupe mythique "ThunderStrike" revient pour une tournée exceptionnelle après 10 ans d'absence. Accompagnés des invités spéciaux "Steel Phoenix" et "Crimson Echo", ils vous feront revivre 3 heures de classiques incontournables.

// Au programme :
// - Ouverture des portes : 18h30
// - Première partie : Steel Phoenix - 19h00
// - Crimson Echo - 20h00
// - ThunderStrike - 21h00

// Vivez une expérience sonore unique avec un système audio dernière génération, des jeux de lumière spectaculaires et des écrans LED géants.

// L'Accor Arena sera configurée en fosse + gradins pour une ambiance électrique. Food trucks et bars disponibles sur place.

// Points forts :
// • Setlist de 25 titres incluant tous les classiques
// • Effets pyrotechniques et show laser
// • Merchandising officiel disponible
// • Accès PMR prévu
// • Vestiaire surveillé

// Conditions d'accès :
// - Billet nominatif, pièce d'identité obligatoire
// - Contrôle de sécurité renforcé à l'entrée
// - Objets interdits : bouteilles, parapluies, appareils photo pro
// - Enfants de moins de 12 ans non recommandés

// Ne manquez pas cet événement unique. Les places sont limitées et partent très vite. Réservez maintenant pour garantir votre accès à cette soirée historique.

// Transport : Métro ligne 14 et 6 - Station Bercy. Parking payant disponible sous l'Arena.

// Pour toute question : contact@rocklegends-tour.com`,
//   organisateur: 'Live Nation France'
// }

// const EventDetail = () => {
//   const { id } = useParams()
//   const [qty, setQty] = useState(1)

//   // Ici tu fetch l'event avec l'id : useEffect(() => fetch(...), [id])
//   const event = mockEvent

//   const handleReserve = () => {
//     console.log('Réservation:', { eventId: id, qty, total: event.prix * qty })
//     // Redirection vers page paiement ou modal
//     alert(`Réservation de ${qty} place(s) pour ${event.prix * qty}€`)
//   }

//   return (
//     <div className="min-h-screen bg-gray-50">
//       {/* Header image */}
//       <div className="relative h-96">
//         <img
//           src={event.image}
//           alt={event.titre}
//           className="w-full h-full object-cover"
//         />
//         <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />

//         <Link
//           to="/"
//           className="absolute top-6 left-6 bg-white/90 hover:bg-white text-gray-900 px-4 py-2 rounded-lg flex items-center gap-2 transition"
//         >
//           <FaArrowLeft /> Retour
//         </Link>

//         <div className="absolute bottom-6 left-6 right-6 text-white">
//           <div className="max-w-7xl mx-auto">
//             <span className="bg-blue-600 px-3 py-1 rounded-full text-sm font-semibold">
//               {event.categorie}
//             </span>
//             <h1 className="text-4xl lg:text-5xl font-bold mt-3 mb-2">{event.titre}</h1>
//             <div className="flex items-center gap-4 text-lg">
//               <div className="flex items-center gap-2">
//                 <FaStar className="text-yellow-400" />
//                 <span>{event.note}</span>
//                 <span className="text-gray-300">({event.nbAvis} avis)</span>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Content */}
//       <div className="max-w-7xl mx-auto px-6 py-8">
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

//           {/* Colonne gauche - Infos + Description */}
//           <div className="lg:col-span-2 space-y-6">

//             {/* Infos rapides */}
//             <div className="bg-white rounded-lg shadow p-6">
//               <h2 className="text-xl font-bold mb-4">Informations</h2>
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <div className="flex items-start gap-3">
//                   <FaCalendar className="text-blue-600 mt-1" />
//                   <div>
//                     <p className="text-sm text-gray-600">Date</p>
//                     <p className="font-semibold">{event.date}</p>
//                   </div>
//                 <div className="flex items-start gap-3">
//                   <FaClock className="text-blue-600 mt-1" />
//                   <div>
//                     <p className="text-sm text-gray-600">Heure</p>
//                     <p className="font-semibold">{event.heure}</p>
//                   </div>
//                 </div>
//                 <div className="flex items-start gap-3">
//                   <FaMapMarkerAlt className="text-blue-600 mt-1" />
//                   <div>
//                     <p className="text-sm text-gray-600">Lieu</p>
//                     <p className="font-semibold">{event.lieu}</p>
//                     <p className="text-sm text-gray-500">{event.adresse}</p>
//                   </div>
//                 <div className="flex items-start gap-3">
//                   <FaUsers className="text-blue-600 mt-1" />
//                   <div>
//                     <p className="text-sm text-gray-600">Places disponibles</p>
//                     <p className="font-semibold">{event.placesDispo} places</p>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* Description scrollable */}
//             <div className="bg-white rounded-lg shadow p-6">
//               <h2 className="text-xl font-bold mb-4">Description</h2>
//               <div className="max-h-96 overflow-y-auto pr-4 text-gray-700 leading-relaxed whitespace-pre-line scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
//                 {event.description}
//               </div>
//             </div>

//             {/* Organisateur */}
//             <div className="bg-white rounded-lg shadow p-6">
//               <h2 className="text-xl font-bold mb-3">Organisateur</h2>
//               <p className="text-gray-700">{event.organisateur}</p>
//             </div>
//           </div>

//           {/* Colonne droite - Card Réservation Sticky */}
//           <div className="lg:col-span-1">
//             <div className="bg-white rounded-lg shadow-lg p-6 sticky top-24">
//               <div className="flex items-baseline gap-2 mb-4">
//                 <span className="text-4xl font-bold text-blue-600">{event.prix}€</span>
//                 <span className="text-gray-500">/ personne</span>
//               </div>

//               <div className="space-y-4 mb-6">
//                 <div>
//                   <label className="block text-sm font-semibold text-gray-700 mb-2">
//                     Quantité
//                   </label>
//                   <select
//                     value={qty}
//                     onChange={(e) => setQty(Number(e.target.value))}
//                     className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
//                   >
//                     {[1,2,3,4,5,6,7,8].map(n => (
//                       <option key={n} value={n}>{n} billet{n > 1? 's' : ''}</option>
//                     ))}
//                   </select>
//                 </div>

//                 <div className="border-t pt-4">
//                   <div className="flex justify-between text-gray-600 mb-2">
//                     <span>Sous-total</span>
//                     <span>{event.prix * qty}€</span>
//                   </div>
//                   <div className="flex justify-between text-gray-600 mb-2">
//                     <span>Frais de service</span>
//                     <span>5€</span>
//                   </div>
//                   <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t">
//                     <span>Total</span>
//                     <span>{event.prix * qty + 5}€</span>
//                   </div>
//                 </div>
//               </div>

//               <button
//                 onClick={handleReserve}
//                 className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition"
//               >
//                 <FaTicketAlt /> Réserver maintenant
//               </button>

//               <p className="text-xs text-gray-500 text-center mt-3">
//                 Paiement sécurisé • Annulation gratuite jusqu'à 48h avant
//               </p>
//             </div>
//           </div>
//         </div>
//        </div>
//       </div>
//       </div>
//     </div>
//   )
// }

// export default EventDetail

import { useParams, Link, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import {
  FaCalendar, FaMapMarkerAlt, FaStar, FaTicketAlt,
  FaArrowLeft, FaClock, FaUsers, FaRegStar, FaStarHalfAlt,
  FaShareAlt, FaHeart, FaRegHeart, FaBuilding
} from 'react-icons/fa'
import { getEventById } from '../services/eventService'
import { getAvisByEvent } from '../services/avisService'
import { useAuth } from '../context/AuthContext'

const API_BASE_URL = 'http://localhost:8080'

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatDate = (iso) => {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  })
}

const formatHeure = (iso) => {
  if (!iso) return ''
  return new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}

const StarRating = ({ note }) => {
  const stars = []
  for (let i = 1; i <= 5; i++) {
    if (i <= Math.floor(note)) stars.push(<FaStar key={i} className="text-yellow-400" size={14} />)
    else if (i - note < 1) stars.push(<FaStarHalfAlt key={i} className="text-yellow-400" size={14} />)
    else stars.push(<FaRegStar key={i} className="text-yellow-300" size={14} />)
  }
  return <div className="flex items-center gap-0.5">{stars}</div>
}

const InfoItem = ({ icon, label, value, sub }) => (
  <div className="flex items-start gap-3">
    <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center shrink-0 mt-0.5">
      <span className="text-blue-600">{icon}</span>
    </div>
    <div>
      <p className="text-xs text-gray-400 mb-0.5">{label}</p>
      <p className="text-sm font-semibold text-gray-900">{value}</p>
      {sub && <p className="text-xs text-gray-500 mt-0.5">{sub}</p>}
    </div>
  </div>
)

// ─── Skeleton ─────────────────────────────────────────────────────────────────
const Skeleton = () => (
  <div className="animate-pulse">
    <div className="h-80 bg-gray-200 w-full" />
    <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-4">
        <div className="h-8 bg-gray-200 rounded w-3/4" />
        <div className="h-4 bg-gray-200 rounded w-1/2" />
        <div className="h-48 bg-gray-200 rounded-2xl" />
      </div>
      <div className="h-64 bg-gray-200 rounded-2xl" />
    </div>
  </div>
)

// ─── EventDetail ──────────────────────────────────────────────────────────────
const EventDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [event, setEvent] = useState(null)
  const [avis, setAvis] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingAvis, setLoadingAvis] = useState(true)
  const [qty, setQty] = useState(1)
  const [liked, setLiked] = useState(false)
  const [showFullDesc, setShowFullDesc] = useState(false)

  // Fetch event
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true)
        const data = await getPublishedEventById(id)
        setEvent(data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchEvent()
  }, [id])

  // Fetch avis
  useEffect(() => {
    const fetchAvis = async () => {
      try {
        setLoadingAvis(true)
        const data = await getListAvisByEventId(id)
        setAvis(data || [])
      } catch (err) {
        console.error(err)
        setAvis([])
      } finally {
        setLoadingAvis(false)
      }
    }
    fetchAvis()
  }, [id])

  const handleReserve = () => {
    if (!user) {
      navigate(`/login?redirect=/events/${id}`)
      return
    }
    navigate(`/reservation/${id}?qty=${qty}`)
  }

  if (loading) return <Skeleton />
  if (!event) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <p className="text-gray-500 text-lg mb-4">Événement introuvable</p>
        <Link to="/events" className="text-blue-600 hover:underline">← Retour aux événements</Link>
      </div>
    </div>
  )

  const total = event.prix * qty
  const fraisService = 5
  const moyenneAvis = avis.length
    ? (avis.reduce((acc, a) => acc + a.note, 0) / avis.length).toFixed(1)
    : null

  const descPreview = event.description?.slice(0, 400)
  const hasMore = event.description?.length > 400

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Hero image ── */}
      <div className="relative h-80 md:h-96 overflow-hidden">
        <img
          src={event.imageUrl ? `${API_BASE_URL}${event.imageUrl}` : 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200'}
          alt={event.titre}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {/* Actions top */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 bg-white/90 backdrop-blur-sm hover:bg-white text-gray-900 text-sm px-3.5 py-2 rounded-xl transition-all shadow-sm"
          >
            <FaArrowLeft size={12} /> Retour
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigator.share?.({ title: event.titre, url: window.location.href })}
              className="w-9 h-9 bg-white/90 backdrop-blur-sm hover:bg-white text-gray-700 rounded-xl flex items-center justify-center shadow-sm transition-all"
              aria-label="Partager"
            >
              <FaShareAlt size={13} />
            </button>
            <button
              onClick={() => setLiked(l => !l)}
              className="w-9 h-9 bg-white/90 backdrop-blur-sm hover:bg-white rounded-xl flex items-center justify-center shadow-sm transition-all"
              aria-label="Sauvegarder"
            >
              {liked
                ? <FaHeart size={13} className="text-red-500" />
                : <FaRegHeart size={13} className="text-gray-700" />}
            </button>
          </div>
        </div>

        {/* Titre sur l'image */}
        <div className="absolute bottom-5 left-5 right-5">
          <div className="max-w-7xl mx-auto">
            <span className="inline-block bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-semibold mb-2">
              {event.categorie?.nom ?? event.categorie ?? 'Événement'}
            </span>
            <h1 className="text-2xl md:text-4xl font-bold text-white leading-tight mb-2">
              {event.titre}
            </h1>
            {moyenneAvis && (
              <div className="flex items-center gap-2">
                <StarRating note={Number(moyenneAvis)} />
                <span className="text-white text-sm font-medium">{moyenneAvis}</span>
                <span className="text-white/60 text-sm">({avis.length} avis)</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Contenu ── */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ── Colonne gauche ── */}
          <div className="lg:col-span-2 space-y-5">

            {/* Infos rapides */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-base font-bold text-gray-900 mb-4">Informations</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InfoItem
                  icon={<FaCalendar size={14} />}
                  label="Date"
                  value={formatDate(event.dateDebut)}
                />
                <InfoItem
                  icon={<FaClock size={14} />}
                  label="Heure"
                  value={`${formatHeure(event.dateDebut)}${event.dateFin ? ` → ${formatHeure(event.dateFin)}` : ''}`}
                />
                <InfoItem
                  icon={<FaMapMarkerAlt size={14} />}
                  label="Lieu"
                  value={event.ville}
                  sub={event.adresse}
                />
                <InfoItem
                  icon={<FaUsers size={14} />}
                  label="Places disponibles"
                  value={event.placesDisponibles != null ? `${event.placesDisponibles} places` : 'Illimitées'}
                />
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-base font-bold text-gray-900 mb-3">Description</h2>
              <div className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                {showFullDesc ? event.description : descPreview}
                {hasMore && !showFullDesc && '…'}
              </div>
              {hasMore && (
                <button
                  onClick={() => setShowFullDesc(v => !v)}
                  className="mt-3 text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  {showFullDesc ? 'Voir moins ↑' : 'Lire la suite ↓'}
                </button>
              )}
            </div>

            {/* Organisateur */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-base font-bold text-gray-900 mb-3">Organisateur</h2>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                  <FaBuilding className="text-blue-600" size={16} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {event.organisateur?.nom ?? event.organisateur ?? 'Organisateur'}
                  </p>
                  <p className="text-xs text-gray-400">Organisateur vérifié</p>
                </div>
              </div>
            </div>

            {/* Avis */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-gray-900">
                  Avis {avis.length > 0 && <span className="text-gray-400 font-normal text-sm">({avis.length})</span>}
                </h2>
                {moyenneAvis && (
                  <div className="flex items-center gap-2">
                    <StarRating note={Number(moyenneAvis)} />
                    <span className="text-sm font-bold text-gray-900">{moyenneAvis} / 5</span>
                  </div>
                )}
              </div>

              {loadingAvis ? (
                <div className="space-y-3">
                  {[1,2,3].map(i => (
                    <div key={i} className="animate-pulse flex gap-3">
                      <div className="w-9 h-9 rounded-full bg-gray-200 shrink-0" />
                      <div className="flex-1 space-y-2">
                        <div className="h-3 bg-gray-200 rounded w-1/4" />
                        <div className="h-3 bg-gray-200 rounded w-3/4" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : avis.length === 0 ? (
                <div className="text-center py-8">
                  <FaRegStar className="text-gray-200 mx-auto mb-2" size={32} />
                  <p className="text-sm text-gray-400">Aucun avis pour le moment</p>
                  {user && (
                    <p className="text-xs text-gray-300 mt-1">Soyez le premier à laisser un avis après l'événement</p>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {avis.map((a) => (
                    <div key={a.id} className="flex gap-3">
                      {/* Avatar */}
                      <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center shrink-0 text-blue-700 text-sm font-bold">
                        {a.utilisateur?.nom?.charAt(0).toUpperCase() ?? 'U'}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm font-semibold text-gray-900">
                            {a.utilisateur?.nom ?? 'Anonyme'}
                          </p>
                          <span className="text-[11px] text-gray-400">
                            {a.createdAt ? new Date(a.createdAt).toLocaleDateString('fr-FR') : ''}
                          </span>
                        </div>
                        <StarRating note={a.note} />
                        {a.commentaire && (
                          <p className="text-sm text-gray-600 mt-1.5 leading-relaxed">{a.commentaire}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* ── Colonne droite — sticky ── */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sticky top-24">

              {/* Prix */}
              <div className="flex items-baseline gap-2 mb-5">
                <span className="text-3xl font-bold text-blue-600">{event.prix} DH</span>
                <span className="text-sm text-gray-400">/ personne</span>
              </div>

              {/* Quantité */}
              <div className="mb-4">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">
                  Nombre de billets
                </label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQty(q => Math.max(1, q - 1))}
                    className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors font-bold"
                  >
                    −
                  </button>
                  <span className="text-lg font-bold text-gray-900 w-8 text-center">{qty}</span>
                  <button
                    onClick={() => setQty(q => Math.min(8, q + 1))}
                    className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors font-bold"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Récap prix */}
              <div className="bg-gray-50 rounded-xl p-4 mb-5 space-y-2">
                <div className="flex justify-between text-sm text-gray-500">
                  <span>{event.prix} DH × {qty}</span>
                  <span>{total} DH</span>
                </div>
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Frais de service</span>
                  <span>{fraisService} DH</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-gray-900 pt-2 border-t border-gray-200">
                  <span>Total</span>
                  <span className="text-blue-600">{total + fraisService} DH</span>
                </div>
              </div>

              {/* Bouton réserver */}
              <button
                onClick={handleReserve}
                disabled={event.placesDisponibles === 0}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
              >
                <FaTicketAlt size={14} />
                {event.placesDisponibles === 0 ? 'Complet' : 'Réserver maintenant'}
              </button>

              {!user && (
                <p className="text-xs text-center text-gray-400 mt-2">
                  <Link to={`/login?redirect=/events/${id}`} className="text-blue-500 hover:underline">
                    Connectez-vous
                  </Link>{' '}
                  pour réserver
                </p>
              )}

              <p className="text-[11px] text-gray-400 text-center mt-3 leading-relaxed">
                🔒 Paiement sécurisé · Annulation gratuite jusqu'à 48h avant
              </p>

              {/* Places restantes */}
              {event.placesDisponibles != null && event.placesDisponibles <= 20 && event.placesDisponibles > 0 && (
                <div className="mt-3 flex items-center gap-2 bg-orange-50 border border-orange-100 rounded-xl px-3 py-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse shrink-0" />
                  <p className="text-xs text-orange-600 font-medium">
                    Plus que {event.placesDisponibles} place{event.placesDisponibles > 1 ? 's' : ''} disponible{event.placesDisponibles > 1 ? 's' : ''} !
                  </p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

export default EventDetail