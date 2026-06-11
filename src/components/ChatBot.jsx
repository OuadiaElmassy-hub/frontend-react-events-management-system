// // import { useState, useRef, useEffect } from 'react'
// // import { AiFillWechat } from 'react-icons/ai'
// // import { BsStars } from 'react-icons/bs'
// // import { FaTimes, FaPaperPlane, FaComments } from 'react-icons/fa'

// // const ChatBot = () => {
// //   const [isOpen, setIsOpen] = useState(false)
// //   const [messages, setMessages] = useState([
// //     { id: 1, text: 'Salut! Comment puis-je t’aider à trouver un événement?', sender: 'bot' }
// //   ])
// //   const [input, setInput] = useState('')
// //   const messagesEndRef = useRef(null)

// //   const scrollToBottom = () => {
// //     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
// //   }

// //   useEffect(() => {
// //     scrollToBottom()
// //   }, [messages])

// //   const handleSend = (e) => {
// //     e.preventDefault()
// //     if (!input.trim()) return

// //     // Message utilisateur
// //     const userMsg = { id: Date.now(), text: input, sender: 'user' }
// //     setMessages(prev => [...prev, userMsg])
// //     setInput('')

// //     // Réponse bot simulée
// //     setTimeout(() => {
// //       const botMsg = {
// //         id: Date.now() + 1,
// //         text: getBotResponse(input),
// //         sender: 'bot'
// //       }
// //       setMessages(prev => [...prev, botMsg])
// //     }, 600)
// //   }

// //   const getBotResponse = (msg) => {
// //     const m = msg.toLowerCase()
// //     if (m.includes('concert')) return 'Super! On a plusieurs concerts. Tu cherches quel style?'
// //     if (m.includes('prix') || m.includes('euro')) return 'Utilise le filtre prix dans la sidebar. Budget max?'
// //     if (m.includes('paris')) return 'J’ai 12 événements à Paris. Veux-tu filtrer par date?'
// //     if (m.includes('sport')) return 'On a du foot, tennis, basket. Quelle catégorie sport?'
// //     return 'Je peux t’aider à filtrer par date, prix, lieu ou catégorie. Que cherches-tu?'
// //   }

// //   return (
// //     <>
// //       {/* Bouton flottant */}
// //       {!isOpen && (
// //         <button
// //           onClick={() => setIsOpen(true)}
// //           className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg z-50 transition hover:scale-110"
// //         >
// //           <BsStars size={24} />
// //         </button>
// //       )}

// //       {/* Fenêtre de chat */}
// //       {isOpen && (
// //         <div className="fixed bottom-6 right-6 w-96 h-[500px] bg-white rounded-lg shadow-2xl z-50 flex flex-col">
// //           {/* Header */}
// //           <div className="bg-blue-600 text-white px-4 py-3 rounded-t-lg flex justify-between items-center">
// //             <div className="flex items-center gap-2">
// //               <FaComments />
// //               <span className="font-semibold">Assistant EventHub</span>
// //             </div>
// //             <button onClick={() => setIsOpen(false)} className="hover:bg-blue-700 p-1 rounded">
// //               <FaTimes />
// //             </button>
// //           </div>

// //           {/* Messages */}
// //           <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
// //             {messages.map((msg) => (
// //               <div
// //                 key={msg.id}
// //                 className={`flex ${msg.sender === 'user'? 'justify-end' : 'justify-start'}`}
// //               >
// //                 <div
// //                   className={`max-w-[75%] px-4 py-2 rounded-lg ${
// //                     msg.sender === 'user'
// //                      ? 'bg-blue-600 text-white'
// //                       : 'bg-white text-gray-800 border border-gray-200'
// //                   }`}
// //                 >
// //                   {msg.text}
// //                 </div>
// //               </div>
// //             ))}
// //             <div ref={messagesEndRef} />
// //           </div>

