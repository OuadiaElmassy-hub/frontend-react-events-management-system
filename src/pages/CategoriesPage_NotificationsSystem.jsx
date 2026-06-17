// ═══════════════════════════════════════════════════════════════
// PATCH 1 — PAGE CATÉGORIES (CRUD + upload icône/image)
// Remplace le PlaceholderPage "Catégories" dans AdminDashboard
//
// Endpoints Spring Boot attendus :
//   GET    /admin/categories?search=&page=&size=10
//     → Page<{ id, nom, description, iconUrl, couleur, totalEvents, active }>
//   POST   /admin/categories          (multipart/form-data : nom, description, couleur, icone)
//   PUT    /admin/categories/{id}     (multipart/form-data)
//   DELETE /admin/categories/{id}
//   PATCH  /admin/categories/{id}/toggle   → activer/désactiver
//
// PATCH 2 — NOTIFICATIONS TEMPS RÉEL
// Remplace le useApi polling statique par un hook useNotifications
// qui poll toutes les 30 secondes ET joue un son/badge si count monte.
//
// INTÉGRATION :
//   1. Copiez CategoriesPage dans votre AdminDashboard.jsx
//   2. Remplacez la case "categories" dans renderPage() :
//        case "categories": return <CategoriesPage />;
//   3. Remplacez les deux useApi de badges en haut du composant
//      AdminDashboard par useNotifications (voir section PATCH 2).
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useCallback, useRef } from "react";
import {
  FaPlus, FaEdit, FaTrash, FaSearch, FaToggleOn, FaToggleOff,
  FaSave, FaTimes, FaSpinner, FaExclamationTriangle, FaSync,
  FaImage, FaPalette, FaTag, FaCheck, FaBell, FaCalendarAlt,
  FaUserShield
} from "react-icons/fa";
import apiFetch, { BASE_URL } from "../utils/fetchFn"; // ajustez le chemin

// ─────────────────────────────────────────────────────────────────
// HELPERS UI partagés (identiques à l'Admin Dashboard existant)
// ─────────────────────────────────────────────────────────────────
const Spinner = ({ size = "sm" }) => (
  <FaSpinner
    className={`animate-spin text-violet-500 ${size === "lg" ? "text-3xl" : "text-base"}`}
  />
);

const ErrorBanner = ({ message, onRetry }) => (
  <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center justify-between gap-3">
    <div className="flex items-center gap-2 text-red-700 text-sm font-medium">
      <FaExclamationTriangle />
      <span>{message}</span>
    </div>
    {onRetry && (
      <button
        onClick={onRetry}
        className="text-xs text-red-600 underline hover:no-underline"
      >
        Réessayer
      </button>
    )}
  </div>
);

const SkeletonRow = ({ cols = 5 }) => (
  <tr className="border-b border-gray-50">
    {[...Array(cols)].map((_, j) => (
      <td key={j} className="px-5 py-4">
        <div
          className="h-3.5 bg-gray-100 rounded-full animate-pulse"
          style={{ width: `${50 + Math.random() * 40}%` }}
        />
      </td>
    ))}
  </tr>
);

// ─────────────────────────────────────────────────────────────────
// HOOK useApi (identique à l'existant — supprimez si déjà importé)
// ─────────────────────────────────────────────────────────────────
const useApi = (fetchFn, deps = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const abortRef = useRef(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    abortRef.current?.abort();
    abortRef.current = new AbortController();
    try {
      const result = await fetchFn();
      setData(result);
    } catch (e) {
      if (e.name !== "AbortError") setError(e.message);
    } finally {
      setLoading(false);
    }
  }, deps); // eslint-disable-line

  useEffect(() => {
    load();
    return () => abortRef.current?.abort();
  }, [load]);

  return { data, loading, error, refetch: load, setData };
};

