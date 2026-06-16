import { useNavigate } from "react-router-dom";
import {
  FaCalendarAlt, FaTicketAlt, FaUsers,
  FaStar, FaBolt, FaShieldAlt,
  FaArrowRight, FaCheckCircle, FaBuilding, FaMapMarkerAlt,
  FaPlay
} from "react-icons/fa";

// ── Données ────────────────────────────────────────────────────
const FEATURES = [
  {
    icon: <FaMapMarkerAlt />,
    color: "emerald",
    title: "Destinations authentiques",
    desc: "Mettez en avant vos plus belles expériences à Marrakech, Fès, Chefchaouen et dans tout le Maroc.",
  },
  {
    icon: <FaCalendarAlt />,
    color: "amber",
    title: "Réservation instantanée",
    desc: "Permettez aux voyageurs de réserver vos activités touristiques en quelques clics, 24h/24.",
  },
  {
    icon: <FaUsers />,
    color: "blue",
    title: "Guides & Pros Locaux",
    desc: "Rejoignez un network de professionnels et d'experts passionnés pour encadrer les voyageurs.",
  },
  {
    icon: <FaStar />,
    color: "rose",
    title: "Expériences vérifiées",
    desc: "Valorisez vos circuits grâce à notre label de validation avant publication.",
  },
  {
    icon: <FaShieldAlt />,
    color: "indigo",
    title: "Paiement sécurisé",
    desc: "Paiements cryptés, encaissements certifiés et reversements rapides sans risque d'impayés.",
  },
  {
    icon: <FaBolt />,
    color: "emerald",
    title: "Événements exclusifs",
    desc: "Proposez vos festivals, excursions et randonnées privées à une communauté active.",
  },
];

const STATS = [
  { value: "1 200+", label: "Expériences" },
  { value: "35", label: "Villes" },
  { value: "25 000+", label: "Réservations" },
  { value: "98%", label: "Satisfaction" },
];

const STEPS = [
  { num: "01", title: "Créez votre compte", desc: "Formulaire organisateur complété en seulement 2 minutes." },
  { num: "02", title: "Validation sous 24h", desc: "Notre équipe vérifie vos documents et valide votre accès." },
  { num: "03", title: "Publiez l'expérience", desc: "Configurez vos dates, tarifs et quotas depuis votre dashboard." },
  { num: "04", title: "Recevez vos voyageurs", desc: "Les réservations arrivent automatiquement sur votre tableau de bord." },
];

const TESTIMONIALS = [
  {
    name: "Amine Benjelloun",
    role: "Organisateur – Casablanca",
    avatar: "AB",
    text: "Grâce à AtlasEvents, mon excursion dans le désert a affiché complet en 48h. Le dashboard m'évite des dizaines d'emails.",
  },
  {
    name: "Sara El Fassi",
    role: "Fondatrice – TedX Marrakech",
    avatar: "SE",
    text: "La gestion des billets est vraiment fluide. Je recommande la plateforme à tous les professionnels au Maroc.",
  },
  {
    name: "Youssef Kaddouri",
    role: "Guide de Randonnée – Fès",
    avatar: "YK",
    text: "Zéro commission, une équipe réactive — c'est la plateforme qu'on attendait depuis longtemps au Maroc.",
  },
];

const VILLES = ["Marrakech", "Chefchaouen", "Merzouga", "Essaouira", "Fès", "Tanger", "Agadir", "Ouarzazate"];

const CATEGORIES = [
  "🏜️ Désert", "🏔️ Randonnée", "🎵 Festivals", 
  "🍴 Gastronomie", "🏄 Activités nautiques", "🏛️ Culture & Patrimoine"
];

const COLOR_MAP = {
  emerald: { bg: "bg-emerald-50",  icon: "text-emerald-600", border: "border-emerald-100" },
  amber:   { bg: "bg-amber-50",    icon: "text-amber-600",   border: "border-amber-100"   },
  blue:    { bg: "bg-blue-50",     icon: "text-blue-600",    border: "border-blue-100"    },
  rose:    { bg: "bg-rose-50",     icon: "text-rose-600",    border: "border-rose-100"    },
  indigo:  { bg: "bg-indigo-50",   icon: "text-indigo-600",  border: "border-indigo-100"  },
};