// //           {/* Input */}
// //           <form onSubmit={handleSend} className="p-3 border-t bg-white rounded-b-lg">
// //             <div className="flex gap-2">
// //               <input
// //                 type="text"
// //                 value={input}
// //                 onChange={(e) => setInput(e.target.value)}
// //                 placeholder="Écris ton message..."
// //                 className="flex-1 px-4 py-2 border border-gray-300 rounded-full outline-none focus:ring-2 focus:ring-blue-500"
// //               />
// //               <button
// //                 type="submit"
// //                 className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full transition"
// //               >
// //                 <FaPaperPlane size={16} />
// //               </button>
// //             </div>
// //           </form>
// //         </div>
// //       )}
// //     </>
// //   )
// // }

// // export default ChatBot



// import { useState, useRef, useEffect } from 'react'
// import { BsStars } from 'react-icons/bs'
// import { FaTimes, FaPaperPlane } from 'react-icons/fa'

// const INITIAL_MESSAGES = [
//   {
//     id: 1,
//     text: 'Bonjour ! 👋 Je suis votre assistant Rovista. Comment puis-je vous aider à trouver un événement ?',
//     sender: 'bot',
//     time: new Date()
//   }
// ]

// const SUGGESTIONS = [
//   'Concerts à Marrakech',
//   'Événements ce week-end',
//   'Budget moins de 100 DH',
//   'Événements sportifs',
// ]

// const getBotResponse = (msg) => {
//   const m = msg.toLowerCase()
//   if (m.includes('concert'))                    return 'Super choix ! 🎵 Nous avons plusieurs concerts disponibles. Vous cherchez quel style de musique ?'
//   if (m.includes('prix') || m.includes('dh') || m.includes('budget')) return 'Vous pouvez utiliser le filtre prix dans la sidebar pour définir votre budget. Quel est votre budget maximum ?'
//   if (m.includes('marrakech'))                  return '📍 Marrakech est très active ! J\'ai plusieurs événements dans cette ville. Voulez-vous filtrer par date ou catégorie ?'
//   if (m.includes('sport'))                      return '⚽ Nous avons du foot, tennis, basket et plus encore. Quelle discipline vous intéresse ?'
//   if (m.includes('week-end') || m.includes('weekend')) return '📅 Pour voir les événements du week-end, utilisez le filtre date dans la sidebar. Je peux aussi vous recommander des événements populaires !'
//   if (m.includes('bonjour') || m.includes('salut') || m.includes('hello')) return 'Bonjour ! 😊 Ravi de vous aider. Vous cherchez un type d\'événement particulier ?'
//   if (m.includes('merci'))                      return 'Avec plaisir ! 🙏 N\'hésitez pas si vous avez d\'autres questions.'
//   return 'Je peux vous aider à filtrer par date, prix, lieu ou catégorie. Que recherchez-vous exactement ?'
// }

// const formatTime = (date) =>
//   date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })

// const ChatBot = () => {
//   const [isOpen, setIsOpen] = useState(false)
//   const [isMinimized, setIsMinimized] = useState(false)
//   const [messages, setMessages] = useState(INITIAL_MESSAGES)
//   const [input, setInput] = useState('')
//   const [isTyping, setIsTyping] = useState(false)
//   const [unread, setUnread] = useState(0)
//   const messagesEndRef = useRef(null)
//   const inputRef = useRef(null)

//   useEffect(() => {
//     if (isOpen) {
//       messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
//       setUnread(0)
//       setTimeout(() => inputRef.current?.focus(), 100)
//     }
//   }, [messages, isOpen])

//   const sendMessage = (text) => {
//     if (!text.trim()) return

//     const userMsg = { id: Date.now(), text, sender: 'user', time: new Date() }
//     setMessages(prev => [...prev, userMsg])
//     setInput('')
//     setIsTyping(true)

//     setTimeout(() => {
//       setIsTyping(false)
//       const botMsg = {
//         id: Date.now() + 1,
//         text: getBotResponse(text),
//         sender: 'bot',
//         time: new Date()
//       }
//       setMessages(prev => [...prev, botMsg])
//       if (!isOpen) setUnread(n => n + 1)
//     }, 800)
//   }

//   const handleSend = (e) => {
//     e.preventDefault()
//     sendMessage(input)
//   }

//   const handleOpen = () => {
//     setIsOpen(true)
//     setIsMinimized(false)
//     setUnread(0)
//   }

