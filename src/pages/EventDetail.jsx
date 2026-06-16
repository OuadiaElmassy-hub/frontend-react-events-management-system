// import { useParams, Link, useNavigate } from 'react-router-dom'
// import { useState, useEffect, useRef } from 'react'
// import {
//   FaCalendar, FaMapMarkerAlt, FaStar, FaTicketAlt,
//   FaArrowLeft, FaClock, FaUsers, FaRegStar, FaStarHalfAlt,
//   FaShareAlt, FaHeart, FaRegHeart, FaBuilding
// } from 'react-icons/fa'
// import { getPublishedEventById } from '../services/eventService'
// import { getListAvisByEventId } from '../services/avisService'
// import { useAuth } from '../context/AuthContext'

// const API_BASE_URL = 'http://localhost:8080'

// // ─── Helpers ──────────────────────────────────────────────────────────────────
// const formatDate = (iso) => {
//   if (!iso) return ''
//   return new Date(iso).toLocaleDateString('fr-FR', {
//     weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
//   })
// }

// const formatHeure = (iso) => {
//   if (!iso) return ''
//   return new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
// }

// const StarRating = ({ note }) => {
//   const stars = []
//   for (let i = 1; i <= 5; i++) {
//     if (i <= Math.floor(note)) stars.push(<FaStar key={i} className="text-yellow-400" size={14} />)
//     else if (i - note < 1) stars.push(<FaStarHalfAlt key={i} className="text-yellow-400" size={14} />)
//     else stars.push(<FaRegStar key={i} className="text-yellow-300" size={14} />)
//   }
//   return <div className="flex items-center gap-0.5">{stars}</div>
// }

// const InfoItem = ({ icon, label, value, sub }) => (
//   <div className="flex items-start gap-3">
//     <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center shrink-0 mt-0.5">
//       <span className="text-blue-600">{icon}</span>
//     </div>
//     <div>
//       <p className="text-xs text-gray-400 mb-0.5">{label}</p>
//       <p className="text-sm font-semibold text-gray-900">{value}</p>
//       {sub && <p className="text-xs text-gray-500 mt-0.5">{sub}</p>}
//     </div>
//   </div>
// )

// // ─── Skeleton ─────────────────────────────────────────────────────────────────
// const Skeleton = () => (
//   <div className="animate-pulse">
//     <div className="h-80 bg-gray-200 w-full" />
//     <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
//       <div className="lg:col-span-2 space-y-4">
//         <div className="h-8 bg-gray-200 rounded w-3/4" />
//         <div className="h-4 bg-gray-200 rounded w-1/2" />
//         <div className="h-48 bg-gray-200 rounded-2xl" />
//       </div>
//       <div className="h-64 bg-gray-200 rounded-2xl" />
//     </div>
//   </div>
// )

// // ─── EventDetail ──────────────────────────────────────────────────────────────
// const EventDetail = () => {
//   const { id } = useParams()
//   const navigate = useNavigate()
//   const { user } = useAuth()

//   // ── States à ajouter / remplacer ──
  
//   const [avis, setAvis] = useState([])
//   const [avisPage, setAvisPage] = useState(0)
//   const [avisTotalPages, setAvisTotalPages] = useState(0)
//   const [avisTotalElements, setAvisTotalElements] = useState(0)
//   const [loadingAvis, setLoadingAvis] = useState(true)
//   const AVIS_SIZE = 5

//   const [event, setEvent] = useState(null)

//   const [loading, setLoading] = useState(true)
//   const [qty, setQty] = useState(1)
//   const [liked, setLiked] = useState(false)
//   const [showFullDesc, setShowFullDesc] = useState(false)

//   // clients map : { [clientId]: { nom, avatar... } }
  
//   const [clientsMap, setClientsMap] = useState({})

//   // Galerie
  
//   const [gallerieIndex, setGallerieIndex] = useState(0)
//   const intervalRef = useRef(null)
    

//   // Fetch event
//   useEffect(() => {
//     const fetchEvent = async () => {
//       try {
//         setLoading(true)
//         const data = await getPublishedEventById(id)
//         setEvent(data)
//       } catch (err) {
//         console.error(err)
//       } finally {
//         setLoading(false)
//       }
//     }
//     fetchEvent()
//   }, [id])

//   // Fetch avis
//   // ── useEffect avis avec pagination backend ──
  
