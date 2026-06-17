import marocBackground from '../assets/backgrounds/maroc-touristique.jpg'

const TAGS = ['🎵 Concerts', '🎤 Conférences', '⚽ Sport', '🎭 Culture', '🍽️ Gastronomie']

const HeroSection = () => {
  return (
    <section
      className="relative overflow-hidden min-h-[600px] md:min-h-[680px] flex items-center"
      aria-labelledby="hero-heading"
    >
      {/* Background image */}
      <img
        src={marocBackground}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover object-center scale-102 transition-transform duration-700"
        style={{ filter: 'brightness(0.35)' }}
      />

      {/* Overlays de dégradés fluides */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/70" />
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#FAF6F0] via-[#FAF6F0]/60 to-transparent" />

      {/* Content */}
      <div className="relative w-full max-w-3xl mx-auto px-6 py-24 text-center text-white z-10">

        {/* Badge culturel */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-white/90 mb-8 tracking-wide shadow-sm">
          <span className="w-2 h-2 rounded-full bg-[#D97706] animate-pulse" />
          Découvrez la richesse culturelle du Maroc
        </div>

        {/* Heading */}
        <h1
          id="hero-heading"
          className="text-4xl md:text-6xl font-extrabold leading-tight tracking-tight mb-6"
          style={{ textShadow: '0 4px 30px rgba(0,0,0,0.5)' }}
        >
          Vivez des moments{' '}
          <span className="text-[#D97706] bg-gradient-to-r from-[#D97706] to-[#F59E0B] bg-clip-text text-transparent">
            inoubliables
          </span>
        </h1>

        <p className="text-sm md:text-base text-white/80 mb-10 max-w-xl mx-auto leading-relaxed font-medium">
          Festivals, moussems, excursions, sport et culture — trouvez et réservez votre prochaine expérience marocaine en quelques secondes.
        </p>

        {/* Tags interactifs */}
        <div className="flex flex-wrap justify-center gap-2.5 max-w-2xl mx-auto">
          {TAGS.map(tag => (
            <span
              key={tag}
              className="px-4 py-2 rounded-full bg-white/5 backdrop-blur-xs border border-white/10 text-xs font-medium text-white/90 hover:bg-[#D97706] hover:border-[#D97706] hover:-translate-y-0.5 hover:shadow-md cursor-pointer transition-all duration-200"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}

export default HeroSection