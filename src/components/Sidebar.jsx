import { useState, useRef, useEffect } from 'react'
import { FaEuroSign, FaMapMarkerAlt, FaFilter, FaTimes } from 'react-icons/fa'

// ─── DatePicker ───────────────────────────────────────────────────────────────
const MONTHS_FR = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre']

const DatePicker = ({ value, onChange, placeholder = 'Choisir une date' }) => {
  const today = new Date()
  const [open, setOpen] = useState(false)
  const [viewYear, setViewYear] = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth())
  const wrapRef = useRef(null)

  useEffect(() => {
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1) }
    else setViewMonth(m => m - 1)
  }

  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1) }
    else setViewMonth(m => m + 1)
  }

  const buildDays = () => {
    const firstDay = new Date(viewYear, viewMonth, 1)
    let startDow = firstDay.getDay()
    startDow = startDow === 0 ? 6 : startDow - 1
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
    const prevDays = new Date(viewYear, viewMonth, 0).getDate()
    const cells = []
    for (let i = 0; i < startDow; i++)
      cells.push({ day: prevDays - startDow + 1 + i, type: 'other' })
    for (let d = 1; d <= daysInMonth; d++) {
      const iso = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
      const isToday = d === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear()
      cells.push({ day: d, type: 'current', iso, isToday })
    }
    const trailing = cells.length % 7 === 0 ? 0 : 7 - (cells.length % 7)
    for (let i = 1; i <= trailing; i++)
      cells.push({ day: i, type: 'other' })
    return cells
  }

  const formatLabel = (iso) => {
    if (!iso) return null
    const [y, m, d] = iso.split('-').map(Number)
    return new Date(y, m - 1, d).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })
  }

  const days = buildDays()

  return (
    <div ref={wrapRef} style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm transition-all hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
        style={{ color: value ? '#1e293b' : '#94a3b8' }}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400 shrink-0">
          <rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>
        </svg>
        <span className="flex-1 text-left truncate">{formatLabel(value) ?? placeholder}</span>
        {value && (
          <span
            onClick={(e) => { e.stopPropagation(); onChange('') }}
            className="text-gray-300 hover:text-gray-500 cursor-pointer"
          >
            <FaTimes size={10} />
          </span>
        )}
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
          style={{ transition: 'transform .2s', transform: open ? 'rotate(180deg)' : 'none', color: '#94a3b8', flexShrink: 0 }}>
          <path d="M6 9l6 6 6-6"/>
        </svg>
      </button>

      {open && (
        <div className="absolute left-0 top-[calc(100%+6px)] z-50 bg-white border border-gray-100 rounded-xl shadow-lg p-3" style={{ minWidth: 260 }}>
          <div className="flex items-center justify-between mb-3">
            <button type="button" onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-gray-50 text-gray-400 hover:text-gray-700 transition-colors">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M15 18l-6-6 6-6"/></svg>
            </button>
            <span className="text-sm font-semibold text-gray-800">{MONTHS_FR[viewMonth]} {viewYear}</span>
            <button type="button" onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-gray-50 text-gray-400 hover:text-gray-700 transition-colors">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>
            </button>
          </div>
          <div className="grid grid-cols-7 mb-1">
            {['Lu','Ma','Me','Je','Ve','Sa','Di'].map(d => (
              <div key={d} className="text-center text-[10px] font-semibold text-gray-400 py-1">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-0.5">
            {days.map((cell, i) => {
              const isSelected = cell.type === 'current' && cell.iso === value
              return (
                <button
                  key={i}
                  type="button"
                  disabled={cell.type !== 'current'}
                  onClick={() => { if (cell.type === 'current') { onChange(cell.iso); setOpen(false) } }}
                  className={[
                    'aspect-square flex items-center justify-center text-xs rounded-lg transition-all',
                    cell.type !== 'current' ? 'text-gray-200 cursor-default' :
                    isSelected ? 'bg-blue-600 text-white font-semibold' :
                    cell.isToday ? 'border border-blue-200 text-blue-600 font-semibold hover:bg-blue-50' :
                    'text-gray-700 hover:bg-gray-100 cursor-pointer'
                  ].join(' ')}
                >
                  {cell.day}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────
const VILLES = ['Marrakech', 'Fès', 'Chefchaouen', 'Agadir', 'Rabat', 'Casablanca', 'Tanger']
const INITIAL = { date: '', prixMax: 200, ville: '' }

const Sidebar = ({ filters = INITIAL, onFilterChange }) => {
  const activeCount = [filters.date, filters.ville, filters.prixMax !== 200].filter(Boolean).length

  const set = (key, value) => {
    onFilterChange({ ...filters, [key]: value })
  }

  const reset = () => {
    onFilterChange(INITIAL)
  }

  return (
    <aside className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sticky top-24 w-72 max-h-[calc(100vh-6rem)] overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-bold text-gray-900 flex items-center gap-2 text-base">
          <FaFilter className="text-blue-500" size={13} />
          Filtres
          {activeCount > 0 && (
            <span className="ml-1 inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-bold">
              {activeCount}
            </span>
          )}
        </h3>
        {activeCount > 0 && (
          <button
            onClick={reset}
            className="text-xs text-gray-400 hover:text-red-400 transition-colors flex items-center gap-1"
          >
            <FaTimes size={9} /> Tout effacer
          </button>
        )}
      </div>

      {/* Date */}
      <Section label="Date" icon={
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400">
          <rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>
        </svg>
      }>
        <DatePicker value={filters.date} onChange={(v) => set('date', v)} />
      
        {/* Suggestions rapides */}
        <div className="flex flex-wrap gap-1.5 mt-2">
          {[
            { label: "Aujourd'hui", getValue: () => {
              const d = new Date()
              return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
            }},
            { label: 'Demain', getValue: () => {
              const d = new Date(); d.setDate(d.getDate() + 1)
              return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
            }},
            { label: 'Ce week-end', getValue: () => {
              const d = new Date()
              const day = d.getDay()
              const diff = day === 6 ? 0 : day === 0 ? -1 : 6 - day
              d.setDate(d.getDate() + diff)
              return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
            }},
            { label: 'Cette semaine', getValue: () => {
              const d = new Date()
              const day = d.getDay() === 0 ? 6 : d.getDay() - 1
              d.setDate(d.getDate() - day)
              return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
            }},
          ].map(({ label, getValue }) => {
            const val = getValue()
            const isActive = filters.date === val
            return (
              <button
                key={label}
                type="button"
                onClick={() => set('date', isActive ? '' : val)}
                className={`text-[11px] px-2.5 py-1 rounded-full border transition-all ${
                  isActive
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : 'border-gray-200 text-gray-500 hover:border-blue-300 hover:text-blue-500'
                }`}
              >
                {label}
              </button>
            )
          })}
        </div>
      </Section>

      {/* Prix */}
      <Section label={<>Prix max : <span className="text-blue-600 font-bold">{filters.prixMax} DH</span></>} icon={<FaEuroSign className="text-blue-400" size={12} />}>
        <input
          type="range" min="0" max="500" step="10"
          value={filters.prixMax}
          onChange={(e) => set('prixMax', Number(e.target.value))}
          className="w-full accent-blue-500"
        />
        <div className="flex justify-between text-[11px] text-gray-400 mt-0.5">
          <span>0 DH</span><span>500 DH</span>
        </div>
        <div className="flex gap-1.5 flex-wrap mt-2">
          {[100, 200, 300, 500].map(v => (
            <button
              key={v}
              type="button"
              onClick={() => set('prixMax', v)}
              className={`text-[11px] px-2.5 py-1 rounded-full border transition-all ${
                filters.prixMax === v
                  ? 'bg-blue-600 border-blue-600 text-white'
                  : 'border-gray-200 text-gray-500 hover:border-blue-300 hover:text-blue-500'
              }`}
            >
              {v} DH
            </button>
          ))}
        </div>
      </Section>

      {/* Ville */}
      <Section label="Ville" icon={<FaMapMarkerAlt className="text-blue-400" size={12} />}>
        <div className="relative">
          <FaMapMarkerAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={11} />
          <input
            type="text"
            placeholder="Rechercher une ville…"
            value={filters.ville}
            onChange={(e) => set('ville', e.target.value)}
            className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all placeholder-gray-300"
          />
          {filters.ville && (
            <button
              type="button"
              onClick={() => set('ville', '')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500"
            >
              <FaTimes size={10} />
            </button>
          )}
        </div>
        <p className="text-[10px] uppercase tracking-widest text-gray-300 font-semibold mt-3 mb-1.5">Villes populaires</p>
        <div className="flex flex-col gap-1">
          {VILLES.map(v => (
            <button
              key={v}
              type="button"
              onClick={() => set('ville', filters.ville === v ? '' : v)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-left transition-all ${
                filters.ville === v
                  ? 'bg-blue-50 text-blue-700 font-medium'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${filters.ville === v ? 'bg-blue-500' : 'bg-gray-200'}`} />
              {v}
            </button>
          ))}
        </div>
      </Section>

      {/* Reset */}
      <button
        onClick={reset}
        className="w-full mt-2 py-2 rounded-xl border border-gray-200 text-sm text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-all"
      >
        Réinitialiser les filtres
      </button>
    </aside>
  )
}

// ─── Section helper ───────────────────────────────────────────────────────────
const Section = ({ label, icon, children }) => (
  <div className="mb-5">
    <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 mb-2">
      {icon} {label}
    </label>
    {children}
    <div className="mt-5 border-t border-gray-50" />
  </div>
)

export default Sidebar