//   useEffect(() => {
//     const fetchAvis = async () => {
//       try {
//         setLoadingAvis(true)
//         const data = await getListAvisByEventId(id, avisPage, AVIS_SIZE)
//         setAvis(data.content || [])
//         setAvisTotalPages(data.totalPages || 0)
//         setAvisTotalElements(data.totalElements || 0)

//         // Fetch les infos clients non encore chargés
//         const newIds = (data.content || [])
//           .map(a => a.clientId)
//           .filter(cid => cid && !clientsMap[cid])

//         if (newIds.length > 0) {
//           const results = await Promise.allSettled(
//             newIds.map(cid => getClientById(cid))
//           )
//           const newClients = {}
//           newIds.forEach((cid, i) => {
//             if (results[i].status === 'fulfilled') {
//               newClients[cid] = results[i].value
//             }
//           })
//           setClientsMap(prev => ({ ...prev, ...newClients }))
//         }
//       } catch (err) {
//         console.error(err)
//         setAvis([])
//       } finally {
//         setLoadingAvis(false)
//       }
//     }
//     fetchAvis()
//   }, [id, avisPage])
  
//   // ── Galerie auto-slide ──

//   useEffect(() => {
//     if (!event?.images?.length) return
//     intervalRef.current = setInterval(() => {
//       setGallerieIndex(i => (i + 1) % event.images.length)
//     }, 4000)
//     return () => clearInterval(intervalRef.current)
//   }, [event])

//   const goTo = (index) => {
//     clearInterval(intervalRef.current)
//     setGallerieIndex(index)
//     // Reprend l'auto-slide après navigation manuelle
//     intervalRef.current = setInterval(() => {
//       setGallerieIndex(i => (i + 1) % event.images.length)
//     }, 4000)
//   }

//   const handleReserve = () => {
//     if (!user) {
//       navigate(`/login?redirect=/events/${id}`)
//       return
//     }
//     navigate(`/reservation/${id}?qty=${qty}`)
//   }

//   if (loading) return <Skeleton />
//   if (!event) return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-50">
//       <div className="text-center">
//         <p className="text-gray-500 text-lg mb-4">Événement introuvable</p>
//         <Link to="/events" className="text-blue-600 hover:underline">← Retour aux événements</Link>
//       </div>
//     </div>
//   )

//   const total = event.prix * qty
//   const fraisService = 5
//   const moyenneAvis = avis.length
//     ? (avis.reduce((acc, a) => acc + a.note, 0) / avis.length).toFixed(1)
//     : null

//   const descPreview = event.description?.slice(0, 400)
//   const hasMore = event.description?.length > 400

//   return (
//     <div className="min-h-screen bg-gray-50">

//       {/* ── Hero image ── */}
//       <div className="relative h-80 md:h-96 overflow-hidden">
//         {/* Images */}
//         {event.images?.length > 0 ? (
//           <>
//             {event.images.map((url, i) => (
//               <img
//                 key={i}
//                 src={`${API_BASE_URL}${url}`}
//                 alt={`${event.titre} - photo ${i + 1}`}
//                 className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
//                   i === gallerieIndex ? 'opacity-100' : 'opacity-0'
//                 }`}
//               />
//             ))}

//             {/* Flèches navigation manuelle */}
//             {event.images.length > 1 && (
//               <>
//                 <button
//                   onClick={() => goTo((gallerieIndex - 1 + event.images.length) % event.images.length)}
//                   className="absolute left-4 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center transition-all z-10"
//                   aria-label="Image précédente"
//                 >
//                   <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M15 18l-6-6 6-6"/></svg>
//                 </button>
//                 <button
//                   onClick={() => goTo((gallerieIndex + 1) % event.images.length)}
//                   className="absolute right-4 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center transition-all z-10"
//                   aria-label="Image suivante"
//                 >
//                   <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>
//                 </button>

//                 {/* Dots */}
//                 <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
//                   {event.images.map((_, i) => (
//                     <button
//                       key={i}
//                       onClick={() => goTo(i)}
//                       className={`rounded-full transition-all ${
//                         i === gallerieIndex
//                           ? 'w-5 h-1.5 bg-white'
//                           : 'w-1.5 h-1.5 bg-white/50 hover:bg-white/80'
//                       }`}
//                       aria-label={`Photo ${i + 1}`}
//                     />
//                   ))}
//                 </div>

//                 {/* Compteur */}
//                 <div className="absolute top-4 right-16 bg-black/40 text-white text-xs px-2.5 py-1 rounded-full z-10">
//                   {gallerieIndex + 1} / {event.images.length}
//                 </div>
//               </>
//             )}
//           </>
//         ) : (
//           <img
//             src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200"
//             alt={event.titre}
//             className="w-full h-full object-cover"
//           />
//         )}
//         <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

