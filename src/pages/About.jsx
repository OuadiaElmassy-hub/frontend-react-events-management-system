import { Link } from 'react-router-dom'

const STATS = [
  { value: '500+', label: 'Événements touristiques' },
  { value: '50k+', label: 'Participants' },
  { value: '12+', label: 'Régions du Maroc' },
  { value: '98%', label: 'Satisfaction' },
]

const WHY_US = [
  {
    icon: '🎯',
    title: 'Réservation instantanée',
    desc: 'Réservez votre place en moins de 60 secondes — sans compte obligatoire pour explorer le Maroc.'
  },
  {
    icon: '🔒',
    title: 'Paiement sécurisé',
    desc: 'Transactions protégées via CMI et Stripe avec les banques marocaines et internationales.'
  },
  {
    icon: '📍',
    title: 'Expériences locales',
    desc: 'Des festivals culturels, excursions et événements sélectionnés dans tout le Royaume.'
  },
  {
    icon: '🎟️',
    title: 'Billet QR code',
    desc: 'Recevez votre pass par email avec un QR code unique pour un accès fluide le jour J.'
  },
  {
    icon: '🗓️',
    title: 'Agenda culturel',
    desc: 'Planifiez vos voyages en sauvegardant vos moussems et festivals préférés.'
  },
  {
    icon: '🤝',
    title: 'Espace Organisateurs',
    desc: 'Créez, gérez et boostez la visibilité de vos événements touristiques via notre dashboard.'
  },
]

export default function About() {
  return (
    <section className="px-6 md:px-8 py-20 md:py-24 bg-transparent" aria-labelledby="about-heading">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block text-xs font-bold uppercase tracking-widest text-[#D97706] mb-3">
            À propos de AtlasEvents
          </span>
          <h2
            id="about-heading"
            className="text-3xl md:text-4xl font-extrabold text-[#1E1B4B] mb-5 leading-tight tracking-tight"
          >
            La plateforme événementielle & touristique<br className="hidden md:block" /> de référence au Maroc
          </h2>
          <p className="text-sm md:text-base text-gray-500 max-w-2xl mx-auto leading-relaxed">
            AtlasEvents connecte les voyageurs et locaux avec la richesse culturelle du Royaume. Festivals, excursions, sport et culture — découvrez, réservez et vivez le Maroc autrement.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-20">
          {STATS.map(({ value, label }) => (
            <div
              key={label}
              className="bg-white border border-orange-100/40 rounded-2xl p-6 text-center shadow-[0_10px_30px_rgba(0,0,0,0.015)] hover:border-orange-200/50 transition-all duration-300"
            >
              <div className="text-3xl md:text-4xl font-extrabold text-[#0F4C81] mb-1 tracking-tight">{value}</div>
              <div className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider">{label}</div>
            </div>
          ))}
        </div>

        {/* Why us */}
        <div>
          <div className="text-center mb-10">
            <h3 className="text-2xl font-bold text-[#1E1B4B]">
              Pourquoi choisir AtlasEvents ?
            </h3>
            <div className="w-10 h-0.5 bg-[#D97706] mx-auto mt-3 rounded-full" />
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
            {WHY_US.map(({ icon, title, desc }) => (
              <div
                key={title}
                className="bg-white border border-gray-100/70 rounded-2xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.01)] hover:shadow-xl hover:-translate-y-1 hover:border-orange-100 transition-all duration-300 group"
              >
                <div className="text-xl mb-4 bg-[#FAF6F0] w-12 h-12 flex items-center justify-center rounded-xl border border-orange-100/30 group-hover:bg-[#D97706]/10 transition-colors duration-300">
                  {icon}
                </div>
                <h4 className="font-bold text-gray-800 text-base mb-2 group-hover:text-[#D97706] transition-colors duration-200">
                  {title}
                </h4>
                <p className="text-sm text-gray-400 leading-relaxed group-hover:text-gray-500 transition-colors duration-200">
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  )
}