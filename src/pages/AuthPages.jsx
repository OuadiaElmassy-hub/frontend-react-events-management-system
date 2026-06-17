import { useState } from "react";
import {
  FaEye, FaEyeSlash, FaCalendarAlt, FaUser, FaEnvelope,
  FaLock, FaPhone, FaMapMarkerAlt, FaBuilding, FaIdCard,
  FaSpinner, FaCheckCircle, FaArrowRight, FaArrowLeft,
  FaTicketAlt, FaStar, FaUsers, FaHome,
  FaUserCircle,
  FaIdBadge
} from "react-icons/fa";
import rovistaLogo from '../assets/logos/rovista.svg'
import { useAuth } from "../context/AuthContext";
import { jwtDecode } from "jwt-decode";
import { useLocation, useNavigate } from "react-router-dom";
import apiFetch , { BASE_URL } from "../utils/fetchFn";


// ═══════════════════════════════════════════════════════════════
// CONFIG API
// ═══════════════════════════════════════════════════════════════
// const BASE_URL = import.meta.env?.VITE_API_URL || "http://localhost:8080/api";

// const apiFetch = async (path, options = {}) => {

//   const token = localStorage.getItem("token");
  
//   const res = await fetch(`${BASE_URL}${path}`, {
//     headers: { 
//       "Content-Type": "application/json", 

//       // Injecter le token si présent (routes publiques ne l'ont pas)
//       ...(token && { Authorization: `Bearer ${token}` }),
      
//       ...options.headers },
//     ...options,
//   });

//   // Déconnexion auto si le token est rejeté par le backend
//   if (res.status === 401) {
//     localStorage.removeItem("token");
//     window.location.href = "/auth";
//     throw new Error("Session expirée, veuillez vous reconnecter");
//   }

//   const data = await res.json().catch(() => ({}));
//   if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`);
//   return data;
// };

// ═══════════════════════════════════════════════════════════════
// REUSABLE UI
// ═══════════════════════════════════════════════════════════════
const Spinner = () => (
  <FaSpinner className="animate-spin text-white text-sm" />
);

const InputField = ({
  label, name, type = "text", value, onChange,
  placeholder, icon, required = false, hint, error
}) => {
  const [show, setShow] = useState(false);
  const isPassword = type === "password";
  const inputType  = isPassword ? (show ? "text" : "password") : type;

  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-semibold text-gray-700">
        {label}{required && <span className="text-rose-500 ml-1">*</span>}
      </label>
      <div className="relative">
        {icon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none">
            {icon}
          </div>
        )}
        <input
          type={inputType}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className={`w-full py-3 rounded-xl border text-sm outline-none transition-all
            ${icon ? "pl-10 pr-4" : "px-4"}
            ${isPassword ? "pr-11" : ""}
            ${error
              ? "border-rose-400 bg-rose-50 focus:ring-2 focus:ring-rose-300"
              : "border-gray-200 bg-gray-50 focus:bg-white focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
            }`}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow(s => !s)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
            {show ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
          </button>
        )}
      </div>
      {error && <p className="text-xs text-rose-600 font-medium">{error}</p>}
      {hint && !error && <p className="text-xs text-gray-400">{hint}</p>}
    </div>
  );
};