// ─────────────────────────────────────────────────────────────────
// UPLOAD HELPER — multipart/form-data pour les catégories
// ─────────────────────────────────────────────────────────────────
const apiFetchMultipart = async (path, method, formData) => {
  const token = localStorage.getItem("token");
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
      // NE PAS mettre Content-Type : le browser le définit automatiquement (boundary)
    },
    body: formData,
  });
  if (res.status === 401) {
    localStorage.removeItem("token");
    window.location.href = "/auth";
    throw new Error("Session expirée");
  }
  if (res.status === 204) return null;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`);
  return data;
};

// ─────────────────────────────────────────────────────────────────
// COULEURS PRÉDÉFINIES POUR LES CATÉGORIES
// ─────────────────────────────────────────────────────────────────
const PRESET_COLORS = [
  "#6366f1", "#8b5cf6", "#ec4899", "#f43f5e", "#f97316",
  "#eab308", "#22c55e", "#14b8a6", "#0ea5e9", "#64748b",
];

// ─────────────────────────────────────────────────────────────────
// COMPOSANT : APERÇU ICÔNE
// ─────────────────────────────────────────────────────────────────
const CategoryIcon = ({ iconUrl, couleur, nom, size = "md" }) => {
  
  const URL_ICONS = 'http://localhost:8080';
  console.log(iconUrl)
  const dim = size === "sm" ? "w-8 h-8 text-sm" : "w-12 h-12 text-xl";
  if (iconUrl) {
    return (
      <img
        src={`${URL_ICONS}${iconUrl}`}
        alt={nom}
        className={`${dim} rounded-xl object-contain flex-shrink-0`}
        onError={e => { e.target.style.display = "none"; }}
      />
    );
  }
  return (
    <div
      className={`${dim} rounded-xl flex items-center justify-center flex-shrink-0 text-white font-bold`}
      style={{ backgroundColor: couleur || "#6366f1" }}
    >
      {nom?.charAt(0)?.toUpperCase() || "?"}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────
// FORMULAIRE CATÉGORIE (création + édition)
// ─────────────────────────────────────────────────────────────────
const EMPTY_CAT = { nom: "", description: "", couleur: "#6366f1" };

const CategoryForm = ({ initial, onSave, onCancel, saving, error }) => {
  const [form, setForm] = useState(initial || EMPTY_CAT);
  const [iconFile, setIconFile] = useState(null);
  const [iconPreview, setIconPreview] = useState(initial?.iconUrl || null);
  const fileRef = useRef(null);

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("Veuillez sélectionner une image (PNG, JPG, SVG, WebP)");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      alert("L'image ne doit pas dépasser 2 Mo");
      return;
    }
    setIconFile(file);
    setIconPreview(URL.createObjectURL(file));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append("nom", form.nom);
    fd.append("description", form.description || "");
    fd.append("couleur", form.couleur);
    if (iconFile) fd.append("icone", iconFile);
    onSave(fd);
  };

  return (
    <div className="bg-white rounded-2xl border border-violet-100 shadow-sm p-6">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-bold text-gray-900 flex items-center gap-2">
          <FaTag className="text-violet-500" />
          {initial?.id ? "Modifier la catégorie" : "Nouvelle catégorie"}
        </h3>
        <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
          <FaTimes />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Aperçu + Upload icône */}
        <div className="flex items-center gap-5">
          <div className="relative">
            {iconPreview ? (
              <img
                src={iconPreview}
                alt="aperçu"
                className="w-20 h-20 rounded-2xl object-cover border-2 border-violet-100"
              />
            ) : (
              <div
                className="w-20 h-20 rounded-2xl flex items-center justify-center text-white text-3xl font-bold border-2 border-violet-100"
                style={{ backgroundColor: form.couleur }}
              >
                {form.nom?.charAt(0)?.toUpperCase() || <FaImage />}
              </div>
            )}
            {/* Bouton overlay pour changer l'image */}
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="absolute -bottom-2 -right-2 w-7 h-7 bg-violet-600 text-white rounded-full flex items-center justify-center shadow-md hover:bg-violet-700 transition"
              title="Changer l'icône"
            >
              <FaImage size={11} />
            </button>
          </div>

          <div className="flex-1 space-y-1">
            <p className="text-sm font-semibold text-gray-700">Icône / Image</p>
            <p className="text-xs text-gray-400">PNG, JPG, SVG, WebP — max 2 Mo</p>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="mt-1 px-3 py-1.5 border border-gray-200 rounded-xl text-xs font-medium text-gray-600 hover:bg-gray-50 transition flex items-center gap-1.5"
            >
              <FaImage size={10} /> Choisir un fichier
            </button>
            {iconFile && (
              <p className="text-xs text-violet-600 font-medium">✓ {iconFile.name}</p>
            )}
          </div>

          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={handleFile}
            className="hidden"
          />
        </div>

        {/* Nom */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            Nom <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={form.nom}
            onChange={e => setForm(p => ({ ...p, nom: e.target.value }))}
            placeholder="ex: Concert, Festival, Sport…"
            required
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-violet-500 text-sm"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            Description
          </label>
          <textarea
            value={form.description}
            onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
            placeholder="Décrivez cette catégorie…"
            rows={2}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-violet-500 text-sm resize-none"
          />
        </div>

        {/* Couleur */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            <FaPalette className="inline mr-1.5 text-violet-400" />
            Couleur d'accentuation
          </label>
          <div className="flex items-center gap-3 flex-wrap">
            {PRESET_COLORS.map(c => (
              <button
                key={c}
                type="button"
                onClick={() => setForm(p => ({ ...p, couleur: c }))}
                className={`w-8 h-8 rounded-full transition-transform hover:scale-110 ${
                  form.couleur === c ? "ring-2 ring-offset-2 ring-violet-600 scale-110" : ""
                }`}
                style={{ backgroundColor: c }}
                title={c}
              />
            ))}
            {/* Couleur personnalisée */}
            <label
              className="w-8 h-8 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-violet-400 transition overflow-hidden"
              title="Couleur personnalisée"
            >
              <input
                type="color"
                value={form.couleur}
                onChange={e => setForm(p => ({ ...p, couleur: e.target.value }))}
                className="opacity-0 absolute w-8 h-8 cursor-pointer"
              />
              <span className="text-gray-400 text-xs">+</span>
            </label>
            <span
              className="text-xs font-mono text-gray-500 ml-1"
              style={{ color: form.couleur }}
            >
              {form.couleur}
            </span>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700 font-medium">
            {error}
          </div>
        )}

        <div className="flex gap-3 pt-1">
          <button
            type="submit"
            disabled={saving}
            className="bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white px-6 py-2.5 rounded-xl font-semibold transition text-sm flex items-center gap-2"
          >
            {saving ? <Spinner /> : <FaSave />}
            {initial?.id ? "Mettre à jour" : "Créer la catégorie"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="border border-gray-200 px-6 py-2.5 rounded-xl font-semibold text-gray-600 hover:bg-gray-50 transition text-sm"
          >
            Annuler
          </button>
        </div>
      </form>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────
// PAGE PRINCIPALE : CATÉGORIES
// ─────────────────────────────────────────────────────────────────
export const CategoriesPage = () => {
  const [pg, setPg]             = useState(0);
  const [search, setSearch]     = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing]   = useState(null); // objet catégorie ou null
  const [saving, setSaving]     = useState(false);
  const [formError, setFErr]    = useState("");
  const [toggling, setToggling] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [successMsg, setSuccess] = useState("");
  const timer = useRef(null);

  const buildQ = () => {
    const p = new URLSearchParams({ page: pg, size: 10, sort: "nom,asc" });
    if (search) p.set("search", search);
    return p.toString();
  };

  const { data, loading, error, refetch } = useApi(
    () => apiFetch(`/admin/categories?${buildQ()}`),
    [pg, search]
  );

  const categories = data?.content || [];
  const totalPages = data?.totalPages || 0;
  const totalEl    = data?.totalElements || 0;

  // ── Créer / Modifier ─────────────────────────────────────────
  const handleSave = async (formData) => {
    setSaving(true);
    setFErr("");
    setSuccess("");
    try {
      if (editing?.id) {
        await apiFetchMultipart(`/admin/categories/${editing.id}`, "PUT", formData);
        setSuccess("Catégorie mise à jour ✓");
      } else {
        await apiFetchMultipart("/admin/categories", "POST", formData);
        setSuccess("Catégorie créée avec succès ✓");
      }
      setShowForm(false);
      setEditing(null);
      refetch();
    } catch (e) {
      setFErr(e.message);
    } finally {
      setSaving(false);
    }
  };

  // ── Toggle actif/inactif ──────────────────────────────────────
  const handleToggle = async (cat) => {
    setToggling(cat.id);
    try {
      await apiFetch(`/admin/categories/${cat.id}/toggle`, { method: "PATCH" });
      refetch();
    } catch (e) {
      alert(e.message);
    } finally {
      setToggling(null);
    }
  };

  // ── Supprimer ─────────────────────────────────────────────────
  const handleDelete = async (cat) => {
    if (!window.confirm(`Supprimer la catégorie "${cat.nom}" ? Cette action est irréversible.`))
      return;
    setDeleting(cat.id);
    try {
      await apiFetch(`/admin/categories/${cat.id}`, { method: "DELETE" });
      setSuccess("Catégorie supprimée ✓");
      refetch();
    } catch (e) {
      alert(e.message);
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Catégories</h2>
          <p className="text-gray-500 text-sm">
            {loading
              ? "Chargement…"
              : `${totalEl} catégorie${totalEl !== 1 ? "s" : ""}`}
          </p>
        </div>
        <button
          onClick={() => {
            setShowForm(true);
            setEditing(null);
            setFErr("");
            setSuccess("");
          }}
          className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-4 py-2.5 rounded-xl font-semibold transition text-sm"
        >
          <FaPlus /> Nouvelle catégorie
        </button>
      </div>

      {/* Barre de recherche */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex gap-3">
        <div className="relative flex-1">
          <FaSearch className="absolute left-3.5 top-3.5 text-gray-400 text-xs" />
          <input
            type="text"
            placeholder="Rechercher une catégorie…"
            onChange={e => {
              clearTimeout(timer.current);
              timer.current = setTimeout(() => {
                setSearch(e.target.value);
                setPg(0);
              }, 400);
            }}
            className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-violet-500"
          />
        </div>
        <button
          onClick={refetch}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-violet-600 border border-gray-200 px-3 py-2 rounded-xl hover:bg-violet-50 transition"
        >
          <FaSync className={loading ? "animate-spin" : ""} size={12} />
          Actualiser
        </button>
      </div>

      {error && <ErrorBanner message={error} onRetry={refetch} />}

      {successMsg && !showForm && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 text-sm text-emerald-700 font-medium">
          ✓ {successMsg}
        </div>
      )}

      {/* Formulaire */}
      {showForm && (
        <CategoryForm
          initial={editing}
          onSave={handleSave}
          onCancel={() => { setShowForm(false); setEditing(null); }}
          saving={saving}
          error={formError}
        />
      )}

      {/* Grille des catégories */}
      {!loading && categories.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map(cat => (
            <div
              key={cat.id}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-5"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <CategoryIcon iconUrl={cat.iconUrl} couleur={cat.couleur} nom={cat.nom} />
                  <div>
                    <h3 className="font-bold text-gray-900">{cat.nom}</h3>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {cat.totalEvents ?? 0} événement{(cat.totalEvents ?? 0) !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
                <span
                  className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                    cat.active !== false
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {cat.active !== false ? "Active" : "Inactive"}
                </span>
              </div>

              {cat.description && (
                <p className="text-sm text-gray-500 mb-4 line-clamp-2">{cat.description}</p>
              )}

              {/* Barre de couleur */}
              <div
                className="h-1 rounded-full mb-4 opacity-40"
                style={{ backgroundColor: cat.couleur || "#6366f1" }}
              />

              {/* Actions */}
              <div className="flex items-center gap-2">
                {/* Toggle actif */}
                <button
                  onClick={() => handleToggle(cat)}
                  disabled={toggling === cat.id}
                  title={cat.active !== false ? "Désactiver" : "Activer"}
                  className={`p-2 rounded-xl transition disabled:opacity-40 ${
                    cat.active !== false
                      ? "text-emerald-600 bg-emerald-50 hover:bg-emerald-100"
                      : "text-gray-400 bg-gray-100 hover:bg-gray-200"
                  }`}
                >
                  {toggling === cat.id
                    ? <Spinner />
                    : cat.active !== false
                      ? <FaToggleOn size={14} />
                      : <FaToggleOff size={14} />}
                </button>

                {/* Modifier */}
                <button
                  onClick={() => {
                    setEditing(cat);
                    setShowForm(true);
                    setFErr("");
                    setSuccess("");
                  }}
                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition flex-1"
                >
                  <FaEdit size={13} />
                </button>

                {/* Supprimer */}
                <button
                  onClick={() => handleDelete(cat)}
                  disabled={deleting === cat.id}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition disabled:opacity-40"
                >
                  {deleting === cat.id ? <Spinner /> : <FaTrash size={13} />}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tableau fallback pour beaucoup de catégories */}
      {loading && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-auto">
          <table className="w-full text-sm min-w-[600px]">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {["Catégorie", "Description", "Événements", "Statut", "Actions"].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...Array(5)].map((_, i) => <SkeletonRow key={i} cols={5} />)}
            </tbody>
          </table>
        </div>
      )}

      {!loading && categories.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <div className="w-16 h-16 bg-violet-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FaTag className="text-violet-300 text-2xl" />
          </div>
          <p className="text-gray-400 font-medium mb-2">Aucune catégorie trouvée</p>
          <button
            onClick={() => { setShowForm(true); setEditing(null); }}
            className="text-violet-600 hover:underline text-sm font-medium"
          >
            Créer la première catégorie →
          </button>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>Page {pg + 1} / {totalPages}</span>
          <div className="flex gap-2">
            <button
              disabled={pg === 0}
              onClick={() => setPg(p => p - 1)}
              className="px-3 py-1.5 border border-gray-200 rounded-xl disabled:opacity-40 hover:bg-gray-50 transition"
            >
              ← Précédent
            </button>
            <button
              disabled={pg >= totalPages - 1}
              onClick={() => setPg(p => p + 1)}
              className="px-3 py-1.5 border border-gray-200 rounded-xl disabled:opacity-40 hover:bg-gray-50 transition"
            >
              Suivant →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// PATCH 2 — HOOK useNotifications (remplace les deux useApi de
//           badges statiques dans AdminDashboard)
//
// UTILISATION dans AdminDashboard :
//
//   import { useNotifications } from "./CategoriesPage_NotificationsSystem";
//   // Supprimez ces deux lignes :
//   //   const { data: pending } = useApi(() => apiFetch("/admin/events/pending-count"));
//   //   const { data: unreadNotifs } = useApi(() => apiFetch("/admin/notifications/unread-count"));
//   // Remplacez par :
//   const {
//     pendingCount,
//     unreadCount,
//     newAlerts,
//     clearAlerts,
//   } = useNotifications();
//
// Branchez ensuite newAlerts sur le panneau de toast ci-dessous.
// ═══════════════════════════════════════════════════════════════

const POLL_INTERVAL_MS = 30_000; // 30 secondes

export const useNotifications = () => {
  const [pendingCount,   setPending]   = useState(0);
  const [unreadCount,    setUnread]    = useState(0);
  const [newAlerts,      setAlerts]    = useState([]); // toasts à afficher
  const prevPending = useRef(0);
  const prevUnread  = useRef(0);
  const timerRef    = useRef(null);

  const poll = useCallback(async () => {
    try {
      const [evRes, notifRes] = await Promise.all([
        apiFetch("/admin/events/pending-count").catch(() => ({ count: prevPending.current })),
        apiFetch("/admin/notifications/nonlu-count").catch(() => ({ count: prevUnread.current })),
      ]);

      const newPending = evRes?.count ?? 0;
      const newUnread  = notifRes?.count ?? 0;

      // ── Détecter augmentation : génère une alerte toast ─────
      const alerts = [];

      if (newPending > prevPending.current) {
        const diff = newPending - prevPending.current;
        alerts.push({
          id:      Date.now(),
          type:    "event",
          message: `${diff} nouvel${diff > 1 ? "s" : ""} événement${diff > 1 ? "s" : ""} en attente de validation`,
          icon:    "event",
        });
      }

      if (newUnread > prevUnread.current) {
        const diff = newUnread - prevUnread.current;
        alerts.push({
          id:      Date.now() + 1,
          type:    "notif",
          message: `${diff} nouvelle${diff > 1 ? "s" : ""} notification${diff > 1 ? "s" : ""}`,
          icon:    "bell",
        });
      }

      if (alerts.length > 0) {
        setAlerts(prev => [...prev, ...alerts]);
        // Son discret navigateur (optionnel)
        try {
          const ctx = new (window.AudioContext || window.webkitAudioContext)();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.frequency.value = 880;
          gain.gain.setValueAtTime(0.1, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
          osc.start(ctx.currentTime);
          osc.stop(ctx.currentTime + 0.3);
        } catch {
          // AudioContext peut être bloqué par le browser
        }
      }

      prevPending.current = newPending;
      prevUnread.current  = newUnread;
      setPending(newPending);
      setUnread(newUnread);
    } catch {
      // Silencieux — pas d'interruption du polling
    }
  }, []);

  useEffect(() => {
    poll(); // Premier appel immédiat
    timerRef.current = setInterval(poll, POLL_INTERVAL_MS);
    return () => clearInterval(timerRef.current);
  }, [poll]);

  const clearAlerts = (id) =>
    setAlerts(prev => id ? prev.filter(a => a.id !== id) : []);

  return { pendingCount, unreadCount, newAlerts, clearAlerts };
};

// ═══════════════════════════════════════════════════════════════
// COMPOSANT : TOAST DE NOTIFICATION EN TEMPS RÉEL
//
// Placez <NotificationToasts> dans le JSX de AdminDashboard,
// juste avant </div> final :
//
//   <NotificationToasts
//     alerts={newAlerts}
//     onDismiss={clearAlerts}
//     onNavigate={setPage}
//   />
// ═══════════════════════════════════════════════════════════════
export const NotificationToasts = ({ alerts = [], onDismiss, onNavigate }) => {
  // Auto-dismiss après 6 secondes
  useEffect(() => {
    if (alerts.length === 0) return;
    const latest = alerts[alerts.length - 1];
    const t = setTimeout(() => onDismiss?.(latest.id), 6000);
    return () => clearTimeout(t);
  }, [alerts]);

  if (alerts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 max-w-sm">
      {alerts.map(alert => (
        <div
          key={alert.id}
          className="bg-white border border-gray-100 rounded-2xl shadow-xl p-4 flex items-start gap-3 animate-slide-up"
          style={{
            animation: "slideUp 0.3s ease-out",
          }}
        >
          <div className={`p-2.5 rounded-xl flex-shrink-0 ${
            alert.type === "event"
              ? "bg-amber-100 text-amber-600"
              : "bg-violet-100 text-violet-600"
          }`}>
            {alert.type === "event"
              ? <FaCalendarAlt size={14} />
              : <FaBell size={14} />}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900">
              {alert.type === "event" ? "Validation requise" : "Nouvelles notifications"}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">{alert.message}</p>
            {alert.type === "event" && onNavigate && (
              <button
                onClick={() => { onNavigate("events-validation"); onDismiss?.(alert.id); }}
                className="text-xs text-violet-600 font-semibold hover:underline mt-1.5 block"
              >
                Voir les événements →
              </button>
            )}
          </div>
          <button
            onClick={() => onDismiss?.(alert.id)}
            className="text-gray-300 hover:text-gray-500 flex-shrink-0 mt-0.5"
          >
            <FaTimes size={12} />
          </button>
        </div>
      ))}

      {/* Style keyframe (injecté en ligne pour ne pas dépendre d'un CSS externe) */}
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// RÉCAPITULATIF DES MODIFICATIONS DANS AdminDashboard.jsx
// ═══════════════════════════════════════════════════════════════
/*

1. IMPORTS à ajouter :
   import { CategoriesPage, NotificationToasts, useNotifications }
     from "./CategoriesPage_NotificationsSystem";

2. Dans le composant AdminDashboard, REMPLACER :
   const { data: pending }      = useApi(() => apiFetch("/admin/events/pending-count"));
   const pendingCount           = pending?.count || 0;
   const { data: unreadNotifs } = useApi(() => apiFetch("/admin/notifications/unread-count"));
   const unreadCount            = unreadNotifs?.count || 0;

   PAR :
   const { pendingCount, unreadCount, newAlerts, clearAlerts } = useNotifications();

3. Dans renderPage(), REMPLACER :
   default: return <PlaceholderPage title={...} />;
   (ou la case "categories" si elle existe)
   PAR :
   case "categories": return <CategoriesPage />;

4. Juste avant le </div> fermant du composant AdminDashboard, AJOUTER :
   <NotificationToasts
     alerts={newAlerts}
     onDismiss={clearAlerts}
     onNavigate={setPage}
   />

5. Endpoint Spring Boot pour l'upload multipart :
   @PostMapping(value = "/admin/categories", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
   public ResponseEntity<CategorieDTO> create(
     @RequestParam String nom,
     @RequestParam(required = false) String description,
     @RequestParam(required = false) String couleur,
     @RequestParam(required = false) MultipartFile icone
   ) { ... }

   @PutMapping(value = "/admin/categories/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
   public ResponseEntity<CategorieDTO> update(@PathVariable Long id, ...) { ... }

   // Stockez l'image dans /uploads ou S3, renvoyez iconUrl dans CategorieDTO.
*/