
import { useState, useEffect, useRef } from 'react'
import rovistaLogo from '../assets/logos/rovista.svg'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { HashLink as Link } from 'react-router-hash-link';

const NAV_LINKS = [
  { label: 'Accueil', to: '/' },
  { label: 'Événements', to: '/events#list' },
  { label: 'Organisateurs', to: '/organisateurs' },
  { label: 'À propos', to: '/#about' },
  { label: 'Contact', to: '/#contact' },
]

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [activeLink, setActiveLink] = useState('Accueil')
  const menuRef = useRef(null)
  const lastFocusedRef = useRef(null)

  const location = useLocation()
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)

  // Met à jour activeLink quand la route change
  useEffect(() => {
    const current = NAV_LINKS.find(link => link.to === location.pathname)
    if (current) setActiveLink(current.label)
  }, [location.pathname])

  // Scroll shadow
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Escape key
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape' && isMenuOpen) closeMenu() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [isMenuOpen])

  // Lock body scroll when mobile menu open
  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isMenuOpen])

  // Ferme le dropdown si clic extérieur
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setDropdownOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const openMenu = () => {
    lastFocusedRef.current = document.activeElement
    setIsMenuOpen(true)
    setTimeout(() => menuRef.current?.focus(), 0)
  }

  const closeMenu = () => {
    setIsMenuOpen(false)
    setTimeout(() => lastFocusedRef.current?.focus(), 0)
  }

  const handleLogout = () => {
    logout()
    setDropdownOpen(false)
    closeMenu()
    navigate('/')
  }

  // Ajouter cette fonction AVANT le return du composant
  const getPrimaryRole = (user) => {
    const roles = user.roles ?? (user.role ? [user.role] : [])
    if (roles.includes('ADMIN'))        return 'ADMIN'
    if (roles.includes('ORGANISATEUR')) return 'ORGANISATEUR'
    return 'CLIENT'
  }

  return (
    <>
      <nav
        className={`sticky top-0 z-40 w-full transition-all duration-300 ${
          scrolled
            ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100'
            : 'bg-white border-b border-gray-100'
        }`}
        aria-label="Navigation principale"
      >
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-between h-16">

          {/* Logo */}
          <Link
            to="/"
            className="flex items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-lg shrink-0"
            aria-label="Rovista - Accueil"
          >
            <img src={rovistaLogo} alt="Rovista" className="h-16 w-auto" />
          </Link>

          {/* Desktop links */}
          <ul className="hidden md:flex items-center gap-1" role="list">
            {NAV_LINKS.map(({ label, to }) => (
              <li key={label}>
                <Link
                  to={to}
                  smooth
                  onClick={() => setActiveLink(label)}
                  className={`relative px-3.5 py-2 text-sm font-medium rounded-lg transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                    activeLink === label
                      ? 'text-blue-600'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                  aria-current={activeLink === label ? 'page' : undefined}
                >
                  {label}
                  {activeLink === label && (
                    <span className="absolute bottom-0.5 left-3.5 right-3.5 h-0.5 bg-blue-600 rounded-full" />
                  )}
                </Link>
              </li>
            ))}
          </ul>

          {/* Right actions (Desktop & Hamburger Trigger) */}
          <div className="flex items-center gap-2">
            {user ? (
              // ── Desktop Connecté ──
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(o => !o)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {user.nom?.charAt(0).toUpperCase() ?? 'U'}
                  </div>
                  <span className="hidden md:block text-sm font-medium text-gray-700 max-w-[100px] truncate">
                    {user.nom}
                  </span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                    style={{ transform: dropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform .2s', color: '#94a3b8' }}>
                    <path d="M6 9l6 6 6-6"/>
                  </svg>
                </button>

                {/* Dropdown Menu
                {dropdownOpen && (
                  <div className="absolute right-0 top-[calc(100%+6px)] w-52 bg-white border border-gray-100 rounded-xl shadow-lg py-1.5 z-50">
                    <div className="px-4 py-2.5 border-b border-gray-50">
                      <p className="text-sm font-semibold text-gray-900 truncate">{user.nom}</p>
                      <p className="text-xs text-gray-400 truncate">{user.email}</p>
                    </div>

                    <Link to="/client/dashboard" onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
                      Mon profil
                    </Link>

                    <Link to="/mes-reservations" onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
                      Mes réservations
                    </Link>

                    {(user.role === 'ORGANISATEUR' || user.roles?.includes('ORGANISATEUR')) && (
                      <Link to="/organisateur/dashboard" onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
                        Dashboard organisateur
                      </Link>
                    )}

                    {(user.role === 'ADMIN' || user.roles?.includes('ADMIN')) && (
                      <Link to="/admin/dashboard" onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M12 2l3 7h7l-6 4 2 7-6-4-6 4 2-7-6-4h7z"/></svg>
                        Dashboard admin
                      </Link>
                    )}

                    <div className="border-t border-gray-50 mt-1 pt-1">
                      <button onClick={handleLogout}
                        className="flex items-center gap-2.5 w-full px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg>
                        Déconnexion
                      </button>
                    </div>
                  </div>
                )} */}
                {dropdownOpen && (
                <div className="absolute right-0 top-[calc(100%+6px)] w-52 bg-white border border-gray-100 rounded-xl shadow-lg py-1.5 z-50">
                  
                  {/* Header commun */}
                  <div className="px-4 py-2.5 border-b border-gray-50">
                    <p className="text-sm font-semibold text-gray-900 truncate">{user.nom}</p>
                    <p className="text-xs text-gray-400 truncate">{user.email}</p>
                  </div>

                  {/* Items selon rôle principal */}
                  {(() => {
                    const role = getPrimaryRole(user)

                    if (role === 'ADMIN') return (
                      <>
                        <Link to="/admin/dashboard" onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                            <path d="M12 2l3 7h7l-6 4 2 7-6-4-6 4 2-7-6-4h7z"/>
                          </svg>
                          Dashboard admin
                        </Link>
                      </>
                    )

                    if (role === 'ORGANISATEUR') return (
                      <>
                        <Link to="/organisateur/dashboard" onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                            <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                            <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
                          </svg>
                          Dashboard organisateur
                        </Link>
                      </>
                    )

                    // CLIENT (défaut)
                    return (
                      <>
                        <Link to="/client/dashboard" onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                            <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
                          </svg>
                          Mon profil
                        </Link>
                        <Link to="/mes-reservations" onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                            <rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>
                          </svg>
                          Mes réservations
                        </Link>
                      </>
                    )
                  })()}

                  {/* Déconnexion — toujours visible */}
                  <div className="border-t border-gray-50 mt-1 pt-1">
                    <button onClick={handleLogout}
                      className="flex items-center gap-2.5 w-full px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                        <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/>
                      </svg>
                      Déconnexion
                    </button>
                  </div>
                </div>
              )}
              </div>
            ) : (
              // ── Desktop Non connecté ──
              <>
                <Link to="/auth"
                  className="hidden md:inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors">
                  Connexion
                </Link>
                <Link to="/auth?page=register-client"
                  className="hidden md:inline-flex items-center px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-all">
                  S'inscrire
                </Link>
              </>
            )}

            {/* Mobile hamburger button */}
            <button
              type="button"
              aria-controls="mobile-menu"
              aria-expanded={isMenuOpen}
              aria-haspopup="true"
              onClick={openMenu}
              className="md:hidden ml-1 p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <span className="sr-only">Ouvrir le menu</span>
              <svg className="size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer Overlay */}
      <div
        className={`fixed inset-0 z-50 md:hidden transition-all duration-300 ${
          isMenuOpen ? 'visible' : 'invisible'
        }`}
        aria-hidden={!isMenuOpen}
      >
        {/* Backdrop */}
        <div
          className={`absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity duration-300 ${
            isMenuOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={closeMenu}
        />

        {/* Drawer content */}
        <div
          id="mobile-menu"
          ref={menuRef}
          tabIndex={-1}
          role="dialog"
          aria-modal="true"
          aria-label="Menu principal"
          className={`absolute top-0 right-0 h-full w-80 max-w-[85vw] bg-white shadow-xl flex flex-col outline-none transition-transform duration-300 ease-out ${
            isMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          {/* Drawer header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <img src={rovistaLogo} alt="Rovista" className="h-12 w-auto" />
            <button
              type="button"
              onClick={closeMenu}
              className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <span className="sr-only">Fermer le menu</span>
              <svg className="size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Drawer links */}
          <ul className="flex-1 overflow-y-auto px-3 py-4 space-y-1" role="list">
            {NAV_LINKS.map(({ label, to }) => (
              <li key={label}>
                <Link
                  to={to}
                  smooth
                  onClick={() => { setActiveLink(label); closeMenu() }}
                  className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                    activeLink === label
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                  aria-current={activeLink === label ? 'page' : undefined}
                >
                  {activeLink === label && (
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0" />
                  )}
                  {label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Drawer footer (Conditionné selon le statut d'authentification) */}
          <div className="px-5 py-5 border-t border-gray-100 space-y-2">
            {user ? (
              <>
                <div className="bg-gray-50 rounded-xl p-3 mb-2">
                  <p className="text-xs text-gray-400 font-medium">Connecté en tant que</p>
                  <p className="text-sm font-semibold text-gray-800 truncate">{user.nom}</p>
                </div>
                
                <Link to="/profile" onClick={closeMenu}
                  className="flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                  Mon Profil
                </Link>

                <button onClick={handleLogout}
                  className="flex items-center justify-center w-full px-4 py-2 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 rounded-xl transition-colors">
                  Déconnexion
                </button>
              </>
            ) : (
              <>
                <Link to="/auth" onClick={closeMenu}
                  className="flex items-center justify-center w-full px-4 py-2.5 text-sm font-medium text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                  Connexion
                </Link>
                <Link to="/auth?page=register-client" onClick={closeMenu}
                  className="flex items-center justify-center w-full px-4 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors">
                  S'inscrire
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}