//         {/* Actions top */}
//         <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
//           <button
//             onClick={() => navigate(-1)}
//             className="flex items-center gap-2 bg-white/90 backdrop-blur-sm hover:bg-white text-gray-900 text-sm px-3.5 py-2 rounded-xl transition-all shadow-sm"
//           >
//             <FaArrowLeft size={12} /> Retour
//           </button>
//           <div className="flex items-center gap-2">
//             <button
//               onClick={() => navigator.share?.({ title: event.titre, url: window.location.href })}
//               className="w-9 h-9 bg-white/90 backdrop-blur-sm hover:bg-white text-gray-700 rounded-xl flex items-center justify-center shadow-sm transition-all"
//               aria-label="Partager"
//             >
//               <FaShareAlt size={13} />
//             </button>
//             <button
//               onClick={() => setLiked(l => !l)}
//               className="w-9 h-9 bg-white/90 backdrop-blur-sm hover:bg-white rounded-xl flex items-center justify-center shadow-sm transition-all"
//               aria-label="Sauvegarder"
//             >
//               {liked
//                 ? <FaHeart size={13} className="text-red-500" />
//                 : <FaRegHeart size={13} className="text-gray-700" />}
//             </button>
//           </div>
//         </div>

//         {/* Titre sur l'image */}
//         <div className="absolute bottom-5 left-5 right-5">
//           <div className="max-w-7xl mx-auto">
//             <span className="inline-block bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-semibold mb-2">
//               {event.categorie?.nom ?? event.categorie ?? 'Événement'}
//             </span>
//             <h1 className="text-2xl md:text-4xl font-bold text-white leading-tight mb-2">
//               {event.titre}
//             </h1>
//             {moyenneAvis && (
//               <div className="flex items-center gap-2">
//                 <StarRating note={Number(moyenneAvis)} />
//                 <span className="text-white text-sm font-medium">{moyenneAvis}</span>
//                 <span className="text-white/60 text-sm">({avis.length} avis)</span>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* ── Contenu ── */}
//       <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

//           {/* ── Colonne gauche ── */}
//           <div className="lg:col-span-2 space-y-5">

//             {/* Infos rapides */}
//             <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
//               <h2 className="text-base font-bold text-gray-900 mb-4">Informations</h2>
//               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                 <InfoItem
//                   icon={<FaCalendar size={14} />}
//                   label="Date"
//                   value={formatDate(event.dateDebut)}
//                 />
//                 {/* Après — sépare en deux lignes si dateFin existe */}
//                 <InfoItem
//                   icon={<FaClock size={14} />}
//                   label="Horaires"
//                   value={`${formatHeure(event.dateDebut)} → ${event.dateFin ? formatHeure(event.dateFin) : '?'}`}
//                   sub={event.dateFin && formatDate(event.dateFin) !== formatDate(event.dateDebut)
//                     ? `Fin le ${formatDate(event.dateFin)}`
//                     : null}
//                 />
//                 <InfoItem
//                   icon={<FaMapMarkerAlt size={14} />}
//                   label="Lieu"
//                   value={event.ville}
//                   sub={event.lieuSpecifique}
//                 />
//                 <InfoItem
//                   icon={<FaUsers size={14} />}
//                   label="Places disponibles"
//                   value={event.placesDisponibles != null ? `${event.placesDisponibles} places` : 'Illimitées'}
//                 />
//               </div>
//             </div>

//             {/* Description */}
//             <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
//               <h2 className="text-base font-bold text-gray-900 mb-3">Description</h2>
//               <div className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
//                 {showFullDesc ? event.description : descPreview}
//                 {hasMore && !showFullDesc && '…'}
//               </div>
//               {hasMore && (
//                 <button
//                   onClick={() => setShowFullDesc(v => !v)}
//                   className="mt-3 text-sm text-blue-600 hover:text-blue-700 font-medium"
//                 >
//                   {showFullDesc ? 'Voir moins ↑' : 'Lire la suite ↓'}
//                 </button>
//               )}
//             </div>