//   return (
//     <>
//       {/* Bouton flottant */}
//       {!isOpen && (
//         <button
//           onClick={handleOpen}
//           aria-label="Ouvrir le chat"
//           className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white pl-4 pr-5 py-3 rounded-full shadow-lg transition-all hover:scale-105 active:scale-95"
//         >
//           <BsStars size={18} />
//           <span className="text-sm font-semibold">Aide</span>
//           {unread > 0 && (
//             <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
//               {unread}
//             </span>
//           )}
//         </button>
//       )}

//       {/* Fenêtre chat */}
//       {isOpen && (
//         <div
//           className={`fixed bottom-6 right-6 z-50 w-[360px] max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300 ${
//             isMinimized ? 'h-14' : 'h-[520px]'
//           }`}
//           style={{ border: '0.5px solid #e5e7eb' }}
//         >
//           {/* Header */}
//           <div className="flex items-center justify-between px-4 py-3 bg-blue-600 shrink-0">
//             <div className="flex items-center gap-2.5">
//               <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
//                 <BsStars size={15} className="text-white" />
//               </div>
//               <div>
//                 <p className="text-white text-sm font-semibold leading-tight">Assistant Rovista</p>
//                 <div className="flex items-center gap-1">
//                   <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
//                   <span className="text-blue-100 text-[10px]">En ligne</span>
//                 </div>
//               </div>
//             </div>
//             <div className="flex items-center gap-1">
//               <button
//                 onClick={() => setIsMinimized(m => !m)}
//                 className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
//                 aria-label={isMinimized ? 'Agrandir' : 'Réduire'}
//               >
//                 <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
//                   {isMinimized ? <path d="M5 15l7-7 7 7"/> : <path d="M19 9l-7 7-7-7"/>}
//                 </svg>
//               </button>
//               <button
//                 onClick={() => setIsOpen(false)}
//                 className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
//                 aria-label="Fermer"
//               >
//                 <FaTimes size={13} />
//               </button>
//             </div>
//           </div>

//           {!isMinimized && (
//             <>
//               {/* Messages */}
//               <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-gray-50">
//                 {messages.map((msg) => (
//                   <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
//                     {msg.sender === 'bot' && (
//                       <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mr-2 mt-1 shrink-0">
//                         <BsStars size={11} className="text-blue-600" />
//                       </div>
//                     )}
//                     <div className="max-w-[78%]">
//                       <div className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
//                         msg.sender === 'user'
//                           ? 'bg-blue-600 text-white rounded-br-sm'
//                           : 'bg-white text-gray-800 border border-gray-100 rounded-bl-sm shadow-sm'
//                       }`}>
//                         {msg.text}
//                       </div>
//                       <p className={`text-[10px] mt-1 ${msg.sender === 'user' ? 'text-right text-gray-400' : 'text-gray-400'}`}>
//                         {formatTime(msg.time)}
//                       </p>
//                     </div>
//                   </div>
//                 ))}

//                 {/* Typing indicator */}
//                 {isTyping && (
//                   <div className="flex justify-start items-end gap-2">
//                     <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
//                       <BsStars size={11} className="text-blue-600" />
//                     </div>
//                     <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
//                       <div className="flex gap-1 items-center h-4">
//                         {[0, 1, 2].map(i => (
//                           <span
//                             key={i}
//                             className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce"
//                             style={{ animationDelay: `${i * 0.15}s` }}
//                           />
//                         ))}
//                       </div>
//                     </div>
//                   </div>
//                 )}
//                 <div ref={messagesEndRef} />
//               </div>

//               {/* Suggestions */}
//               {messages.length <= 2 && (
//                 <div className="px-4 py-2 bg-gray-50 border-t border-gray-100">
//                   <p className="text-[10px] text-gray-400 mb-1.5 uppercase tracking-widest font-medium">Suggestions</p>
//                   <div className="flex flex-wrap gap-1.5">
//                     {SUGGESTIONS.map(s => (
//                       <button
//                         key={s}
//                         onClick={() => sendMessage(s)}
//                         className="text-[11px] px-2.5 py-1 rounded-full bg-white border border-gray-200 text-gray-600 hover:border-blue-300 hover:text-blue-600 transition-colors"
//                       >
//                         {s}
//                       </button>
//                     ))}
//                   </div>
//                 </div>
//               )}

