import { useState, useRef, useEffect } from 'react'
import { BsStars } from 'react-icons/bs'
import { FaTimes, FaPaperPlane } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'
import { BASE_URL } from '../utils/fetchFn'

// ─── Map catégorie nom → ID (adapter selon ta BDD) ────────────────
const CATEGORIE_ID_MAP = {
  'Concert':     1,
  'Festival':    2,
  'Theatre':     3,
  'Sport':       4,
  'Conference':  5,
  'Art':         6,
  'Comedie':     7,
  'Cinema':      8,
}

const INITIAL_MESSAGES = [
  {
    id: 1,
    text: 'Bonjour ! 👋 Dites-moi ce que vous cherchez et je vous trouve les événements parfaits. Ex : "concert à Casablanca moins de 200 DH"',
    sender: 'bot',
    time: new Date()
  }
]

const SUGGESTIONS = [
  'Concerts à Marrakech',
  'Sport à Casablanca',
  'Budget moins de 100 DH',
  'Festival ce mois',
]

const formatTime = (date) =>
  date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })

// ─── Composant principal ───────────────────────────────────────────
const ChatBot = () => {
  const [isOpen,      setIsOpen]      = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages,    setMessages]    = useState(INITIAL_MESSAGES)
  const [input,       setInput]       = useState('')
  const [isTyping,    setIsTyping]    = useState(false)
  const [unread,      setUnread]      = useState(0)
  const messagesEndRef = useRef(null)
  const inputRef       = useRef(null)
  const navigate       = useNavigate()

  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isOpen, isMinimized, isTyping])

  useEffect(() => {
    if (isOpen && !isMinimized) {
      setUnread(0)
      setTimeout(() => inputRef.current?.focus(), 200)
    }
  }, [isOpen, isMinimized])

  // ── Construire l'URL avec les critères reçus ─────────────────────
  const buildEventsUrl = (criteria) => {
    const params = new URLSearchParams()

    if (criteria.ville)    params.set('ville',      criteria.ville)
    if (criteria.keyword)  params.set('keyword',    criteria.keyword)
    if (criteria.prixMax)  params.set('prixMax',    String(criteria.prixMax))

    if (criteria.categorie) {
      const id = CATEGORIE_ID_MAP[criteria.categorie]
      if (id) params.set('categorieId', String(id))
    }

    params.set('page', '0')
    return `/events?${params.toString()}`
  }

  // ── Envoi du message ─────────────────────────────────────────────
  const sendMessage = async (text) => {
    if (!text.trim() || isTyping) return

    const userMsg = { id: Date.now(), text, sender: 'user', time: new Date() }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setIsTyping(true)

    try {
      const token = localStorage.getItem('token')

      const res = await fetch(`${BASE_URL}/chat/ask`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({ question: text }),
      })

      if (!res.ok) throw new Error(`HTTP ${res.status}`)

      const data = await res.json()
      const criteria = data.criteresUtilises || {}

      setIsTyping(false)

      // CORRECTIF : on se base sur data.hasResults (renvoyé par le backend,
      // calculé à partir du VRAI nombre d'événements trouvés en base) au
      // lieu de déduire "il y a des résultats" simplement parce que des
      // critères ont été extraits. Avant ce correctif, le bot annonçait
      // "Je vous redirige vers les résultats" et naviguait vers une page
      // vide dès que ville/categorie/prixMax étaient non-null, même à
      // 0 résultat réel.
      const hasResults = data.hasResults === true

      const criteresTexte = []
      if (criteria.ville)      criteresTexte.push(`📍 ${criteria.ville}`)
      if (criteria.categorie)  criteresTexte.push(`🎭 ${criteria.categorie}`)
      if (criteria.prixMax)    criteresTexte.push(`💰 max ${criteria.prixMax} DH`)
      if (criteria.keyword)    criteresTexte.push(`🔍 "${criteria.keyword}"`)

      const hasCriteria = criteresTexte.length > 0

      // CORRECTIF : le texte affiché vient maintenant de data.message
      // (construit par le backend, qui connaît le vrai total et peut
      // proposer une suggestion ciblée : "essayez d'augmenter le budget",
      // etc.) dès qu'il n'y a pas de résultat — même si des critères
      // ont bien été reconnus.
      let botText
      if (hasResults && hasCriteria) {
        botText = `J'ai trouvé vos critères : ${criteresTexte.join(' · ')}\n\nJe vous redirige vers les résultats… ✨`
      } else if (data.message) {
        botText = data.message
      } else {
        botText = 'Je n\'ai pas bien compris. Pouvez-vous préciser ? Ex: "concert à Rabat"'
      }

      const botMsg = {
        id:        Date.now() + 1,
        text:      botText,
        sender:    'bot',
        time:      new Date(),
        // CORRECTIF : le lien "Voir les résultats" n'apparaît que si
        // hasResults est vrai, plus seulement si des critères existent.
        targetUrl: hasResults ? buildEventsUrl(criteria) : null,
      }

      setMessages(prev => [...prev, botMsg])
      if (!isOpen || isMinimized) setUnread(n => n + 1)

      // CORRECTIF : on ne navigue automatiquement que s'il y a vraiment
      // des résultats à afficher.
      if (hasResults) {
        setTimeout(() => {
          navigate(buildEventsUrl(criteria))
        }, 1200)
      }

    } catch (err) {
      setIsTyping(false)
      
      let errorText = 'Désolé, problème technique. 🔧'
      if (err.message.includes('401')) errorText = 'Session expirée. Reconnectez-vous. 🔐'
      else if (err.message.includes('404')) errorText = 'Service introuvable. ⚠️'
      else if (err.message.includes('500')) errorText = 'Erreur serveur. Réessayez plus tard. 🛠️'
      else if (err.message.includes('503')) errorText = 'Service IA temporairement indisponible. Réessayez dans un instant. 🤖'
      
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        text: errorText,
        sender: 'bot',
        time: new Date()
      }])
    }
  }

  const handleSend = (e) => {
    e.preventDefault()
    sendMessage(input)
  }

  return (
    <>
      {/* ── Bouton flottant (Ambre Authentique) ────────────────── */}
      {!isOpen && (
        <button
          onClick={() => { setIsOpen(true); setIsMinimized(false); setUnread(0) }}
          aria-label="Ouvrir l'assistant"
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2
                     bg-[#D97706] hover:bg-[#C2410C] text-white pl-4 pr-5
                     py-3 rounded-full shadow-lg transition-all
                     hover:scale-105 active:scale-95"
        >
          <BsStars size={18} />
          <span className="text-sm font-semibold">Recherche IA</span>
          {unread > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500
                             text-white text-[10px] font-bold rounded-full
                             flex items-center justify-center animate-pulse">
              {unread}
            </span>
          )}
        </button>
      )}

      {/* ── Fenêtre de chat ─────────────────────────────────────── */}
      {isOpen && (
        <div
          className={`fixed bottom-6 right-6 z-50 w-[360px]
                      max-w-[calc(100vw-2rem)] bg-white rounded-2xl
                      shadow-2xl flex flex-col overflow-hidden
                      transition-all duration-300
                      ${isMinimized ? 'h-14' : 'h-[500px]'}`}
          style={{ border: '1px solid #F0E6d8' }}
        >
          {/* Header (Bleu Profond Marocain) */}
          <div className="flex items-center justify-between px-4 py-3
                          bg-[#0F4C81] shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#D97706]
                              flex items-center justify-center">
                <BsStars size={15} className="text-white" />
              </div>
              <div>
                <p className="text-white text-sm font-semibold leading-tight">
                  Assistant AtlasEvents
                </p>
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-blue-200 text-[10px]">
                    Recherche intelligente
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsMinimized(m => !m)}
                className="p-1.5 text-blue-200 hover:text-white
                           hover:bg-white/10 rounded-lg transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                     stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  {isMinimized
                    ? <path d="M5 15l7-7 7 7"/>
                    : <path d="M19 9l-7 7-7-7"/>}
                </svg>
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-blue-200 hover:text-white
                           hover:bg-white/10 rounded-lg transition-colors"
              >
                <FaTimes size={13} />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Zone messages (Fond beige/sable adouci) */}
              <div className="flex-1 overflow-y-auto px-4 py-3
                              space-y-3 bg-[#FAF8F5]">
                {messages.map((msg) => (
                  <div key={msg.id}
                       className={`flex ${msg.sender === 'user'
                         ? 'justify-end'
                         : 'justify-start'}`}>

                    {/* Avatar bot */}
                    {msg.sender === 'bot' && (
                      <div className="w-6 h-6 rounded-full bg-orange-100
                                      flex items-center justify-center
                                      mr-2 mt-1 shrink-0">
                        <BsStars size={11} className="text-[#D97706]" />
                      </div>
                    )}

                    <div className="max-w-[80%]">
                      {/* Bulle (User = Ambre / Bot = Blanc Épuré) */}
                      <div className={`px-3.5 py-2.5 rounded-2xl text-sm
                                       leading-relaxed whitespace-pre-line
                                       ${msg.sender === 'user'
                                         ? 'bg-[#D97706] text-white rounded-br-sm shadow-sm'
                                         : 'bg-white text-gray-800 border border-orange-100/60 rounded-bl-sm shadow-sm'
                                       }`}>
                        {msg.text}
                      </div>

                      {/* Lien redirection (Texte Bleu Profond) */}
                      {msg.targetUrl && (
                        <button
                          onClick={() => navigate(msg.targetUrl)}
                          className="mt-1.5 text-[11px] text-[#0F4C81]
                                     hover:text-[#0a355c] font-bold
                                     underline underline-offset-2 block"
                        >
                          Voir les résultats →
                        </button>
                      )}

                      <p className={`text-[10px] mt-1 text-gray-400
                                     ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
                        {formatTime(msg.time)}
                      </p>
                    </div>
                  </div>
                ))}

                {/* Typing indicator */}
                {isTyping && (
                  <div className="flex justify-start items-end gap-2">
                    <div className="w-6 h-6 rounded-full bg-orange-100
                                    flex items-center justify-center shrink-0">
                      <BsStars size={11} className="text-[#D97706]" />
                    </div>
                    <div className="bg-white border border-orange-100/60
                                    rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                      <div className="flex gap-1 items-center h-3">
                        {[0, 1, 2].map(i => (
                          <span key={i}
                            className="w-1.5 h-1.5 rounded-full bg-[#D97706]/60 animate-bounce"
                            style={{ animationDelay: `${i * 0.15}s` }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Suggestions (Boutons blancs aux contours chauds) */}
              {messages.length <= 2 && (
                <div className="px-4 py-2.5 bg-[#FAF8F5] border-t border-orange-100/40">
                  <p className="text-[10px] text-gray-400 mb-1.5
                                uppercase tracking-widest font-bold">
                    Essayez
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {SUGGESTIONS.map(s => (
                      <button key={s} onClick={() => sendMessage(s)}
                        className="text-[11px] px-2.5 py-1 rounded-full
                                   bg-white border border-orange-100/70 text-gray-700
                                   hover:border-[#D97706] hover:text-[#D97706]
                                   transition-colors shadow-sm font-medium">
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Formulaire Input (Focus Ambre discret) */}
              <form onSubmit={handleSend}
                    className="px-3 py-3 border-t border-orange-100/40 bg-white shrink-0">
                <div className="flex items-center gap-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ex: festival à Fès moins de 200 DH…"
                    disabled={isTyping}
                    className="flex-1 px-4 py-2.5 text-sm bg-gray-50
                               border border-gray-200 rounded-full outline-none
                               focus:ring-2 focus:ring-orange-100
                               focus:border-[#D97706] transition-all
                               placeholder-gray-400 text-gray-800
                               disabled:opacity-50"
                  />
                  <button type="submit"
                    disabled={!input.trim() || isTyping}
                    className="w-9 h-9 bg-[#0F4C81] hover:bg-[#0a355c]
                               disabled:opacity-40 disabled:cursor-not-allowed
                               text-white rounded-full flex items-center
                               justify-center transition-all active:scale-95 shrink-0 shadow-sm">
                    <FaPaperPlane size={11} />
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      )}
    </>
  )
}

export default ChatBot


// import { useState, useRef, useEffect } from 'react'
// import { BsStars } from 'react-icons/bs'
// import { FaTimes, FaPaperPlane } from 'react-icons/fa'
// import { useNavigate } from 'react-router-dom'
// import { BASE_URL } from '../utils/fetchFn'

// // ─── Map catégorie nom → ID (adapter selon ta BDD) ────────────────
// const CATEGORIE_ID_MAP = {
//   'Concert':     1,
//   'Festival':    2,
//   'Theatre':     3,
//   'Sport':       4,
//   'Conference':  5,
//   'Art':         6,
//   'Comedie':     7,
//   'Cinema':      8,
// }

// const INITIAL_MESSAGES = [
//   {
//     id: 1,
//     text: 'Bonjour ! 👋 Dites-moi ce que vous cherchez et je vous trouve les événements parfaits. Ex : "concert à Casablanca moins de 200 DH"',
//     sender: 'bot',
//     time: new Date()
//   }
// ]

// const SUGGESTIONS = [
//   'Concerts à Marrakech',
//   'Sport à Casablanca',
//   'Budget moins de 100 DH',
//   'Festival ce mois',
// ]

// const formatTime = (date) =>
//   date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })

// // ─── Composant principal ───────────────────────────────────────────
// const ChatBot = () => {
//   const [isOpen,      setIsOpen]      = useState(false)
//   const [isMinimized, setIsMinimized] = useState(false)
//   const [messages,    setMessages]    = useState(INITIAL_MESSAGES)
//   const [input,       setInput]       = useState('')
//   const [isTyping,    setIsTyping]    = useState(false)
//   const [unread,      setUnread]      = useState(0)
//   const messagesEndRef = useRef(null)
//   const inputRef       = useRef(null)
//   const navigate       = useNavigate()

//   useEffect(() => {
//     if (isOpen && !isMinimized) {
//       messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
//     }
//   }, [messages, isOpen, isMinimized, isTyping])

//   useEffect(() => {
//     if (isOpen && !isMinimized) {
//       setUnread(0)
//       setTimeout(() => inputRef.current?.focus(), 200)
//     }
//   }, [isOpen, isMinimized])

//   // ── Construire l'URL avec les critères reçus ─────────────────────
//   const buildEventsUrl = (criteria) => {
//     const params = new URLSearchParams()

//     if (criteria.ville)    params.set('ville',      criteria.ville)
//     if (criteria.keyword)  params.set('keyword',    criteria.keyword)
//     if (criteria.prixMax)  params.set('prixMax',    String(criteria.prixMax))

//     if (criteria.categorie) {
//       const id = CATEGORIE_ID_MAP[criteria.categorie]
//       if (id) params.set('categorieId', String(id))
//     }

//     params.set('page', '0')
//     return `/events?${params.toString()}`
//   }

//   // ── Envoi du message ─────────────────────────────────────────────
//   const sendMessage = async (text) => {
//     if (!text.trim() || isTyping) return

//     const userMsg = { id: Date.now(), text, sender: 'user', time: new Date() }
//     setMessages(prev => [...prev, userMsg])
//     setInput('')
//     setIsTyping(true)

//     try {
//       const token = localStorage.getItem('token')

//       const res = await fetch(`${BASE_URL}/chat/ask`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           ...(token && { Authorization: `Bearer ${token}` }),
//         },
//         body: JSON.stringify({ question: text }),
//       })

//       if (!res.ok) throw new Error(`HTTP ${res.status}`)

//       const data = await res.json()
//       const criteria = data.criteresUtilises || {}

//       setIsTyping(false)

//       const criteresTexte = []
//       if (criteria.ville)      criteresTexte.push(`📍 ${criteria.ville}`)
//       if (criteria.categorie)  criteresTexte.push(`🎭 ${criteria.categorie}`)
//       if (criteria.prixMax)    criteresTexte.push(`💰 max ${criteria.prixMax} DH`)
//       if (criteria.keyword)    criteresTexte.push(`🔍 "${criteria.keyword}"`)

//       const hasCriteria = criteresTexte.length > 0

//       const botText = hasCriteria
//         ? `J'ai trouvé vos critères : ${criteresTexte.join(' · ')}\n\nJe vous redirige vers les résultats… ✨`
//         : (data.message || 'Je n\'ai pas bien compris. Pouvez-vous préciser ? Ex: "concert à Rabat"')

//       const botMsg = {
//         id:        Date.now() + 1,
//         text:      botText,
//         sender:    'bot',
//         time:      new Date(),
//         targetUrl: hasCriteria ? buildEventsUrl(criteria) : null,
//       }

//       setMessages(prev => [...prev, botMsg])
//       if (!isOpen || isMinimized) setUnread(n => n + 1)

//       if (hasCriteria) {
//         setTimeout(() => {
//           navigate(buildEventsUrl(criteria))
//         }, 1200)
//       }

//     } catch (err) {
//       setIsTyping(false)
      
//       let errorText = 'Désolé, problème technique. 🔧'
//       if (err.message.includes('401')) errorText = 'Session expirée. Reconnectez-vous. 🔐'
//       else if (err.message.includes('404')) errorText = 'Service introuvable. ⚠️'
//       else if (err.message.includes('500')) errorText = 'Erreur serveur. Réessayez plus tard. 🛠️'
      
//       setMessages(prev => [...prev, {
//         id: Date.now() + 1,
//         text: errorText,
//         sender: 'bot',
//         time: new Date()
//       }])
//     }
//   }

//   const handleSend = (e) => {
//     e.preventDefault()
//     sendMessage(input)
//   }

//   return (
//     <>
//       {/* ── Bouton flottant (Ambre Authentique) ────────────────── */}
//       {!isOpen && (
//         <button
//           onClick={() => { setIsOpen(true); setIsMinimized(false); setUnread(0) }}
//           aria-label="Ouvrir l'assistant"
//           className="fixed bottom-6 right-6 z-50 flex items-center gap-2
//                      bg-[#D97706] hover:bg-[#C2410C] text-white pl-4 pr-5
//                      py-3 rounded-full shadow-lg transition-all
//                      hover:scale-105 active:scale-95"
//         >
//           <BsStars size={18} />
//           <span className="text-sm font-semibold">Recherche IA</span>
//           {unread > 0 && (
//             <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500
//                              text-white text-[10px] font-bold rounded-full
//                              flex items-center justify-center animate-pulse">
//               {unread}
//             </span>
//           )}
//         </button>
//       )}

//       {/* ── Fenêtre de chat ─────────────────────────────────────── */}
//       {isOpen && (
//         <div
//           className={`fixed bottom-6 right-6 z-50 w-[360px]
//                       max-w-[calc(100vw-2rem)] bg-white rounded-2xl
//                       shadow-2xl flex flex-col overflow-hidden
//                       transition-all duration-300
//                       ${isMinimized ? 'h-14' : 'h-[500px]'}`}
//           style={{ border: '1px solid #F0E6d8' }}
//         >
//           {/* Header (Bleu Profond Marocain) */}
//           <div className="flex items-center justify-between px-4 py-3
//                           bg-[#0F4C81] shrink-0">
//             <div className="flex items-center gap-2.5">
//               <div className="w-8 h-8 rounded-full bg-[#D97706]
//                               flex items-center justify-center">
//                 <BsStars size={15} className="text-white" />
//               </div>
//               <div>
//                 <p className="text-white text-sm font-semibold leading-tight">
//                   Assistant AtlasEvents
//                 </p>
//                 <div className="flex items-center gap-1">
//                   <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
//                   <span className="text-blue-200 text-[10px]">
//                     Recherche intelligente
//                   </span>
//                 </div>
//               </div>
//             </div>
//             <div className="flex items-center gap-1">
//               <button
//                 onClick={() => setIsMinimized(m => !m)}
//                 className="p-1.5 text-blue-200 hover:text-white
//                            hover:bg-white/10 rounded-lg transition-colors"
//               >
//                 <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
//                      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
//                   {isMinimized
//                     ? <path d="M5 15l7-7 7 7"/>
//                     : <path d="M19 9l-7 7-7-7"/>}
//                 </svg>
//               </button>
//               <button
//                 onClick={() => setIsOpen(false)}
//                 className="p-1.5 text-blue-200 hover:text-white
//                            hover:bg-white/10 rounded-lg transition-colors"
//               >
//                 <FaTimes size={13} />
//               </button>
//             </div>
//           </div>

//           {!isMinimized && (
//             <>
//               {/* Zone messages (Fond beige/sable adouci) */}
//               <div className="flex-1 overflow-y-auto px-4 py-3
//                               space-y-3 bg-[#FAF8F5]">
//                 {messages.map((msg) => (
//                   <div key={msg.id}
//                        className={`flex ${msg.sender === 'user'
//                          ? 'justify-end'
//                          : 'justify-start'}`}>

//                     {/* Avatar bot */}
//                     {msg.sender === 'bot' && (
//                       <div className="w-6 h-6 rounded-full bg-orange-100
//                                       flex items-center justify-center
//                                       mr-2 mt-1 shrink-0">
//                         <BsStars size={11} className="text-[#D97706]" />
//                       </div>
//                     )}

//                     <div className="max-w-[80%]">
//                       {/* Bulle (User = Ambre / Bot = Blanc Épuré) */}
//                       <div className={`px-3.5 py-2.5 rounded-2xl text-sm
//                                        leading-relaxed whitespace-pre-line
//                                        ${msg.sender === 'user'
//                                          ? 'bg-[#D97706] text-white rounded-br-sm shadow-sm'
//                                          : 'bg-white text-gray-800 border border-orange-100/60 rounded-bl-sm shadow-sm'
//                                        }`}>
//                         {msg.text}
//                       </div>

//                       {/* Lien redirection (Texte Bleu Profond) */}
//                       {msg.targetUrl && (
//                         <button
//                           onClick={() => navigate(msg.targetUrl)}
//                           className="mt-1.5 text-[11px] text-[#0F4C81]
//                                      hover:text-[#0a355c] font-bold
//                                      underline underline-offset-2 block"
//                         >
//                           Voir les résultats →
//                         </button>
//                       )}

//                       <p className={`text-[10px] mt-1 text-gray-400
//                                      ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
//                         {formatTime(msg.time)}
//                       </p>
//                     </div>
//                   </div>
//                 ))}

//                 {/* Typing indicator */}
//                 {isTyping && (
//                   <div className="flex justify-start items-end gap-2">
//                     <div className="w-6 h-6 rounded-full bg-orange-100
//                                     flex items-center justify-center shrink-0">
//                       <BsStars size={11} className="text-[#D97706]" />
//                     </div>
//                     <div className="bg-white border border-orange-100/60
//                                     rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
//                       <div className="flex gap-1 items-center h-3">
//                         {[0, 1, 2].map(i => (
//                           <span key={i}
//                             className="w-1.5 h-1.5 rounded-full bg-[#D97706]/60 animate-bounce"
//                             style={{ animationDelay: `${i * 0.15}s` }}
//                           />
//                         ))}
//                       </div>
//                     </div>
//                   </div>
//                 )}
//                 <div ref={messagesEndRef} />
//               </div>

//               {/* Suggestions (Boutons blancs aux contours chauds) */}
//               {messages.length <= 2 && (
//                 <div className="px-4 py-2.5 bg-[#FAF8F5] border-t border-orange-100/40">
//                   <p className="text-[10px] text-gray-400 mb-1.5
//                                 uppercase tracking-widest font-bold">
//                     Essayez
//                   </p>
//                   <div className="flex flex-wrap gap-1.5">
//                     {SUGGESTIONS.map(s => (
//                       <button key={s} onClick={() => sendMessage(s)}
//                         className="text-[11px] px-2.5 py-1 rounded-full
//                                    bg-white border border-orange-100/70 text-gray-700
//                                    hover:border-[#D97706] hover:text-[#D97706]
//                                    transition-colors shadow-sm font-medium">
//                         {s}
//                       </button>
//                     ))}
//                   </div>
//                 </div>
//               )}

//               {/* Formulaire Input (Focus Ambre discret) */}
//               <form onSubmit={handleSend}
//                     className="px-3 py-3 border-t border-orange-100/40 bg-white shrink-0">
//                 <div className="flex items-center gap-2">
//                   <input
//                     ref={inputRef}
//                     type="text"
//                     value={input}
//                     onChange={(e) => setInput(e.target.value)}
//                     placeholder="Ex: festival à Fès moins de 200 DH…"
//                     disabled={isTyping}
//                     className="flex-1 px-4 py-2.5 text-sm bg-gray-50
//                                border border-gray-200 rounded-full outline-none
//                                focus:ring-2 focus:ring-orange-100
//                                focus:border-[#D97706] transition-all
//                                placeholder-gray-400 text-gray-800
//                                disabled:opacity-50"
//                   />
//                   <button type="submit"
//                     disabled={!input.trim() || isTyping}
//                     className="w-9 h-9 bg-[#0F4C81] hover:bg-[#0a355c]
//                                disabled:opacity-40 disabled:cursor-not-allowed
//                                text-white rounded-full flex items-center
//                                justify-center transition-all active:scale-95 shrink-0 shadow-sm">
//                     <FaPaperPlane size={11} />
//                   </button>
//                 </div>
//               </form>
//             </>
//           )}
//         </div>
//       )}
//     </>
//   )
// }

// export default ChatBot