// ── Bouton Logique d'Origine Conservé ─────────────────────────
const JoinButton = ({ className = "", size = "md" }) => {
  const navigate = useNavigate();
  const sizes = {
    md: "px-6 py-3 text-sm md:text-base",
    lg: "px-8 py-4 text-base md:text-lg",
  };
  return (
    <button
      onClick={() => navigate("/auth?page=register-organisateur")}
      className={`inline-flex items-center gap-3 font-bold text-white bg-amber-500 hover:bg-amber-600 active:scale-95 rounded-xl transition-all duration-150 shadow-md ${sizes[size]} ${className}`}
    >
      <FaBuilding size={size === "lg" ? 18 : 15} />
      Rejoindre AtlasEvents
      <FaArrowRight size={size === "lg" ? 15 : 13} />
    </button>
  );
};

// ── Page Principale Rééquilibrée ───────────────────────────────
export default function OrganisateurLandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white text-gray-900 overflow-x-hidden antialiased text-base">

      {/* ═══ HERO PARTIE 1 : Dégradé Émeraude/Teal Profond ═══ */}
      <section className="relative bg-gradient-to-br from-emerald-900 via-teal-950 to-emerald-950 text-white overflow-hidden py-14 md:py-20">
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-white/5 rounded-full pointer-events-none blur-2xl" />
        
        <div className="relative z-10 max-w-6xl mx-auto px-6">
          <div className="max-w-3xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/10 rounded-full px-4 py-2 text-sm font-medium text-white/90 mb-6 backdrop-blur-sm">
              <span className="text-base">🇲🇦</span> Plus de 1 200 expériences touristiques au Maroc
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-tight mb-6 tracking-tight">
              Découvrez et partagez les meilleures <span className="text-amber-400">expériences</span> touristiques du Maroc
            </h1>

            <p className="text-base md:text-lg lg:text-xl text-white/80 mb-8 leading-relaxed max-w-2xl">
              Randonnées dans l'Atlas, festivals culturels, excursions dans le désert, événements gastronomiques et expériences locales : une seule plateforme pour explorer le Maroc.            
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <JoinButton size="lg" />
              <button
                onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })}
                className="inline-flex items-center gap-2 text-white/95 hover:text-white text-sm md:text-base font-bold transition-colors bg-white/5 hover:bg-white/10 px-5 py-3.5 rounded-xl border border-white/10 backdrop-blur-sm"
              >
                <div className="w-6 h-6 rounded-full border border-white/20 flex items-center justify-center bg-white/5">
                  <FaPlay size={7} className="ml-0.5" />
                </div>
                Voir comment ça marche
              </button>
            </div>

            {/* Stats du Hero */}
            <div className="flex flex-wrap gap-x-12 gap-y-3 mt-12 pt-8 border-t border-white/10">
              {STATS.map(s => (
                <div key={s.label}>
                  <p className="text-2xl md:text-3xl font-black text-amber-400">{s.value}</p>
                  <p className="text-white/60 text-xs font-semibold uppercase tracking-wider mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ VILLES DISPONIBLES (Bandeau fin) ════════════════════ */}
      <div className="bg-gradient-to-r from-teal-800 to-emerald-800 py-3 shadow-inner">
        <div className="max-w-6xl mx-auto px-6 flex items-center gap-4 overflow-x-auto no-scrollbar">
          <span className="text-xs md:text-sm text-amber-300 font-black uppercase tracking-wider whitespace-nowrap shrink-0 flex items-center gap-1.5">
            <FaMapMarkerAlt /> Disponible à :
          </span>
          <div className="flex gap-2 flex-nowrap">
            {VILLES.map(v => (
              <span key={v} className="text-xs md:text-sm bg-white/10 text-white border border-white/5 px-3.5 py-1 rounded-full whitespace-nowrap font-semibold">
                {v}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ═══ SECTION CATÉGORIES ═════════════════════════════════ */}
      <section className="max-w-6xl mx-auto px-6 py-12">
        <h2 className="text-2xl md:text-3xl font-extrabold text-center text-gray-900 mb-8 tracking-tight">
          Explorez le Maroc selon vos envies
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {CATEGORIES.map(cat => (
            <div
              key={cat}
              className="bg-gray-50 hover:bg-white rounded-xl border border-gray-100 p-5 text-center shadow-sm hover:shadow-md transition-all duration-150 cursor-pointer"
            >
              <span className="text-lg md:text-xl font-medium block">{cat}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ FEATURES / AVANTAGES ═══════════════════════════════ */}
      <section className="bg-gray-50/50 py-14 border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900">
              Tout ce dont vous avez besoin pour vos activités
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f) => {
              const c = COLOR_MAP[f.color] || COLOR_MAP.emerald;
              return (
                <div
                  key={f.title}
                  className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-all duration-200"
                >
                  <div className={`w-11 h-11 ${c.bg} ${c.icon} rounded-xl flex items-center justify-center text-xl mb-4`}>
                    {f.icon}
                  </div>
                  <h3 className="font-bold text-gray-900 text-base md:text-lg mb-2">{f.title}</h3>
                  <p className="text-gray-600 text-sm md:text-base leading-relaxed">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══ HOW IT WORKS (Processus épuré) ═════════════════════ */}
      <section id="how-it-works" className="bg-white py-14 border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-2xl md:text-3xl font-extrabold text-center text-gray-900 mb-10 tracking-tight">
            Démarrez en 4 étapes simples
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {STEPS.map((s) => (
              <div key={s.num} className="bg-gray-50 rounded-xl border border-gray-100/50 p-6 text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-teal-700 to-emerald-600 text-white rounded-xl flex items-center justify-center text-lg font-bold mx-auto mb-3 shadow-sm">
                  {s.num}
                </div>
                <h3 className="font-bold text-gray-900 mb-2 text-sm md:text-base">{s.title}</h3>
                <p className="text-gray-500 text-xs md:text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ TESTIMONIALS ═══════════════════════════════════════ */}
      <section className="max-w-6xl mx-auto px-6 py-14">
        <h2 className="text-2xl md:text-3xl font-extrabold text-center text-gray-900 mb-10">
          Ils nous font confiance
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t) => (
            <div key={t.name} className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex gap-0.5 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <FaStar key={i} className="text-amber-400 text-xs" />
                  ))}
                </div>
                <p className="text-gray-600 text-sm md:text-base leading-relaxed mb-5 italic">
                  "{t.text}"
                </p>
              </div>
              <div className="flex items-center gap-3 pt-3 border-t border-gray-50 mt-auto">
                <div className="w-9 h-9 rounded-full bg-teal-50 text-teal-700 text-xs font-bold flex items-center justify-center shrink-0">
                  {t.avatar}
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">{t.name}</p>
                  <p className="text-xs text-gray-400 font-medium">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ CTA FINAL (Logique intacte) ════════════════════════ */}
      <section className="bg-gradient-to-br from-teal-900 via-teal-800 to-emerald-900 text-white py-16 text-center relative overflow-hidden">
        <div className="relative z-10 max-w-3xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black mb-4 tracking-tight">
            Prêt à découvrir le Maroc autrement ?
          </h2>
          <p className="text-white/80 text-base md:text-lg mb-8 max-w-xl mx-auto">
            Réservez vos prochaines aventures, festivals et expériences locales partout au Maroc.
          </p>

          <ul className="flex flex-wrap items-center justify-center gap-6 mb-8 text-xs md:text-sm font-semibold">
            {["Inscription gratuite", "Validation sous 24h", "0% de commission"].map(item => (
              <li key={item} className="flex items-center gap-2 text-white/90">
                <FaCheckCircle className="text-amber-400 shrink-0" size={13} />
                {item}
              </li>
            ))}
          </ul>

          <JoinButton size="lg" className="mx-auto" />

          <p className="text-white/40 text-xs md:text-sm mt-6">
            Déjà inscrit ?{" "}
            <button
              onClick={() => navigate("/auth")}
              className="text-white/80 hover:text-white underline underline-offset-2 transition-colors font-bold"
            >
              Se connecter
            </button>
          </p>
        </div>
      </section>
    </div>
  );
}