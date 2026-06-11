import marocBackground from '../assets/backgrounds/maroc-touristique.jpg'

const STATS = [
  { value: '500+', label: 'Événements' },
  { value: '12', label: 'Villes' },
  { value: '50k+', label: 'Participants' },
]

const TAGS = ['🎵 Concerts', '🎤 Conférences', '⚽ Sport', '🎭 Culture', '🍽️ Gastronomie']

const HeroSection = () => {
  return (
    <section
      className="relative overflow-hidden min-h-[580px] md:min-h-[640px] flex items-center"
      aria-labelledby="hero-heading"
    >
      {/* Background image */}
      <img
        src={marocBackground}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover object-center scale-105"
        style={{ filter: 'brightness(0.40)' }} // Légèrement plus sombre pour faire ressortir l'ocre et le blanc
      />

      {/* Gradient overlay — bottom fade fluide vers la couleur de fond de la Home */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/80" />
      
      {/* Correction ici : fusion parfaite avec le bg-[#FAF6F0] de la page d'accueil */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#FAF6F0] to-transparent" />

      {/* Content */}
      <div className="relative w-full max-w-3xl mx-auto px-6 py-20 md:py-28 text-center text-white">

        {/* Badge culturel */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-xs font-medium text-white/90 mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-[#D97706] animate-pulse" /> {/* Point lumineux Ocre */}
          Découvrez la richesse culturelle du Maroc
        </div>

        {/* Heading */}
        <h1
          id="hero-heading"
          className="text-4xl md:text-6xl font-bold leading-tight tracking-tight mb-4"
          style={{ textShadow: '0 4px 24px rgba(0,0,0,0.6)' }}
        >
          Vivez des moments{' '}
          {/* Changement de couleur : Ambre/Ocre chaleureux de Marrakech */}
          <span className="text-[#D97706]">inoubliables</span>
        </h1>

        <p className="text-base md:text-lg text-white/80 mb-8 max-w-xl mx-auto leading-relaxed">
          Festivals, moussems, excursions, sport et culture — trouvez et réservez votre prochaine expérience marocaine en quelques secondes.
        </p>

        {/* Tags : Survol aux couleurs de la charte */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {TAGS.map(tag => (
            <span
              key={tag}
              className="px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/15 text-xs text-white/90 hover:bg-[#D97706] hover:border-[#D97706] cursor-pointer transition-all duration-200"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Stats (Désactivées comme dans ton code initial, mais prêtes si besoin) */}
        {/* <div className="flex justify-center gap-8 md:gap-12">
          {STATS.map(({ value, label }) => (
            <div key={label} className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-white">{value}</div>
              <div className="text-xs text-white/60 mt-0.5 uppercase tracking-widest">{label}</div>
            </div>
          ))}
        </div> */}
      </div>
    </section>
  )
}

export default HeroSection