//               {/* Input */}
//               <form onSubmit={handleSend} className="px-3 py-3 border-t border-gray-100 bg-white shrink-0">
//                 <div className="flex items-center gap-2">
//                   <input
//                     ref={inputRef}
//                     type="text"
//                     value={input}
//                     onChange={(e) => setInput(e.target.value)}
//                     placeholder="Écrivez votre message…"
//                     className="flex-1 px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-full outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all placeholder-gray-300"
//                   />
//                   <button
//                     type="submit"
//                     disabled={!input.trim()}
//                     className="w-9 h-9 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-full flex items-center justify-center transition-all active:scale-95 shrink-0"
//                   >
//                     <FaPaperPlane size={13} />
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

import { useState, useRef, useEffect } from 'react'
import { BsStars } from 'react-icons/bs'
import { FaTimes, FaPaperPlane } from 'react-icons/fa'

const INITIAL_MESSAGES = [
  {
    id: 1,
    text: 'Bonjour ! 👋 Je suis votre assistant Rovista. Comment puis-je vous aider à trouver un événement au Maroc ?',
    sender: 'bot',
    time: new Date()
  }
]

const SUGGESTIONS = [
  'Concerts à Marrakech',
  'Événements ce week-end',
  'Budget moins de 100 DH',
  'Événements sportifs',
]

const getBotResponse = (msg) => {
  const m = msg.toLowerCase()
  if (m.includes('concert')) return 'Super choix ! 🎵 Nous avons plusieurs concerts disponibles. Vous cherchez quel style de musique ?'
  if (m.includes('prix') || m.includes('dh') || m.includes('budget')) return 'Vous pouvez utiliser le filtre prix dans la barre latérale pour définir votre budget. Quel est votre budget maximum ?'
  if (m.includes('marrakech')) return '📍 Marrakech est très animée ! J\'ai plusieurs événements là-bas. Voulez-vous filtrer par date ou par catégorie ?'
  if (m.includes('sport')) return '⚽ Nous avons du foot, du tennis, du basket et bien plus. Quelle discipline vous intéresse ?'
  if (m.includes('week-end') || m.includes('weekend')) return '📅 Pour voir les événements du week-end, utilisez le filtre date sur notre page de recherche. Je peux aussi vous recommander les rendez-vous populaires !'
  if (m.includes('bonjour') || m.includes('salut') || m.includes('hello')) return 'Bonjour ! 😊 Ravi de vous aider. Vous cherchez un type d\'événement particulier ?'
  if (m.includes('merci')) return 'Avec plaisir ! 🙏 N\'hésitez pas si vous avez d\'autres questions pour vos sorties.'
  return 'Je peux vous aider à filtrer les événements par date, prix, ville ou catégorie. Que recherchez-vous exactement ?'
}