//             {/* Organisateur */}
//             <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
//               <h2 className="text-base font-bold text-gray-900 mb-3">Organisateur</h2>
//               <div className="flex items-center gap-3">
//                 <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
//                   <FaBuilding className="text-blue-600" size={16} />
//                 </div>
//                 <div>
//                   <p className="text-sm font-semibold text-gray-900">
//                     {event.organisateur?.nom ?? event.organisateur ?? 'Organisateur'}
//                   </p>
//                   <p className="text-xs text-gray-400">Organisateur vérifié</p>
//                 </div>
//               </div>
//             </div>

//             {/* Avis */}
//             <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
//               <div className="flex items-center justify-between mb-4">
//                 <h2 className="text-base font-bold text-gray-900">
//                   Avis {avis.length > 0 && <span className="text-gray-400 font-normal text-sm">({avis.length})</span>}
//                 </h2>
//                 {moyenneAvis && (
//                   <div className="flex items-center gap-2">
//                     <StarRating note={Number(moyenneAvis)} />
//                     <span className="text-sm font-bold text-gray-900">{moyenneAvis} / 5</span>
//                   </div>
//                 )}
//               </div>

//               {loadingAvis ? (
//                 <div className="space-y-3">
//                   {[1,2,3].map(i => (
//                     <div key={i} className="animate-pulse flex gap-3">
//                       <div className="w-9 h-9 rounded-full bg-gray-200 shrink-0" />
//                       <div className="flex-1 space-y-2">
//                         <div className="h-3 bg-gray-200 rounded w-1/4" />
//                         <div className="h-3 bg-gray-200 rounded w-3/4" />
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               ) : avis.length === 0 ? (
//                 <div className="text-center py-8">
//                   <FaRegStar className="text-gray-200 mx-auto mb-2" size={32} />
//                   <p className="text-sm text-gray-400">Aucun avis pour le moment</p>
//                 </div>
//               ) : (
//                 <>
//                   <div className="space-y-4">
//                     {avis.map((a) => {
//                       const client = clientsMap[a.clientId]
//                       const nom = client?.nom ?? client?.prenom ?? `Client #${a.clientId}`
//                       const initiale = nom.charAt(0).toUpperCase()
//                       return (
//                         <div key={a.id} className="flex gap-3">
//                           <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center shrink-0 text-blue-700 text-sm font-bold">
//                             {client?.avatarUrl
//                               ? <img src={`${API_BASE_URL}${client.avatarUrl}`} alt={nom} className="w-full h-full rounded-full object-cover" />
//                               : initiale
//                             }
//                           </div>
//                           <div className="flex-1">
//                             <div className="flex items-center justify-between mb-1">
//                               <p className="text-sm font-semibold text-gray-900">{nom}</p>
//                               <span className="text-[11px] text-gray-400">
//                                 {a.dateAvis ? new Date(a.dateAvis).toLocaleDateString('fr-FR') : ''}
//                               </span>
//                             </div>
//                             <StarRating note={a.note} />
//                             {a.comment && (
//                               <p className="text-sm text-gray-600 mt-1.5 leading-relaxed">{a.comment}</p>
//                             )}
//                           </div>
//                         </div>
//                       )
//                     })}
//                   </div>

//                   {/* Pagination */}
//                   {avisTotalPages > 1 && (
//                     <div className="flex items-center justify-between mt-5 pt-4 border-t border-gray-50">
//                       <button
//                         disabled={avisPage === 0}
//                         onClick={() => setAvisPage(p => p - 1)}
//                         className="text-sm px-3 py-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
//                       >
//                         ← Précédent
//                       </button>

//                       <div className="flex items-center gap-1.5">
//                         {Array.from({ length: avisTotalPages }, (_, i) => (
//                           <button
//                             key={i}
//                             onClick={() => setAvisPage(i)}
//                             className={`w-7 h-7 text-xs rounded-lg transition-colors ${
//                               i === avisPage
//                                 ? 'bg-blue-600 text-white font-semibold'
//                                 : 'text-gray-400 hover:bg-gray-50'
//                             }`}
//                           >
//                             {i + 1}
//                           </button>
//                         ))}
//                       </div>

//                       <button
//                         disabled={avisPage >= avisTotalPages - 1}
//                         onClick={() => setAvisPage(p => p + 1)}
//                         className="text-sm px-3 py-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
//                       >
//                         Suivant →
//                       </button>
//                     </div>
//                   )}

//                   <p className="text-[11px] text-gray-400 text-center mt-2">
//                     {avisPage * AVIS_SIZE + 1}–{Math.min((avisPage + 1) * AVIS_SIZE, avisTotalElements)} sur {avisTotalElements} avis
//                   </p>
//                 </>
//               )}
//             </div>

//           </div>

//           {/* ── Colonne droite — sticky ── */}
//           <div className="lg:col-span-1">
//             <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sticky top-24">

//               {/* Prix */}
//               <div className="flex items-baseline gap-2 mb-5">
//                 <span className="text-3xl font-bold text-blue-600">{event.prix} DH</span>
//                 <span className="text-sm text-gray-400">/ personne</span>
//               </div>

//               {/* Quantité */}
//               <div className="mb-4">
//                 <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">
//                   Nombre de billets
//                 </label>
//                 <div className="flex items-center gap-3">
//                   <button
//                     onClick={() => setQty(q => Math.max(1, q - 1))}
//                     className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors font-bold"
//                   >
//                     −
//                   </button>
//                   <span className="text-lg font-bold text-gray-900 w-8 text-center">{qty}</span>
//                   <button
//                     onClick={() => setQty(q => Math.min(8, q + 1))}
//                     className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors font-bold"
//                   >
//                     +
//                   </button>
//                 </div>
//               </div>

//               {/* Récap prix */}
//               <div className="bg-gray-50 rounded-xl p-4 mb-5 space-y-2">
//                 <div className="flex justify-between text-sm text-gray-500">
//                   <span>{event.prix} DH × {qty}</span>
//                   <span>{total} DH</span>
//                 </div>
//                 <div className="flex justify-between text-sm text-gray-500">
//                   <span>Frais de service</span>
//                   <span>{fraisService} DH</span>
//                 </div>
//                 <div className="flex justify-between text-sm font-bold text-gray-900 pt-2 border-t border-gray-200">
//                   <span>Total</span>
//                   <span className="text-blue-600">{total + fraisService} DH</span>
//                 </div>
//               </div>

//               {/* Bouton réserver */}
//               <button
//                 onClick={handleReserve}
//                 disabled={event.placesDisponibles === 0}
//                 className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
//               >
//                 <FaTicketAlt size={14} />
//                 {event.placesDisponibles === 0 ? 'Complet' : 'Réserver maintenant'}
//               </button>

//               {!user && (
//                 <p className="text-xs text-center text-gray-400 mt-2">
//                   <Link to={`/login?redirect=/events/${id}`} className="text-blue-500 hover:underline">
//                     Connectez-vous
//                   </Link>{' '}
//                   pour réserver
//                 </p>
//               )}

//               <p className="text-[11px] text-gray-400 text-center mt-3 leading-relaxed">
//                 🔒 Paiement sécurisé · Annulation gratuite jusqu'à 48h avant
//               </p>

//               {/* Places restantes */}
//               {event.placesDisponibles != null && event.placesDisponibles <= 20 && event.placesDisponibles > 0 && (
//                 <div className="mt-3 flex items-center gap-2 bg-orange-50 border border-orange-100 rounded-xl px-3 py-2">
//                   <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse shrink-0" />
//                   <p className="text-xs text-orange-600 font-medium">
//                     Plus que {event.placesDisponibles} place{event.placesDisponibles > 1 ? 's' : ''} disponible{event.placesDisponibles > 1 ? 's' : ''} !
//                   </p>
//                 </div>
//               )}
//             </div>
//           </div>

//         </div>
//       </div>
//     </div>
//   )
// }

// export default EventDetail

import { useParams, Link, useNavigate } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import {
  FaCalendar, FaMapMarkerAlt, FaStar, FaTicketAlt,
  FaArrowLeft, FaClock, FaUsers, FaRegStar, FaStarHalfAlt,
  FaShareAlt, FaHeart, FaRegHeart, FaBuilding
} from 'react-icons/fa'
import { getPublishedEventById } from '../services/eventService'
import { getListAvisByEventId } from '../services/avisService'
import { getClientById } from '../services/clientService' // ──✓ Correction 1 : Import ajouté
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
  const [loading, setLoading] = useState(true)
  
  const [avis, setAvis] = useState([])
  const [avisPage, setAvisPage] = useState(0)
  const [avisTotalPages, setAvisTotalPages] = useState(0)
  const [avisTotalElements, setAvisTotalElements] = useState(0)
  const [loadingAvis, setLoadingAvis] = useState(true)
  const AVIS_SIZE = 5

  const [qty, setQty] = useState(1)
  const [ticketType, setTicketType] = useState('NORMALE')
  const [liked, setLiked] = useState(false)
  const [showFullDesc, setShowFullDesc] = useState(false)
  const [clientsMap, setClientsMap] = useState({})
  const [gallerieIndex, setGallerieIndex] = useState(0)
  const intervalRef = useRef(null)

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

  // Fetch avis avec pagination backend
  // useEffect(() => {
  //   const fetchAvis = async () => {
  //     try {
  //       setLoadingAvis(true)
  //       const data = await getListAvisByEventId(id, avisPage, AVIS_SIZE)
  //       setAvis(data.content || [])
  //       setAvisTotalPages(data.totalPages || 0)
  //       setAvisTotalElements(data.totalElements || 0)

  //       // On filtre les nouveaux IDs en se basant sur l'état fonctionnel pour éviter les boucles infinies
  //       setClientsMap(prevMap => {
  //         const newIds = (data.content || [])
  //           .map(a => a.clientId)
  //           .filter(cid => cid && !prevMap[cid])

  //         if (newIds.length > 0) {
  //           // Déclenchement asynchrone pour ne pas bloquer le rendu actuel
  //           Promise.allSettled(newIds.map(cid => getClientById(cid)))
  //             .then(results => {
  //               const newClients = {}
  //               newIds.forEach((cid, i) => {
  //                 if (results[i].status === 'fulfilled') {
  //                   newClients[cid] = results[i].value
  //                 }
  //               });
  //               setClientsMap(prev => ({ ...prev, ...newClients }))
  //             })
  //             // En attendant la réponse de l'API, on garde la map actuelle
  //         }
  //         return prevMap
  //       })

  //     } catch (err) {
  //       console.error(err)
  //       setAvis([])
  //     } finally {
  //       setLoadingAvis(false)
  //     }
  //   }
  //   fetchAvis()
  // }, [id, avisPage])

  useEffect(() => {
  const fetchAvis = async () => {
    try {
      setLoadingAvis(true)
      
      // 1. Appel unique à l'API (qui retourne maintenant le Page<AvisResponseDTO>)
      const data = await getListAvisByEventId(id, avisPage, AVIS_SIZE)
      
      // 2. Hydratation directe des états de pagination et des avis
      setAvis(data.content || [])
      setAvisTotalPages(data.totalPages || 0)
      setAvisTotalElements(data.totalElements || 0)

      // PLUS BESOIN DE : setClientsMap(...), Promise.allSettled, ni de getClientById !
      // Le backend fait le travail de jointure de manière sécurisée en amont.
      
    } catch (err) {
      console.error("Erreur lors de la récupération des avis :", err)
      setAvis([])
    } finally {
      setLoadingAvis(false)
    }
  }

  fetchAvis()
}, [id, avisPage])
  
  // Galerie auto-slide
  useEffect(() => {
    if (!event?.images?.length) return
    intervalRef.current = setInterval(() => {
      setGallerieIndex(i => (i + 1) % event.imagesUrls.length)
    }, 4000)
    return () => clearInterval(intervalRef.current)
  }, [event])

  const goTo = (index) => {
    clearInterval(intervalRef.current)
    setGallerieIndex(index)
    intervalRef.current = setInterval(() => {
      setGallerieIndex(i => (i + 1) % event.imagesUrls.length)
    }, 4000)
  }
  const handleTypeChange = (type) => {
  setTicketType(type)
  const max = type === 'VIP'
    ? event.placesVIPRestantes
    : event.placesRestants - event.placesVIPRestantes
  if (qty > max) setQty(max === 0 ? 0 : max)
}

  const handleReserve = () => {
  navigate(`/paiement/${id}`, { state: { event, qty, ticketType, prixUnitaire } })
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

  const placesNormalesRestantes = event.placesRestants - event.placesVIPRestantes
const placesRestantesPourType = ticketType === 'VIP'
  ? event.placesVIPRestantes
  : placesNormalesRestantes

  const prixUnitaire = ticketType === 'VIP' ? event.prixVIP : event.prix
  const total = prixUnitaire * qty
  const fraisService = 5
  
  
  // ──✓ Correction 2 : Priorité à la note globale du backend, fallback sur les éléments chargés
  const moyenneAvis = event.noteMoyenne 
    ? Number(event.noteMoyenne).toFixed(1)
    : avisTotalElements > 0 && avis.length > 0
      ? (avis.reduce((acc, a) => acc + a.note, 0) / avis.length).toFixed(1)
      : null

  const descPreview = event.description?.slice(0, 400)
  const hasMore = event.description?.length > 400

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Hero image ── */}
      <div className="relative h-80 md:h-96 overflow-hidden">
        {event.imagesUrls?.length > 0 ? (
          <>
            {event.imagesUrls.map((url, i) => (
              <img
                key={i}
                src={`${API_BASE_URL}${url}`}
                alt={`${event.titre} - photo ${i + 1}`}
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
                  i === gallerieIndex ? 'opacity-100' : 'opacity-0'
                }`}
              />
            ))}

            {event.imagesUrls.length > 1 && (
              <>
                <button
                  onClick={() => goTo((gallerieIndex - 1 + event.imagesUrls.length) % event.imagesUrls.length)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center transition-all z-10"
                  aria-label="Image précédente"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M15 18l-6-6 6-6"/></svg>
                </button>
                <button
                  onClick={() => goTo((gallerieIndex + 1) % event.imagesUrls.length)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center transition-all z-10"
                  aria-label="Image suivante"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>
                </button>

                <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                  {event.imagesUrls.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => goTo(i)}
                      className={`rounded-full transition-all ${
                        i === gallerieIndex ? 'w-5 h-1.5 bg-white' : 'w-1.5 h-1.5 bg-white/50 hover:bg-white/80'
                      }`}
                      aria-label={`Photo ${i + 1}`}
                    />
                  ))}
                </div>

                <div className="absolute top-4 right-16 bg-black/40 text-white text-xs px-2.5 py-1 rounded-full z-10">
                  {gallerieIndex + 1} / {event.imagesUrls.length}
                </div>
              </>
            )}
          </>
        ) : (
          <img
            src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200"
            alt={event.titre}
            className="w-full h-full object-cover"
          />
        )}
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
              {liked ? <FaHeart size={13} className="text-red-500" /> : <FaRegHeart size={13} className="text-gray-700" />}
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
                <span className="text-white/60 text-sm">({avisTotalElements} avis)</span>
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
                <InfoItem icon={<FaCalendar size={14} />} label="Date" value={formatDate(event.dateDebut)} />
                <InfoItem
                  icon={<FaClock size={14} />}
                  label="Horaires"
                  value={`${formatHeure(event.dateDebut)} → ${event.dateFin ? formatHeure(event.dateFin) : '?'}`}
                  sub={event.dateFin && formatDate(event.dateFin) !== formatDate(event.dateDebut) ? `Fin le ${formatDate(event.dateFin)}` : null}
                />
                <InfoItem icon={<FaMapMarkerAlt size={14} />} label="Lieu" value={event.ville} sub={event.lieuSpecifique} />
                <InfoItem icon={<FaUsers size={14} />} label="Places disponibles" value={event.placesDisponibles != null ? `${event.placesDisponibles} places` : 'Illimitées'} />
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
                <button onClick={() => setShowFullDesc(v => !v)} className="mt-3 text-sm text-blue-600 hover:text-blue-700 font-medium">
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
                  <p className="text-sm font-semibold text-gray-900">{event.organisateur?.nom ?? event.organisateur ?? 'Organisateur'}</p>
                  <p className="text-xs text-gray-400">Organisateur vérifié</p>
                </div>
              </div>
            </div>

            {/* Avis */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-gray-900">
                  Avis {avisTotalElements > 0 && <span className="text-gray-400 font-normal text-sm">({avisTotalElements})</span>}
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
                  {[1, 2, 3].map(i => (
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
                </div>
              ) : (
                <>
                  <div className="space-y-4">
                    {avis.map((a) => {
                      const nom = a?.nom && a?.prenom
                        ? `${a.nom} ${a.prenom}`
                        : a?.nom ?? a?.prenom ?? `Client #${a.id}`
                      const initiale = nom.charAt(0).toUpperCase()

                      return (
                        <div key={a.id} className="flex gap-3">
                          <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center shrink-0 text-blue-700 text-sm font-bold overflow-hidden">
                            {a?.avatarUrl ? (
                              <img src={`${API_BASE_URL}${a.avatarUrl}`} alt={nom} className="w-full h-full rounded-full object-cover" />
                            ) : initiale}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <p className="text-sm font-semibold text-gray-900">{nom}</p>
                              <span className="text-[11px] text-gray-400">
                                {a.dateAvis ? new Date(a.dateAvis).toLocaleDateString('fr-FR') : ''}
                              </span>
                            </div>
                            <StarRating note={a.note} />
                            {a.comment && <p className="text-sm text-gray-600 mt-1.5 leading-relaxed">{a.comment}</p>}
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {/* Pagination */}
                  {avisTotalPages > 1 && (
                    <div className="flex items-center justify-between mt-5 pt-4 border-t border-gray-50">
                      <button
                        disabled={avisPage === 0}
                        onClick={() => setAvisPage(p => p - 1)}
                        className="text-sm px-3 py-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      >
                        ← Précédent
                      </button>

                      <div className="flex items-center gap-1.5">
                        {Array.from({ length: avisTotalPages }, (_, i) => (
                          <button
                            key={i}
                            onClick={() => setAvisPage(i)}
                            className={`w-7 h-7 text-xs rounded-lg transition-colors ${
                              i === avisPage ? 'bg-blue-600 text-white font-semibold' : 'text-gray-400 hover:bg-gray-50'
                            }`}
                          >
                            {i + 1}
                          </button>
                        ))}
                      </div>

                      <button
                        disabled={avisPage >= avisTotalPages - 1}
                        onClick={() => setAvisPage(p => p + 1)}
                        className="text-sm px-3 py-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      >
                        Suivant →
                      </button>
                    </div>
                  )}

                  <p className="text-[11px] text-gray-400 text-center mt-2">
                    {avisPage * AVIS_SIZE + 1}–{Math.min((avisPage + 1) * AVIS_SIZE, avisTotalElements)} sur {avisTotalElements} avis
                  </p>
                </>
              )}
            </div>
          </div>

          {/* ── Colonne droite — sticky ── */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sticky top-24">
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
    >−</button>
    <span className="text-lg font-bold text-gray-900 w-8 text-center">{qty}</span>
    <button
      onClick={() => setQty(q => Math.min(placesRestantesPourType, q + 1))}
      className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors font-bold"
    >+</button>
  </div>
</div>

{/* Type de billet */}
<div className="mb-4">
  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">
    Type de billet
  </label>
  <div className="flex gap-3">

    {/* NORMALE */}
    <button
      onClick={() => handleTypeChange('NORMALE')}
      disabled={placesNormalesRestantes === 0}
      className={`flex-1 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all ${
        ticketType === 'NORMALE'
          ? 'border-blue-600 bg-blue-50 text-blue-600'
          : placesNormalesRestantes === 0
          ? 'border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed'
          : 'border-gray-200 text-gray-500 hover:border-gray-300'
      }`}
    >
      <p>Normale</p>
      <p className="text-xs font-normal mt-0.5">
        {placesNormalesRestantes === 0
          ? 'Complet'
          : `${placesNormalesRestantes} places`}
      </p>
    </button>

    {/* VIP */}
    <button
      onClick={() => handleTypeChange('VIP')}
      disabled={event.placesVIPRestantes === 0 || event.nbPlaceVIP === 0}
      className={`flex-1 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all ${
        ticketType === 'VIP'
          ? 'border-yellow-500 bg-yellow-50 text-yellow-600'
          : event.placesVIPRestantes === 0 || event.nbPlaceVIP === 0
          ? 'border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed'
          : 'border-gray-200 text-gray-500 hover:border-gray-300'
      }`}
    >
      <p>⭐ VIP</p>
      <p className="text-xs font-normal mt-0.5">
        {event.nbPlaceVIP === 0
          ? 'Non disponible'
          : event.placesVIPRestantes === 0
          ? 'Complet'
          : `${event.placesVIPRestantes} places`}
      </p>
    </button>

  </div>
</div>

              <div className="bg-gray-50 rounded-xl p-4 mb-5 space-y-2">
                <div className="flex justify-between text-sm text-gray-500">
                  <span>{prixUnitaire} DH × {qty}</span>
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
                  <Link to={`/login?redirect=/events/${id}`} className="text-blue-500 hover:underline">Connectez-vous</Link> pour réserver
                </p>
              )}

              <p className="text-[11px] text-gray-400 text-center mt-3 leading-relaxed">🔒 Paiement sécurisé · Annulation gratuite jusqu'à 48h avant</p>

              {event.placesDisponibles != null && event.placesDisponibles <= 20 && event.placesDisponibles > 0 && (
                <div className="mt-3 flex items-center gap-2 bg-orange-50 border border-orange-100 rounded-xl px-3 py-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse shrink-0" />
                  <p className="text-xs text-orange-600 font-medium">Plus que {event.placesDisponibles} place{event.placesDisponibles > 1 ? 's' : ''} disponible{event.placesDisponibles > 1 ? 's' : ''} !</p>
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