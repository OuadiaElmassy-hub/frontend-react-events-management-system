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
    <section className="px-4 md:px-8 py-16 md:py-24 bg-transparent" aria-labelledby="about-heading">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="text-center mb-14">
          {/* Badge : Changement vers l'ocre marocain */}
          <span className="inline-block text-xs font-bold uppercase tracking-widest text-[#D97706] mb-3">
            À propos de Rovista
          </span>
          {/* Titre principal : Passage au Bleu Profond */}
          <h2
            id="about-heading"
            className="text-3xl md:text-4xl font-bold text-[#1E1B4B] mb-4 leading-tight"
          >
            La plateforme événementielle & touristique<br className="hidden md:block" /> de référence au Maroc
          </h2>
          <p className="text-base text-gray-600 max-w-xl mx-auto leading-relaxed">
            Rovista connecte les voyageurs et locaux avec la richesse culturelle du Royaume. Festivals, excursions, sport et culture — découvrez, réservez et vivez le Maroc autrement.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          {STATS.map(({ value, label }) => (
            <div
              key={label}
              className="bg-white border border-orange-100/40 rounded-2xl p-5 text-center shadow-xs"
            >
              {/* Valeurs des stats en Bleu Majorelle */}
              <div className="text-3xl font-bold text-[#0F4C81] mb-1">{value}</div>
              <div className="text-xs text-gray-500 font-medium">{label}</div>
            </div>
          ))}
        </div>

        {/* Why us */}
        <div className="mb-16">
          <h3 className="text-xl font-bold text-[#1E1B4B] mb-8 text-center">
            Pourquoi choisir Rovista ?
          </h3>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5">
            {WHY_US.map(({ icon, title, desc }) => (
              <div
                key={title}
                className="bg-white border border-gray-100 rounded-2xl p-6 shadow-xs hover:shadow-md hover:border-orange-200/60 transition-all group"
              >
                <div className="text-2xl mb-3 bg-[#FAF6F0] w-10 h-10 flex items-center justify-center rounded-xl">{icon}</div>
                {/* Effet hover text-color basculant sur l'ocre */}
                <h4 className="font-semibold text-gray-900 mb-1.5 group-hover:text-[#D97706] transition-colors">
                  {title}
                </h4>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA banner : Dégradé du Bleu Majorelle profond vers une touche subtile */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0F4C81] to-[#1E1B4B] p-8 md:p-12 text-white text-center shadow-lg shadow-blue-950/10">
          {/* Motifs circulaires décoratifs translucides */}
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/5" />
          <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-white/5" />

          <div className="relative">
            <h3 className="text-2xl md:text-3xl font-bold mb-3">
              Prêt à vivre votre prochaine expérience ?
            </h3>
            <p className="text-blue-100 mb-7 text-sm md:text-base max-w-md mx-auto">
              Rejoignez les milliers de passionnés et d'organisateurs qui dynamisent le tourisme événementiel national.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {/* Bouton Principal : Blanc et texte Bleu pour trancher */}
              <Link
                to="/events#events-list"
                className="px-6 py-2.5 bg-white text-[#0F4C81] text-sm font-semibold rounded-xl hover:bg-[#FAF6F0] transition-colors focus:outline-none"
              >
                Explorer les événements
              </Link>
              {/* Bouton Secondaire : Bordures blanches légères avec fond ocre au survol pour le rappel festif */}
              <Link
                to="/register"
                className="px-6 py-2.5 bg-white/10 border border-white/30 text-white text-sm font-semibold rounded-xl hover:bg-[#D97706] hover:border-[#D97706] transition-colors focus:outline-none"
              >
                Créer un compte
              </Link>
            </div>
          </div>
        </div>

      </div>
    </section>
  )
}