const formatTime = (date) =>
  date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState(INITIAL_MESSAGES)
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [unread, setUnread] = useState(0)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  // Gestion du défilement automatique vers le bas
  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isOpen, isMinimized, isTyping])

  // Focus sur l'input à l'ouverture
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setUnread(0)
      setTimeout(() => inputRef.current?.focus(), 200)
    }
  }, [isOpen, isMinimized])

  const sendMessage = (text) => {
    if (!text.trim()) return

    const userMsg = { id: Date.now(), text, sender: 'user', time: new Date() }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setIsTyping(true)

    setTimeout(() => {
      setIsTyping(false)
      const botMsg = {
        id: Date.now() + 1,
        text: getBotResponse(text),
        sender: 'bot',
        time: new Date()
      }
      setMessages(prev => [...prev, botMsg])
      if (!isOpen || isMinimized) setUnread(n => n + 1)
    }, 900)
  }

  const handleSend = (e) => {
    e.preventDefault()
    sendMessage(input)
  }

  const handleOpen = () => {
    setIsOpen(true)
    setIsMinimized(false)
    setUnread(0)
  }

  return (
    <>
      {/* Bouton flottant */}
      {!isOpen && (
        <button
          onClick={handleOpen}
          aria-label="Ouvrir le chat d'assistance"
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white pl-4 pr-5 py-3 rounded-full shadow-lg transition-all hover:scale-105 active:scale-95"
        >
          <BsStars size={18} />
          <span className="text-sm font-semibold">Une question ?</span>
          {unread > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
              {unread}
            </span>
          )}
        </button>
      )}

      {/* Fenêtre de chat */}
      {isOpen && (
        <div
          className={`fixed bottom-6 right-6 z-50 w-[360px] max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300 ${
            isMinimized ? 'h-14' : 'h-[520px]'
          }`}
          style={{ border: '1px solid #e2e8f0' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-slate-950 shrink-0 border-b border-slate-900">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-amber-600 flex items-center justify-center shadow-inner">
                <BsStars size={15} className="text-white" />
              </div>
              <div>
                <p className="text-white text-sm font-semibold leading-tight">Assistant Rovista</p>
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-slate-400 text-[10px]">Support en ligne</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsMinimized(m => !m)}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-900 rounded-lg transition-colors"
                aria-label={isMinimized ? 'Agrandir la fenêtre' : 'Réduire la fenêtre'}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  {isMinimized ? <path d="M5 15l7-7 7 7"/> : <path d="M19 9l-7 7-7-7"/>}
                </svg>
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-900 rounded-lg transition-colors"
                aria-label="Fermer le chat"
              >
                <FaTimes size={13} />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Zone des messages */}
              <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-slate-50">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {msg.sender === 'bot' && (
                      <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center mr-2 mt-1 shrink-0 shadow-sm">
                        <BsStars size={11} className="text-amber-700" />
                      </div>
                    )}
                    <div className="max-w-[78%]">
                      <div className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                        msg.sender === 'user'
                          ? 'bg-amber-600 text-white rounded-br-sm shadow-sm'
                          : 'bg-white text-slate-800 border border-slate-100 rounded-bl-sm shadow-sm'
                      }`}>
                        {msg.text}
                      </div>
                      <p className={`text-[10px] mt-1 text-slate-400 ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
                        {formatTime(msg.time)}
                      </p>
                    </div>
                  </div>
                ))}

                {/* Indicateur d'écriture */}
                {isTyping && (
                  <div className="flex justify-start items-end gap-2">
                    <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                      <BsStars size={11} className="text-amber-700" />
                    </div>
                    <div className="bg-white border border-slate-100 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                      <div className="flex gap-1 items-center h-3">
                        {[0, 1, 2].map(i => (
                          <span
                            key={i}
                            className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce"
                            style={{ animationDelay: `${i * 0.15}s` }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Boutons de suggestions rapides (visibles uniquement au démarrage) */}
              {messages.length <= 2 && (
                <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100">
                  <p className="text-[10px] text-slate-400 mb-1.5 uppercase tracking-widest font-semibold">Suggestions</p>
                  <div className="flex flex-wrap gap-1.5">
                    {SUGGESTIONS.map(s => (
                      <button
                        key={s}
                        onClick={() => sendMessage(s)}
                        className="text-[11px] px-2.5 py-1 rounded-full bg-white border border-slate-200 text-slate-600 hover:border-amber-500 hover:text-amber-600 transition-colors shadow-sm"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Formulaire de saisie */}
              <form onSubmit={handleSend} className="px-3 py-3 border-t border-slate-100 bg-white shrink-0">
                <div className="flex items-center gap-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Écrivez votre message..."
                    className="flex-1 px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-full outline-none focus:ring-2 focus:ring-amber-100 focus:border-amber-500 transition-all placeholder-slate-400 text-slate-800"
                  />
                  <button
                    type="submit"
                    disabled={!input.trim()}
                    className="w-9 h-9 bg-amber-600 hover:bg-amber-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-full flex items-center justify-center transition-all active:scale-95 shrink-0 shadow-md shadow-amber-600/10"
                  >
                    <FaPaperPlane size={12} />
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