const PasswordStrength = ({ password }) => {
  const checks = [
    { label: "8 caractères minimum", ok: password.length >= 8 },
    { label: "Une majuscule",         ok: /[A-Z]/.test(password) },
    { label: "Un chiffre",            ok: /[0-9]/.test(password) },
    { label: "Un caractère spécial",  ok: /[!@#$%^&amp;*]/.test(password) },
  ];
  const score = checks.filter(c => c.ok).length;
  const colors = ["bg-gray-200", "bg-rose-400", "bg-amber-400",
                  "bg-blue-400", "bg-emerald-500"];
  const labels = ["", "Faible", "Moyen", "Bon", "Fort"];

  if (!password) return null;

  return (
    <div className="space-y-2 mt-1">
      <div className="flex gap-1">
        {[1,2,3,4].map(i => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-all ${
            i <= score ? colors[score] : "bg-gray-200"
          }`} />
        ))}
      </div>
      <div className="flex items-center justify-between">
        <div className="flex flex-wrap gap-x-3 gap-y-1">
          {checks.map(c => (
            <span key={c.label} className={`text-xs flex items-center gap-1 ${
              c.ok ? "text-emerald-600" : "text-gray-400"
            }`}>
              <FaCheckCircle size={9} className={c.ok ? "text-emerald-500" : "text-gray-300"} />
              {c.label}
            </span>
          ))}
        </div>
        {score > 0 && (
          <span className={`text-xs font-semibold ${
            score === 4 ? "text-emerald-600"
            : score === 3 ? "text-blue-600"
            : score === 2 ? "text-amber-600"
            : "text-rose-600"
          }`}>{labels[score]}</span>
        )}
      </div>
    </div>
  );
};

// ── Panneau décoratif gauche ──────────────────────────────────
const SidePanel = ({ mode }) => {
  const isLogin = mode === "login";
  const isClient = mode === "register-client";

  const content = {
    login: {
      title:    "Bienvenue sur AtlasEvents",
      subtitle: "Votre plateforme d'événements au Maroc",
      stats: [
        { icon: <FaCalendarAlt />, value: "500+",  label: "Événements" },
        { icon: <FaUsers />,       value: "50k+",  label: "Membres" },
        { icon: <FaStar />,        value: "4.9",   label: "Note moyenne" },
      ],
      testimonial: {
        text: "AtlasEvents m'a permis de découvrir des concerts incroyables à Casablanca. La réservation est simple et rapide.",
        author: "Sophie M., Cliente",
      },
    },
    "register-client": {
      title:    "Rejoignez l'aventure",
      subtitle: "Des milliers d'événements vous attendent",
      stats: [
        { icon: <FaTicketAlt />, value: "Gratuit",  label: "Inscription" },
        { icon: <FaStar />,      value: "Promos",   label: "Exclusives" },
        { icon: <FaCalendarAlt />,value: "Illimité", label: "Réservations" },
      ],
      testimonial: {
        text: "J'ai réservé mon premier concert en moins de 2 minutes. Les promotions pour les membres sont vraiment intéressantes !",
        author: "Jean D., Client depuis 2024",
      },
    },
    "register-organisateur": {
      title:    "Développez votre activité",
      subtitle: "La plateforme des organisateurs professionnels",
      stats: [
        { icon: <FaUsers />,      value: "10k+", label: "Participants/mois" },
        { icon: <FaTicketAlt />,  value: "0%",   label: "Commission" },
        { icon: <FaStar />,       value: "Pro",  label: "Outils inclus" },
      ],
      testimonial: {
        text: "Grâce à AtlasEvents, mes concerts affichent complet en quelques heures. Le tableau de bord est une vraie révolution.",
        author: "Amine B., Organisateur Pro",
      },
    },
  };

  const c = content[mode] || content.login;

  return (
    <div className="hidden lg:flex w-[420px] flex-shrink-0 flex-col bg-gradient-to-br from-violet-700 via-violet-600 to-indigo-700 p-10 text-white relative overflow-hidden">
      {/* Cercles décoratifs */}
      <div className="absolute -top-20 -right-20 w-72 h-72 bg-white/5 rounded-full" />
      <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-white/5 rounded-full" />
      <div className="absolute top-1/2 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2" />

      {/* Logo */}
      <div className="flex items-center gap-3 mb-12 relative z-10">
        <div className="w-16 h-16 bg-white/40 rounded-xl flex items-center justify-center backdrop-blur-sm shadow-lg">
            <img src={rovistaLogo} alt="Rovista" className="h-14 w-14" />
        </div>
        <div>
            <p className="font-bold text-xl tracking-tight">AtlasEvents</p>
            <p className="text-white/60 text-xs">Maroc</p>
        </div>
      </div>


      {/* Texte principal */}
      <div className="relative z-10 flex-1">
        <h2 className="text-3xl font-bold leading-tight mb-3">{c.title}</h2>
        <p className="text-white/70 text-base mb-10">{c.subtitle}</p>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          {c.stats.map((s, i) => (
            <div key={i} className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm text-center">
              <div className="text-white/70 text-lg mb-2 flex justify-center">{s.icon}</div>
              <p className="font-bold text-lg">{s.value}</p>
              <p className="text-white/60 text-xs mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Témoignage */}
        <div className="bg-white/10 rounded-2xl p-5 backdrop-blur-sm">
          <div className="flex gap-0.5 mb-3">
            {[...Array(5)].map((_, i) => (
              <FaStar key={i} className="text-amber-300 text-xs" />
            ))}
          </div>
          <p className="text-white/90 text-sm leading-relaxed italic mb-3">
            "{c.testimonial.text}"
          </p>
          <p className="text-white/60 text-xs font-medium">{c.testimonial.author}</p>
        </div>
      </div>

      {/* Villes */}
      <div className="relative z-10 mt-8 pt-6 border-t border-white/10">
        <p className="text-white/40 text-xs mb-3">Disponible dans</p>
        <div className="flex flex-wrap gap-2">
          {["Casablanca", "Rabat", "Marrakech", "Fès", "Tanger", "Agadir"].map(v => (
            <span key={v} className="text-xs bg-white/10 text-white/70 px-3 py-1 rounded-full">
              {v}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// PAGE : LOGIN
// POST /api/auth/login → { email, password }
// ← { token, role, nom }
// ═══════════════════════════════════════════════════════════════

const LoginPage = ({ onNavigate, onSuccess }) => {
  const [form, setForm] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const { login } = useAuth(); // 💡 On récupère la fonction login du contexte
  const navigate = useNavigate(); // 💡 Hook de redirection fluide

  const handleChange = e =>
    setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); 
    setError("");

    try {
      const data = await apiFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify(form),
      });

      // 1. On passe le token au contexte global. 
      // La fonction login du contexte va enregistrer le token ET décoder le user instantanément.
      login(data.token);

      // 2. Optionnel : Si vous avez besoin du nom hors du JWT, vous pouvez le garder
      localStorage.setItem("nom", data.nom);

      // 3. Redirection instantanée sans recharger la page complète
      const routes = {
        ADMIN:        "/admin/dashboard",
        ORGANISATEUR: "/organisateur/dashboard",
        CLIENT:       "/client/dashboard",
      };

      // On récupère le premier rôle retourné par l'API
      const firstRole = data.roles?.[0];
      const targetRoute = routes[firstRole] || "/";

      // 💡 Redirection fluide sans aucun clignotement ni rechargement lourd
      //navigate(targetRoute, { replace: true });

      // 💡 2. On attend le prochain cycle d'exécution (macro-task) pour naviguer.
  // Cela garantit à 100% que apiFetch trouvera le token dans le localStorage.
    navigate(targetRoute, { replace: true });

    } catch (e) {
      setError(e.message || "Erreur de connexion");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <SidePanel mode="login" />

      {/* Formulaire */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          {/* <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-9 h-9 bg-violet-600 rounded-xl flex items-center justify-center">
              <FaCalendarAlt className="text-white text-sm" />
            </div>
            <span className="font-bold text-xl text-gray-900">EventHub</span>
          </div> */}

          <div className="lg:hidden flex items-center gap-3 mb-6">
            <div className="w-16 h-16 bg-white/40 rounded-xl flex items-center justify-center backdrop-blur-sm shadow-lg">
              <img src={rovistaLogo} alt="Rovista" className="h-14 w-14" />
            </div>
            <div>
              <span className="font-bold text-xl text-gray-900">AtlasEvents</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-violet-600 mb-6 font-medium transition border border-gray-200 hover:border-violet-600 px-3 py-1.5 rounded-xl"
          >
            <FaHome size={13} />
            Retour à l'accueil
          </button>
      
          <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/60 p-8 border border-gray-100">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900">Connexion</h1>
              <p className="text-gray-500 text-sm mt-1">
                Accédez à votre espace personnel
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <InputField
                label="Username"
                name="username"
                type="text"
                value={form.username}
                onChange={handleChange}
                placeholder="mon username"
                icon={<FaEnvelope />}
                required
              />

              <InputField
                label="Mot de passe"
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Votre mot de passe"
                icon={<FaLock />}
                required
              />

              {/* Mot de passe oublié */}
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => onNavigate?.("forgot-password")}
                  className="text-sm text-violet-600 hover:text-violet-700 font-medium hover:underline">
                  Mot de passe oublié ?
                </button>
              </div>

              {/* {error && (
                <div className="bg-rose-50 border border-rose-200 rounded-xl p-3.5 text-sm text-rose-700 font-medium flex items-center gap-2">
                  <span>⚠️</span> {error}
                </div>
              )} */}

              {error && (
                <div className={`border rounded-xl p-3.5 text-sm font-medium flex items-center gap-2 ${
                    error.toLowerCase().includes("attente") 
                    ? "bg-amber-50 border-amber-200 text-amber-700" 
                    : "bg-rose-50 border-rose-200 text-rose-700"
                }`}>
                    <span>{error.toLowerCase().includes("attente") ? "⏳" : "⚠️"}</span> 
                    {error}
                </div>
                )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white py-3.5 rounded-xl font-semibold transition flex items-center justify-center gap-2 text-sm">
                {loading ? <><Spinner /> Connexion…</> : <>Se connecter <FaArrowRight size={12} /></>}
              </button>
            </form>

            {/* Séparateur */}
            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px bg-gray-100" />
              <span className="text-xs text-gray-400 font-medium">Pas encore inscrit ?</span>
              <div className="flex-1 h-px bg-gray-100" />
            </div>

            {/* Liens inscription */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => onNavigate?.("register-client")}
                className="flex flex-col items-center gap-1.5 p-4 border-2 border-gray-100 rounded-2xl hover:border-violet-200 hover:bg-violet-50 transition group">
                <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center group-hover:bg-blue-100 transition">
                  <FaUser size={13} />
                </div>
                <span className="text-xs font-semibold text-gray-700">Je suis client</span>
              </button>
              <button
                type="button"
                onClick={() => onNavigate?.("register-organisateur")}
                className="flex flex-col items-center gap-1.5 p-4 border-2 border-gray-100 rounded-2xl hover:border-violet-200 hover:bg-violet-50 transition group">
                <div className="w-8 h-8 bg-violet-50 text-violet-600 rounded-xl flex items-center justify-center group-hover:bg-violet-100 transition">
                  <FaBuilding size={13} />
                </div>
                <span className="text-xs font-semibold text-gray-700">Je suis organisateur</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// PAGE : INSCRIPTION CLIENT
// POST /api/auth/register/client
// Body: { username, email, password, nom, phone, ville }
// ← { token, role, nom }
// ═══════════════════════════════════════════════════════════════
const RegisterClientPage = ({ onNavigate, onSuccess }) => {
  const [form, setForm] = useState({
    nom: "", prenom: "", username: "", email: "",
    phone: "", ville: "",
    password: "", confirmPassword: "",
  });
  const [loading, setLoading]   = useState(false);
  const [errors, setErrors]     = useState({});
  const [apiError, setApiError] = useState("");
  const [done, setDone]         = useState(false);

  const handleChange = e =>
    setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const validate = () => {
    const errs = {};
    if (!form.nom.trim())              errs.nom      = "Le nom est requis";
    if (!form.prenom.trim())              errs.prenom      = "Le prenom est requis";
    if (!form.username.trim())         errs.username = "Le nom d'utilisateur est requis";
    if (!form.email.includes("@"))     errs.email    = "Email invalide";
    if (form.password.length < 8)      errs.password = "8 caractères minimum";
    if (form.password !== form.confirmPassword)
                                       errs.confirmPassword = "Les mots de passe ne correspondent pas";
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({}); setApiError(""); setLoading(true);

    try {
      const { confirmPassword, ...body } = form;
      const data = await apiFetch("/auth/register/client", {
        method: "POST",
        body: JSON.stringify(body),
      });
      // localStorage.setItem("token", data.token);
      // localStorage.setItem("roles",  data.roles);
      // localStorage.setItem("nom",   data.nom);
      setDone(true);
      setTimeout(() => {
        if (onSuccess) onSuccess(data.token); //data.roles
        else window.location.href = "/client";
      }, 2000);
    } catch (e) { setApiError(e.message); }
    finally { setLoading(false); }
  };

  if (done) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl shadow-xl p-10 text-center max-w-sm w-full">
        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <FaCheckCircle className="text-emerald-500 text-3xl" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Compte créé !</h2>
        <p className="text-gray-500 text-sm">
          Bienvenue sur AtlasEvents. Redirection en cours…
        </p>
        <div className="mt-4 flex justify-center">
          <div className="w-6 h-6 border-2 border-violet-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    </div>
  );

  const villes = ["Casablanca","Rabat","Marrakech","Fès","Tanger","Agadir","Meknès","Oujda","Tétouan","Salé"];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <SidePanel mode="register-client" />

      <div className="flex-1 flex items-center justify-center p-6 overflow-y-auto">
        <div className="w-full max-w-md py-8">

          {/* Mobile logo */}
          {/* <div className="lg:hidden flex items-center gap-3 mb-6">
            <div className="w-9 h-9 bg-violet-600 rounded-xl flex items-center justify-center">
              <FaCalendarAlt className="text-white text-sm" />
            </div>
            <span className="font-bold text-xl text-gray-900">EventHub</span>
          </div> */}
          <div className="lg:hidden flex items-center gap-3 mb-6">
            <div className="w-16 h-16 bg-white/40 rounded-xl flex items-center justify-center backdrop-blur-sm shadow-lg">
              <img src={rovistaLogo} alt="Rovista" className="h-14 w-14" />
            </div>
            <div>
              <span className="font-bold text-xl text-gray-900">AtlasEvents</span>
            </div>
          </div>

          {/* Retour */}
          <button
            onClick={() => onNavigate?.("login")}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6 font-medium">
            <FaArrowLeft size={12} /> Retour à la connexion
          </button>

          <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/60 p-8 border border-gray-100">
            <div className="mb-7">
              <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-3">
                <FaUser size={10} /> Compte Client
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Créer mon compte</h1>
              <p className="text-gray-500 text-sm mt-1">
                Réservez des événements, accédez aux promos exclusives
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Nom + Username */}
              <div className="grid grid-cols-2 gap-4">
                <InputField
                  label="Votre nom "
                  name="nom"
                  value={form.nom}
                  onChange={handleChange}
                  placeholder="EL MASSY"
                  icon={<FaIdBadge />}
                  required
                  error={errors.nom}
                />
                <InputField
                  label="Votre prénom "
                  name="prenom"
                  value={form.prenom}
                  onChange={handleChange}
                  placeholder="Ouadiâ"
                  icon={<FaIdBadge />}
                  required
                  error={errors.prenom}
                />
              </div>

              {/* Email */}
              <InputField
                label="Email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="elmassy@example.com"
                icon={<FaEnvelope />}
                required
                error={errors.email}
              />

              {/* Téléphone + Ville */}
              <div className="grid grid-cols-2 gap-4">
                <InputField
                  label="Téléphone"
                  name="phone"
                  type="tel"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="06 61 00 00 01"
                  icon={<FaPhone />}
                />
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-gray-700">
                    Ville
                  </label>
                  <div className="relative">
                    <FaMapMarkerAlt className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none" />
                    <select
                      name="ville"
                      value={form.ville}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 bg-gray-50 rounded-xl text-sm outline-none focus:bg-white focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all appearance-none">
                      <option value="">— Ville —</option>
                      {villes.map(v => <option key={v}>{v}</option>)}
                    </select>
                  </div>
                </div>
              </div>
              
              {/* User name */}
              <div className="space-y-1.5">
                <InputField
                  label="Nom d'utilisateur"
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  placeholder="El_massy_Ouadia"
                  icon={<FaUser />}
                  required
                  error={errors.username}
                />
              </div>

              {/* Mot de passe */}
              <div className="space-y-1.5">
                <InputField
                  label="Mot de passe"
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Minimum 8 caractères"
                  icon={<FaLock />}
                  required
                  error={errors.password}
                />
                <PasswordStrength password={form.password} />
              </div>

              {/* Confirmer mot de passe */}
              <InputField
                label="Confirmer le mot de passe"
                name="confirmPassword"
                type="password"
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="Répétez le mot de passe"
                icon={<FaLock />}
                required
                error={errors.confirmPassword}
              />

              {/* CGU */}
              <label className="flex items-start gap-3 cursor-pointer group">
                <input type="checkbox" required
                  className="mt-0.5 w-4 h-4 rounded border-gray-300 accent-violet-600 cursor-pointer" />
                <span className="text-xs text-gray-500 leading-relaxed">
                  J'accepte les{" "}
                  <a href="#" className="text-violet-600 hover:underline font-medium">
                    Conditions d'utilisation
                  </a>{" "}
                  et la{" "}
                  <a href="#" className="text-violet-600 hover:underline font-medium">
                    Politique de confidentialité
                  </a>
                </span>
              </label>

              {apiError && (
                <div className="bg-rose-50 border border-rose-200 rounded-xl p-3.5 text-sm text-rose-700 font-medium">
                  ⚠️ {apiError}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white py-3.5 rounded-xl font-semibold transition flex items-center justify-center gap-2 text-sm mt-2">
                {loading
                  ? <><Spinner /> Création du compte…</>
                  : <>Créer mon compte <FaArrowRight size={12} /></>}
              </button>
            </form>

            <p className="text-center text-xs text-gray-500 mt-5">
              Déjà inscrit ?{" "}
              <button onClick={() => onNavigate?.("login")}
                className="text-violet-600 font-semibold hover:underline">
                Se connecter
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// PAGE : INSCRIPTION ORGANISATEUR (formulaire en 2 étapes)
// POST /api/auth/register/organisateur
// Body: { username, email, password, nom, phone, adresse,
//         organisationNom, siret }
// ← { token, role, nom }
// ═══════════════════════════════════════════════════════════════
const RegisterorganisateurPage = ({ onNavigate, onSuccess }) => {
  const [step, setStep]         = useState(1); // 1 = infos perso, 2 = infos org
  const [form, setForm]         = useState({
    // Étape 1
    nom: "", username: "", email: "",
    phone: "", adresse: "", prenom: "",
    password: "", confirmPassword: "",
    // Étape 2
    organisationNom: "", siret: "",
  });
  const [loading, setLoading]   = useState(false);
  const [errors, setErrors]     = useState({});
  const [apiError, setApiError] = useState("");
  const [done, setDone]         = useState(false);

  const handleChange = e =>
    setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const validateStep1 = () => {
    const errs = {};
    if (!form.nom.trim())          errs.nom      = "Requis";
    if (!form.prenom.trim())          errs.prenom      = "Requis";
    if (!form.username.trim())     errs.username = "Requis";
    if (!form.email.includes("@")) errs.email    = "Email invalide";
    if (form.password.length < 8)  errs.password = "8 caractères minimum";
    if (form.password !== form.confirmPassword)
      errs.confirmPassword = "Les mots de passe ne correspondent pas";
    return errs;
  };

  const validateStep2 = () => {
    const errs = {};
    if (!form.organisationNom.trim())
      errs.organisationNom = "Le nom de l'organisation est requis";
    return errs;
  };

  const handleNextStep = () => {
    const errs = validateStep1();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({}); setStep(2);
  };

    const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validateStep2();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({}); setApiError(""); setLoading(true);

    try {
        const { confirmPassword, ...body } = form;
        
        // Ton backend renvoie MessageResponse, pas AuthResponse
        const data = await apiFetch("/auth/register/organisateur", {
        method: "POST",
        body: JSON.stringify(body),
        });
        
        setDone(true);
        // Pas de localStorage.setItem("token") ici
        
        setTimeout(() => {
        // Redirige vers login avec message
        window.location.href = "/auth?msg=pending";
        }, 2500);

    } catch (e) { 
        // Gère 409 email/username déjà pris, 400 validation, etc
        setApiError(e.message || "Erreur lors de l'envoi de la demande");
    }
    finally { setLoading(false); }
    };

  if (done) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl shadow-xl p-10 text-center max-w-sm w-full">
        <div className="w-16 h-16 bg-violet-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <FaCheckCircle className="text-violet-500 text-3xl" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Demande envoyée !</h2>
        <p className="text-gray-500 text-sm leading-relaxed">
          Votre compte organisateur est en cours de vérification par notre équipe.
          Vous recevrez un email de confirmation sous 24h.
        </p>
        <div className="mt-4 flex justify-center">
          <div className="w-6 h-6 border-2 border-violet-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <SidePanel mode="register-organisateur" />

      <div className="flex-1 flex items-center justify-center p-6 overflow-y-auto">
        <div className="w-full max-w-md py-8">

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-6">
            <div className="w-16 h-16 bg-white/40 rounded-xl flex items-center justify-center backdrop-blur-sm shadow-lg">
              <img src={rovistaLogo} alt="Rovista" className="h-14 w-14" />
            </div>
            <div>
              <span className="font-bold text-xl text-gray-900">AtlasEvents</span>
            </div>
          </div>

          {/* Retour */}
          <button
            onClick={() => step === 1 ? onNavigate?.("login") : setStep(1)}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6 font-medium">
            <FaArrowLeft size={12} />
            {step === 1 ? "Retour à la connexion" : "Étape précédente"}
          </button>

          <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/60 p-8 border border-gray-100">
            {/* Header */}
            <div className="mb-6">
              <div className="inline-flex items-center gap-2 bg-violet-50 text-violet-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-3">
                <FaBuilding size={10} /> Compte Organisateur
              </div>
              <h1 className="text-2xl font-bold text-gray-900">
                {step === 1 ? "Informations personnelles" : "Informations organisation"}
              </h1>
              <p className="text-gray-500 text-sm mt-1">
                {step === 1
                  ? "Créez votre compte professionnel"
                  : "Décrivez votre organisation"}
              </p>
            </div>

            {/* Stepper */}
            <div className="flex items-center gap-3 mb-7">
              {[1, 2].map((s, i) => (
                <div key={s} className="flex items-center gap-3 flex-1">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all flex-shrink-0 ${
                    step > s
                      ? "bg-emerald-500 text-white"
                      : step === s
                        ? "bg-violet-600 text-white ring-4 ring-violet-100"
                        : "bg-gray-100 text-gray-400"
                  }`}>
                    {step > s ? <FaCheckCircle size={14} /> : s}
                  </div>
                  <div className="min-w-0">
                    <p className={`text-xs font-semibold truncate ${
                      step >= s ? "text-gray-800" : "text-gray-400"
                    }`}>
                      {s === 1 ? "Compte" : "Organisation"}
                    </p>
                  </div>
                  {i < 1 && (
                    <div className={`flex-1 h-0.5 rounded-full transition-all ${
                      step > s ? "bg-emerald-400" : "bg-gray-200"
                    }`} />
                  )}
                </div>
              ))}
            </div>

            {/* ── ÉTAPE 1 ── */}
            {step === 1 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <InputField
                    label="Nom de responsable"
                    name="nom"
                    value={form.nom}
                    onChange={handleChange}
                    placeholder="EL MASSY"
                    icon={<FaIdBadge />}
                    required
                    error={errors.nom}
                  />
                  
                  <InputField
                    label="Prénom de responsable"
                    name="prenom"
                    value={form.prenom}
                    onChange={handleChange}
                    placeholder="Ouadiâ"
                    required
                    icon={<FaIdBadge />}
                    error={errors.prenom}
                  />
                </div>

                <InputField
                  label="Email professionnel"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="amine@organisation.ma"
                  icon={<FaEnvelope />}
                  required
                  error={errors.email}
                />

                <div className="grid grid-cols-2 gap-4">
                  <InputField
                    label="Téléphone"
                    name="phone"
                    type="tel"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="06 61 00 00 02"
                    icon={<FaPhone />}
                  />
                  <InputField
                    label="Adresse"
                    name="adresse"
                    value={form.adresse}
                    onChange={handleChange}
                    placeholder="Casablanca"
                    icon={<FaMapMarkerAlt />}
                  />
                </div>
                {/* User name */}
                <div className="space-y-1.5">
                  <InputField
                    label="Nom d'utilisateur"
                    name="username"
                    value={form.username}
                    onChange={handleChange}
                    placeholder="El_massy_Ouadia"
                    icon={<FaUser />}
                    required
                    error={errors.username}
                  />
                </div>

                <div className="space-y-1.5">
                  <InputField
                    label="Mot de passe"
                    name="password"
                    type="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Minimum 8 caractères"
                    icon={<FaLock />}
                    required
                    error={errors.password}
                  />
                  <PasswordStrength password={form.password} />
                </div>

                <InputField
                  label="Confirmer le mot de passe"
                  name="confirmPassword"
                  type="password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder="Répétez le mot de passe"
                  icon={<FaLock />}
                  required
                  error={errors.confirmPassword}
                />

                <button
                  type="button"
                  onClick={handleNextStep}
                  className="w-full bg-violet-600 hover:bg-violet-700 text-white py-3.5 rounded-xl font-semibold transition flex items-center justify-center gap-2 text-sm mt-2">
                  Étape suivante <FaArrowRight size={12} />
                </button>
              </div>
            )}

            {/* ── ÉTAPE 2 ── */}
            {step === 2 && (
              <form onSubmit={handleSubmit} className="space-y-4">
                <InputField
                  label="Nom de l'organisation"
                  name="organisationNom"
                  value={form.organisationNom}
                  onChange={handleChange}
                  placeholder="Amine Event Pro"
                  icon={<FaBuilding />}
                  required
                  error={errors.organisationNom}
                  hint="Nom qui apparaîtra sur vos événements"
                />

                <InputField
                  label="SIRET / Registre du commerce"
                  name="siret"
                  value={form.siret}
                  onChange={handleChange}
                  placeholder="MA-123456789"
                  icon={<FaIdCard />}
                  hint="Optionnel — renforce votre crédibilité"
                />

                {/* Info vérification */}
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-1.5">
                  <p className="text-sm font-semibold text-amber-800 flex items-center gap-2">
                    <span>⏳</span> Vérification requise
                  </p>
                  <p className="text-xs text-amber-700 leading-relaxed">
                    Votre compte sera examiné par notre équipe sous 24h.
                    Vous recevrez un email de confirmation une fois validé.
                  </p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 pt-1">
                    {["Créer vos événements", "Gérer les réservations", "Accéder aux statistiques"].map(f => (
                      <span key={f} className="text-xs text-amber-700 flex items-center gap-1.5">
                        <FaCheckCircle size={9} className="text-amber-500" /> {f}
                      </span>
                    ))}
                  </div>
                </div>

                {/* CGU */}
                <label className="flex items-start gap-3 cursor-pointer">
                  <input type="checkbox" required
                    className="mt-0.5 w-4 h-4 rounded border-gray-300 accent-violet-600 cursor-pointer" />
                  <span className="text-xs text-gray-500 leading-relaxed">
                    J'accepte les{" "}
                    <a href="#" className="text-violet-600 hover:underline font-medium">
                      Conditions d'utilisation
                    </a>{" "}
                    et la{" "}
                    <a href="#" className="text-violet-600 hover:underline font-medium">
                      Politique de confidentialité
                    </a>
                  </span>
                </label>

                {apiError && (
                  <div className="bg-rose-50 border border-rose-200 rounded-xl p-3.5 text-sm text-rose-700 font-medium">
                    ⚠️ {apiError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white py-3.5 rounded-xl font-semibold transition flex items-center justify-center gap-2 text-sm">
                  {loading
                    ? <><Spinner /> Envoi en cours…</>
                    : <>Soumettre ma demande <FaArrowRight size={12} /></>}
                </button>
              </form>
            )}

            <p className="text-center text-xs text-gray-500 mt-5">
              Déjà inscrit ?{" "}
              <button onClick={() => onNavigate?.("login")}
                className="text-violet-600 font-semibold hover:underline">
                Se connecter
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// PAGE : MOT DE PASSE OUBLIÉ
// POST /api/auth/forgot-password → { email }
// ← { message: "..." }
// ═══════════════════════════════════════════════════════════════
const ForgotPasswordPage = ({ onNavigate }) => {
  const [email,   setEmail]   = useState("");
  const [loading, setLoading] = useState(false);
  const [sent,    setSent]    = useState(false);
  const [error,   setError]   = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      await apiFetch("/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
      setSent(true);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md">

        {/* Logo */}
        {/* <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-10 h-10 bg-violet-600 rounded-xl flex items-center justify-center">
            <FaCalendarAlt className="text-white" />
          </div>
          <span className="font-bold text-xl text-gray-900">EventHub</span>
        </div> */}
        <div className="lg:hidden flex items-center gap-3 mb-6">
            <div className="w-16 h-16 bg-white/40 rounded-xl flex items-center justify-center backdrop-blur-sm shadow-lg">
              <img src={rovistaLogo} alt="AtlasEvents" className="h-14 w-14" />
            </div>
            <div>
              <span className="font-bold text-xl text-gray-900">AtlasEvents</span>
            </div>
          </div>

        <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/60 p-8 border border-gray-100">
          {!sent ? (
            <>
              <div className="mb-7">
                <div className="w-14 h-14 bg-violet-50 rounded-2xl flex items-center justify-center mb-4">
                  <FaLock className="text-violet-500 text-xl" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Mot de passe oublié ?
                </h1>
                <p className="text-gray-500 text-sm mt-2 leading-relaxed">
                  Saisissez votre email et nous vous enverrons un lien
                  pour réinitialiser votre mot de passe.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <InputField
                  label="Email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="votre@email.com"
                  icon={<FaEnvelope />}
                  required
                />

                {error && (
                  <div className="bg-rose-50 border border-rose-200 rounded-xl p-3.5 text-sm text-rose-700 font-medium">
                    ⚠️ {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white py-3.5 rounded-xl font-semibold transition flex items-center justify-center gap-2 text-sm">
                  {loading
                    ? <><Spinner /> Envoi…</>
                    : <>Envoyer le lien <FaArrowRight size={12} /></>}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-5">
                <FaCheckCircle className="text-emerald-500 text-3xl" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-3">Email envoyé !</h2>
              <p className="text-gray-500 text-sm leading-relaxed mb-1">
                Si un compte existe avec <strong>{email}</strong>,
                vous recevrez un lien de réinitialisation.
              </p>
              <p className="text-gray-400 text-xs">
                Vérifiez également vos spams. Lien valable 30 minutes.
              </p>
            </div>
          )}

          <button
            onClick={() => onNavigate?.("login")}
            className="w-full mt-5 flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-gray-700 font-medium">
            <FaArrowLeft size={11} /> Retour à la connexion
          </button>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// ROUTER INTERNE — point d'entrée unique
// Utilisez onNavigate pour intégrer avec React Router si besoin
// ═══════════════════════════════════════════════════════════════
export default function AuthPages() {
  
  //const [currentPage, setCurrentPage] = useState("login");
  // remplacé par :
  const { login } = useAuth(); // ← ajouter
  const location = useLocation(); // déjà importé
  
  // Lire le param ?page= au montage
  const getInitialPage = () => {
    const params = new URLSearchParams(location.search);
    const page = params.get("page");
    const valid = ["login", "register-client", "register-organisateur", "forgot-password"];
    return valid.includes(page) ? page : "login";
  };  
  const [currentPage, setCurrentPage] = useState(getInitialPage);

  const handleSuccess = (jwt) => {
    login(jwt); // ← stocke token + décode user dans le contexte
    const decoded = jwtDecode(jwt); // jwt-decode est déjà installé
    const firstRole = decoded.roles?.[0] || decoded.role;  
    
    // const firstRole = Array.isArray(roles)
    // ? roles[0]
    // : roles;

  const routes = {
    ADMIN: "/admin/dashboard",
    ORGANISATEUR: "/organisateur/dashboard",
    CLIENT: "/client/dashboard",
  };

  window.location.href = routes[firstRole] || "/";
  };


  const pages = {
    "login":               <LoginPage
                             onNavigate={setCurrentPage}
                             onSuccess={handleSuccess} />,
    "register-client":     <RegisterClientPage
                             onNavigate={setCurrentPage}
                             onSuccess={handleSuccess} />,
    "register-organisateur":  <RegisterorganisateurPage
                             onNavigate={setCurrentPage}
                             onSuccess={handleSuccess} />,
    "forgot-password":     <ForgotPasswordPage
                             onNavigate={setCurrentPage} />,
  };

  return pages[currentPage] || pages["login"];
}

// ── Export des pages individuelles (pour React Router) ────────
export {
  LoginPage,
  RegisterClientPage,
  RegisterorganisateurPage,
  ForgotPasswordPage,
};