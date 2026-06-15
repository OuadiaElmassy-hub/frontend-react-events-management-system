/**
 * Architecture API
  Un useApi hook custom gère fetch, loading, error et abort automatiquement. 
  Tous les appels passent par apiFetch qui injecte le JWT depuis localStorage. 
  L'URL de base est configurable via VITE_API_URL (variable d'environnement).
  
  Endpoints attendus côté Spring Boot
  PageEndpointMéthodeDashboard
  GET /admin/statistics
  —Events
  GET /admin/events?search=&status=&categorie=&ville=&page=&size=
  —Events
  PATCH /admin/events/{id}/status{ status, motif }
  Utilisateurs
  GET /admin/users?search=&role=&page=
  —Utilisateurs
  PATCH /admin/users/{id}/status{ status }
  Organisateurs
  GET /admin/organisateurs?search=&verified=&page=
  —Organisateurs
  PATCH /admin/organisateurs/{id}/verify
  —Statistiques
  GET /admin/statistics/detailed
  —Notifications
  GET /admin/notifications?page=&size=
  —Notifications
  PATCH /admin/notifications/{id}/read—Badges
  sidebarGET /admin/events/pending-count + GET /admin/notifications/nonlu-count—

  Fonctionnalités ajoutées

  Skeletons animés pendant le chargement (barres grises pulsantes)
  Gestion d'erreurs avec bouton "Réessayer"
  Recherche avec debounce 400ms (pas de requête à chaque frappe)
  Pagination serveur sur tous les tableaux
  Filtres combinables : statut + catégorie + ville pour les événements
  Badges live dans la sidebar (compteur d'événements en attente + notifications non lues)
  Bouton cloche dans le header avec badge dynamique
 */

import { useState, useEffect, useCallback, useRef } from "react";
import {
  FaHome, FaUsers, FaUserShield, FaCheckCircle, FaTags,
  FaMapMarkerAlt, FaChartBar, FaCogs, FaBars, FaTimes,
  FaSearch, FaFilter, FaBan, FaCheck, FaExclamationTriangle,
  FaEye, FaBell, FaSync, FaDownload, FaCalendarAlt,
  FaTicketAlt, FaMoneyBillWave, FaSpinner, FaSignOutAlt
} from "react-icons/fa";
// import { CategoriesPage, NotificationToasts, useNotifications }
//      from "";

import { useAuth } from "../../context/AuthContext";
import apiFetch, { BASE_URL } from "../../utils/fetchFn";
import { HashLink as Link } from 'react-router-hash-link';
import rovistaLogo from '../../assets/logos/rovista.svg'
import { CategoriesPage, NotificationToasts, useNotifications } from "../CategoriesPage_NotificationsSystem";

// ─────────────────────────────────────────────────────────────────
// CONFIG API  →  adaptez BASE_URL à votre backend Spring Boot / Oracle
// ─────────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────────
// HOOKS API
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

  useEffect(() => { load(); return () => abortRef.current?.abort(); }, [load]);
  return { data, loading, error, refetch: load };
};

// ─────────────────────────────────────────────────────────────────
// REUSABLE UI
// ─────────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const styles = {
    "Approuvé":   "bg-emerald-100 text-emerald-700 border border-emerald-200",
    "En attente": "bg-amber-100   text-amber-700   border border-amber-200",
    "Suspendu":   "bg-rose-100    text-rose-700    border border-rose-200",
    "Rejeté":     "bg-gray-100    text-gray-700    border border-gray-200",
    "Actif":      "bg-emerald-100 text-emerald-700 border border-emerald-200",
    "Inactif":    "bg-gray-100    text-gray-600    border border-gray-200",
    "Vérifié":    "bg-blue-100    text-blue-700    border border-blue-200",
    "Non vérifié":"bg-yellow-100  text-yellow-700  border border-yellow-200",
  };
  return (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${styles[status] || "bg-gray-100 text-gray-600"}`}>
      {status}
    </span>
  );
};

const Spinner = ({ size = "sm" }) => (
  <FaSpinner className={`animate-spin text-violet-500 ${size === "lg" ? "text-3xl" : "text-base"}`} />
);

const ErrorBanner = ({ message, onRetry }) => (
  <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center justify-between gap-3">
    <div className="flex items-center gap-2 text-red-700 text-sm font-medium">
      <FaExclamationTriangle />
      <span>{message}</span>
    </div>
    {onRetry && (
      <button onClick={onRetry} className="text-xs text-red-600 underline hover:no-underline">Réessayer</button>
    )}
  </div>
);

const LoadingTable = ({ cols = 6 }) => (
  <tbody>
    {[...Array(4)].map((_, i) => (
      <tr key={i} className="border-b border-gray-50">
        {[...Array(cols)].map((_, j) => (
          <td key={j} className="px-6 py-4">
            <div className="h-3.5 bg-gray-100 rounded-full animate-pulse" style={{ width: `${60 + Math.random() * 40}%` }} />
          </td>
        ))}
      </tr>
    ))}
  </tbody>
);

// ─────────────────────────────────────────────────────────────────
// PAGE : DASHBOARD HOME  (statistiques calculées depuis l'API)
// ─────────────────────────────────────────────────────────────────
const DashboardHome = () => {
  const { data: stats, loading, error, refetch } = useApi(
    () => apiFetch("/admin/statistiques")
  );

  const { data: recentEvents, loading: loadingEv } = useApi(
    () => apiFetch("/admin/events?sort=createdAt,desc&size=5")
  );

  const { data: notifications, loading: loadingNotif } = useApi(
    () => apiFetch("/admin/notifications?size=5")
  );

  const cards = stats ? [
    { label: "Utilisateurs", value: stats.totalUsers?.toLocaleString() || "—", icon: <FaUsers />, color: "bg-blue-50 text-blue-600", change: stats.newUsersThisMonth ? `+${stats.newUsersThisMonth} ce mois` : null },
    { label: "Organisateurs", value: stats.totalorganisateurs?.toLocaleString() || "—", icon: <FaUserShield />, color: "bg-violet-50 text-violet-600", change: stats.pendingorganisateurs ? `${stats.pendingorganisateurs} en attente` : null },
    { label: "Événements actifs", value: stats.activeEvents?.toLocaleString() || "—", icon: <FaCalendarAlt />, color: "bg-emerald-50 text-emerald-600", change: stats.pendingEvents ? `${stats.pendingEvents} à valider` : null },
    { label: "Réservations", value: stats.totalBookings?.toLocaleString() || "—", icon: <FaTicketAlt />, color: "bg-amber-50 text-amber-600", change: stats.bookingsThisMonth ? `+${stats.bookingsThisMonth} ce mois` : null },
    { label: "Revenus totaux", value: stats.totalRevenue ? `${(stats.totalRevenue / 1000).toFixed(0)}k DH` : "—", icon: <FaMoneyBillWave />, color: "bg-rose-50 text-rose-600", change: stats.revenueGrowth ? `${stats.revenueGrowth > 0 ? "+" : ""}${stats.revenueGrowth}% vs mois dernier` : null },
    { label: "Catégories", value: stats.totalCategories?.toString() || "—", icon: <FaTags />, color: "bg-teal-50 text-teal-600", change: null },
  ] : [];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Dashboard Administrateur</h2>
          <p className="text-gray-500 text-sm mt-0.5">Vue en temps réel de la plateforme</p>
        </div>
        <button onClick={refetch} className="flex items-center gap-2 text-sm text-gray-500 hover:text-violet-600 border border-gray-200 px-3 py-2 rounded-xl hover:bg-violet-50 transition">
          <FaSync className={loading ? "animate-spin" : ""} size={13} />
          Actualiser
        </button>
      </div>

      {error && <ErrorBanner message={error} onRetry={refetch} />}

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {loading
          ? [...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-3">
                <div className="w-10 h-10 bg-gray-100 rounded-xl animate-pulse" />
                <div className="h-6 w-16 bg-gray-100 rounded animate-pulse" />
                <div className="h-3 w-24 bg-gray-100 rounded animate-pulse" />
              </div>
            ))
          : cards.map((s, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${s.color}`}>{s.icon}</div>
                <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                <p className="text-sm text-gray-500 mt-0.5">{s.label}</p>
                {s.change && <p className="text-xs text-violet-600 font-medium mt-1">{s.change}</p>}
              </div>
            ))
        }
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Événements récents */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
            <h3 className="font-semibold text-gray-800 text-sm">Derniers événements soumis</h3>
            {loadingEv && <Spinner />}
          </div>
          <div className="divide-y divide-gray-50">
            {recentEvents?.content?.map(ev => (
              <div key={ev.id} className="px-5 py-3.5 flex items-center justify-between hover:bg-gray-50/60 transition-colors">
                <div className="min-w-0 mr-3">
                  <p className="font-medium text-gray-900 text-sm truncate">{ev.titre || ev.title}</p>
                  <p className="text-xs text-gray-400">{ev.organisateur?.nom || ev.organizerName} · {ev.categorie || ev.category}</p>
                </div>
                <StatusBadge status={ev.status} />
              </div>
            ))}
            {!loadingEv && !recentEvents?.content?.length && (
              <p className="text-center text-gray-400 text-sm py-6">Aucun événement récent</p>
            )}
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
            <h3 className="font-semibold text-gray-800 text-sm">Notifications récentes</h3>
            {loadingNotif && <Spinner />}
          </div>
          <div className="divide-y divide-gray-50">
            {notifications?.content?.map(n => (
              <div key={n.id} className={`px-5 py-3.5 flex items-start gap-3 hover:bg-gray-50/60 transition-colors ${!n.read ? "bg-violet-50/30" : ""}`}>
                <div className={`p-2 rounded-xl mt-0.5 flex-shrink-0 ${!n.read ? "bg-violet-100 text-violet-600" : "bg-gray-100 text-gray-500"}`}>
                  <FaBell size={11} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-gray-800 font-medium">{n.message}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{n.createdAt ? new Date(n.createdAt).toLocaleString("fr-FR") : n.time}</p>
                </div>
                {!n.read && <div className="w-2 h-2 bg-violet-500 rounded-full mt-2 flex-shrink-0" />}
              </div>
            ))}
            {!loadingNotif && !notifications?.content?.length && (
              <p className="text-center text-gray-400 text-sm py-6">Aucune notification</p>
            )}
          </div>
        </div>
      </div>
      <NotificationToasts
        alerts={newAlerts}
        onDismiss={clearAlerts}
        onNavigate={setPage}
      />
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────
// PAGE : VALIDATION ÉVÉNEMENTS  (API réelle + filtres + recherche)
// ─────────────────────────────────────────────────────────────────
const EventsValidationPage = () => {
  const [search, setSearch]         = useState("");
  const [statusFilter, setStatus]   = useState("Tous");
  const [catFilter, setCat]         = useState("Tous");
  const [cityFilter, setCity]       = useState("Tous");
  const [page, setPage]             = useState(0);
  const [selectedEvent, setSelected] = useState(null);
  const [modalAction, setAction]    = useState("");
  const [reason, setReason]         = useState("");
  const [actionLoading, setActLoad] = useState(false);
  const [actionError, setActError]  = useState("");
  const [categories, setCategories] = useState([]);
  const [cities, setCities]         = useState([]);

  // Charger catégories et villes pour les filtres
  useEffect(() => {
    apiFetch("/public/categories").then(d => setCategories(d?.content || d || [])).catch(() => {});
    apiFetch("/public/villes").then(d => setCities(d?.content || d || [])).catch(() => {});
  }, []);

  // Construction de la query string
  const buildQuery = () => {
    const params = new URLSearchParams({ page, size: 10, sort: "createdAt,desc" });
    if (search)                    params.set("search", search);
    if (statusFilter !== "Tous")   params.set("status", statusFilter);
    if (catFilter !== "Tous")      params.set("categorie", catFilter);
    if (cityFilter !== "Tous")     params.set("ville", cityFilter);
    return params.toString();
  };

  const { data, loading, error, refetch } = useApi(
    () => apiFetch(`/admin/events?${buildQuery()}`),
    [search, statusFilter, catFilter, cityFilter, page]
  );

  const events    = data?.content || [];
  const totalPages = data?.totalPages || 0;
  const totalEl   = data?.totalElements || 0;

  // Debounce recherche
  const searchTimer = useRef(null);
  const handleSearch = (v) => {
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => { setSearch(v); setPage(0); }, 400);
  };

  // PATCH status d'un événement
  const patchStatus = async (id, newStatus, motif = "") => {
    setActLoad(true);
    setActError("");
    try {
      await apiFetch(`/admin/events/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: newStatus, motif }),
      });
      refetch();
      setSelected(null);
      setReason("");
    } catch (e) {
      setActError(e.message);
    } finally {
      setActLoad(false);
    }
  };

  const handleApprove = (id) => patchStatus(id, "Approuvé");

  const confirmModal = () => {
    if (modalAction !== "consulter" && !reason.trim()) {
      setActError("Le motif est obligatoire.");
      return;
    }
    const newStatus = modalAction === "suspendre" ? "Suspendu" : "Rejeté";
    patchStatus(selectedEvent.id, newStatus, reason);
  };

  const openModal = (ev, action) => {
    setSelected(ev);
    setAction(action);
    setReason(ev.motif || "");
    setActError("");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Validation des Événements</h2>
          <p className="text-gray-500 text-sm mt-0.5">
            {loading ? "Chargement…" : `${totalEl} événement${totalEl !== 1 ? "s" : ""} trouvé${totalEl !== 1 ? "s" : ""}`}
          </p>
        </div>
        <button onClick={refetch} className="flex items-center gap-2 text-sm text-gray-500 hover:text-violet-600 border border-gray-200 px-3 py-2 rounded-xl hover:bg-violet-50 transition self-start">
          <FaSync className={loading ? "animate-spin" : ""} size={12} />
          Actualiser
        </button>
      </div>

      {error && <ErrorBanner message={error} onRetry={refetch} />}

      {/* ── Filtres ── */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-3 items-stretch md:items-center">
        <div className="relative flex-1 min-w-0">
          <FaSearch className="absolute left-3.5 top-3.5 text-gray-400 text-xs" />
          <input
            type="text"
            placeholder="Rechercher titre, organisateur…"
            onChange={e => handleSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-violet-500 transition-all"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {[
            { value: statusFilter, onChange: v => { setStatus(v); setPage(0); }, options: ["Tous", "En attente", "Approuvé", "Suspendu", "Rejeté"], placeholder: "Statut" },
            { value: catFilter,    onChange: v => { setCat(v);    setPage(0); }, options: ["Tous", ...categories.map(c => c.nom || c.name || c)], placeholder: "Catégorie" },
            { value: cityFilter,   onChange: v => { setCity(v);   setPage(0); }, options: ["Tous", ...cities.map(c => c.nom || c.name || c)],      placeholder: "Ville" },
          ].map(({ value, onChange, options, placeholder }) => (
            <select key={placeholder} value={value} onChange={e => onChange(e.target.value)}
              className="bg-gray-50 border border-gray-200 px-3 py-2.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-violet-500 text-gray-700 min-w-[120px]">
              {options.map(o => <option key={o} value={o}>{o === "Tous" ? placeholder + " (tous)" : o}</option>)}
            </select>
          ))}
        </div>
      </div>

      {/* ── Tableau ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-auto">
        <table className="w-full text-sm min-w-[900px]">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {["Événement & Organisateur", "Catégorie", "Date & Lieu", "Prix", "Statut", "Actions"].map(h => (
                <th key={h} className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          {loading
            ? <LoadingTable cols={6} />
            : (
              <tbody className="divide-y divide-gray-50">
                {events.length === 0 && (
                  <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-400">Aucun résultat</td></tr>
                )}
                {events.map(ev => (
                  <tr key={ev.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-gray-900">{ev.titre || ev.title}</p>
                      <p className="text-xs text-violet-600 font-medium mt-0.5">{ev.organisateur?.nom || ev.organizerName}</p>
                    </td>
                    <td className="px-6 py-4 text-gray-600 font-medium">{ev.categorie || ev.category}</td>
                    <td className="px-6 py-4">
                      <p className="text-gray-800 font-medium">{ev.date ? new Date(ev.date).toLocaleDateString("fr-FR") : ev.dateFormatted}</p>
                      <p className="text-xs text-gray-400">{ev.lieu || ev.city}</p>
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-900">
                      {ev.prix === 0 ? "Gratuit" : `${ev.prix} DH`}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={ev.status} />
                      {ev.motif && (
                        <p className="text-[11px] text-rose-500 mt-1 max-w-[160px] truncate" title={ev.motif}>
                          {ev.motif}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-1.5">
                        {ev.status !== "Approuvé" && ev.status !== "Rejeté" && (
                          <button onClick={() => handleApprove(ev.id)} title="Approuver"
                            className="p-2 text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition">
                            <FaCheck size={12} />
                          </button>
                        )}
                        {ev.status === "Approuvé" && (
                          <button onClick={() => openModal(ev, "suspendre")} title="Suspendre"
                            className="p-2 text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl transition">
                            <FaBan size={12} />
                          </button>
                        )}
                        {ev.status === "En attente" && (
                          <button onClick={() => openModal(ev, "rejeter")} title="Rejeter"
                            className="p-2 text-gray-500 bg-gray-100 hover:bg-gray-200 rounded-xl transition">
                            <FaTimes size={12} />
                          </button>
                        )}
                        <button onClick={() => openModal(ev, "consulter")} title="Détails"
                          className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition">
                          <FaEye size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            )
          }
        </table>
      </div>

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>Page {page + 1} sur {totalPages}</span>
          <div className="flex gap-2">
            <button disabled={page === 0} onClick={() => setPage(p => p - 1)}
              className="px-3 py-1.5 border border-gray-200 rounded-xl disabled:opacity-40 hover:bg-gray-50 transition">
              ← Précédent
            </button>
            <button disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}
              className="px-3 py-1.5 border border-gray-200 rounded-xl disabled:opacity-40 hover:bg-gray-50 transition">
              Suivant →
            </button>
          </div>
        </div>
      )}

      {/* ── Modal action ── */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-gray-900 capitalize flex items-center gap-2">
                {modalAction === "suspendre"  && <FaBan className="text-rose-500" />}
                {modalAction === "rejeter"    && <FaExclamationTriangle className="text-amber-500" />}
                {modalAction === "consulter"  && <FaEye className="text-blue-500" />}
                {modalAction} l'événement
              </h3>
              <button onClick={() => setSelected(null)}><FaTimes className="text-gray-400 hover:text-gray-600" /></button>
            </div>

            <div className="bg-gray-50 p-3 rounded-xl">
              <p className="text-sm font-semibold text-gray-800">{selectedEvent.titre || selectedEvent.title}</p>
              <p className="text-xs text-gray-400 mt-0.5">Par : {selectedEvent.organisateur?.nom || selectedEvent.organizerName}</p>
              <p className="text-xs text-gray-400">{selectedEvent.date ? new Date(selectedEvent.date).toLocaleDateString("fr-FR") : ""} · {selectedEvent.lieu || selectedEvent.city}</p>
            </div>

            {modalAction === "consulter" ? (
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Statut actuel</p>
                <StatusBadge status={selectedEvent.status} />
                {selectedEvent.motif && (
                  <div className="mt-3 bg-rose-50 p-3 rounded-xl border border-rose-100">
                    <p className="text-xs font-bold text-rose-600 uppercase mb-1">Motif</p>
                    <p className="text-sm text-gray-700">{selectedEvent.motif}</p>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Motif de {modalAction === "suspendre" ? "suspension" : "refus"} <span className="text-rose-500">*</span>
                </label>
                <textarea rows={3} value={reason} onChange={e => setReason(e.target.value)}
                  placeholder="Expliquez clairement la raison à l'organisateur…"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-rose-400 resize-none transition-all" />
              </div>
            )}

            {actionError && <p className="text-xs text-red-600 font-medium">{actionError}</p>}

            <div className="flex justify-end gap-3 pt-1">
              <button onClick={() => setSelected(null)}
                className="px-4 py-2 text-sm font-semibold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition">
                {modalAction === "consulter" ? "Fermer" : "Annuler"}
              </button>
              {modalAction !== "consulter" && (
                <button onClick={confirmModal} disabled={actionLoading}
                  className={`px-4 py-2 text-sm font-semibold text-white rounded-xl transition flex items-center gap-2 disabled:opacity-60 ${
                    modalAction === "suspendre" ? "bg-rose-600 hover:bg-rose-700" : "bg-gray-800 hover:bg-gray-900"
                  }`}>
                  {actionLoading && <Spinner />}
                  Confirmer
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────
// PAGE : UTILISATEURS
// ─────────────────────────────────────────────────────────────────
const UsersPage = () => {
  const [search, setSearch]   = useState("");
  const [roleFilter, setRole] = useState("Tous");
  const [pg, setPg]           = useState(0);
  const searchTimer = useRef(null);

  const buildQ = () => {
    const p = new URLSearchParams({ page: pg, size: 10 });
    if (search) p.set("search", search);
    if (roleFilter !== "Tous") p.set("role", roleFilter);
    return p.toString();
  };

  const { data, loading, error, refetch } = useApi(
    () => apiFetch(`/admin/users?${buildQ()}`),
    [search, roleFilter, pg]
  );

  const users = data?.content || [];
  const totalPages = data?.totalPages || 0;

  const toggleStatus = async (id, currentStatus) => {
    try {
      await apiFetch(`/admin/users/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: currentStatus === "Actif" ? "Inactif" : "Actif" }),
      });
      refetch();
    } catch (e) { alert(e.message); }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Utilisateurs</h2>

      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <FaSearch className="absolute left-3.5 top-3.5 text-gray-400 text-xs" />
          <input type="text" placeholder="Rechercher un utilisateur…"
            onChange={e => { clearTimeout(searchTimer.current); searchTimer.current = setTimeout(() => { setSearch(e.target.value); setPg(0); }, 400); }}
            className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-violet-500" />
        </div>
        <select value={roleFilter} onChange={e => { setRole(e.target.value); setPg(0); }}
          className="bg-gray-50 border border-gray-200 px-4 py-2.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-violet-500 text-gray-700">
          {["Tous", "CLIENT", "ORGANISATEUR", "ADMIN"].map(r => <option key={r}>{r}</option>)}
        </select>
      </div>

      {error && <ErrorBanner message={error} onRetry={refetch} />}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-auto">
        <table className="w-full text-sm min-w-[700px]">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>{["Utilisateur", "Email", "Rôle", "Inscrit le", "Statut", "Actions"].map(h => (
              <th key={h} className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
            ))}</tr>
          </thead>
          {loading ? <LoadingTable cols={6} /> : (
            <tbody className="divide-y divide-gray-50">
              {users.length === 0 && <tr><td colSpan={6} className="px-6 py-10 text-center text-gray-400">Aucun utilisateur</td></tr>}
              {users.map(u => (
                <tr key={u.id} className="hover:bg-gray-50/70 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img src={u.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.nom || u.name || "U")}&size=36&background=6366f1&color=fff`}
                        alt="" className="w-8 h-8 rounded-xl" />
                      <span className="font-medium text-gray-900">{u.nom || u.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-500">{u.email}</td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-semibold bg-violet-50 text-violet-700 px-2.5 py-1 rounded-full">{u.role}</span>
                  </td>
                  <td className="px-6 py-4 text-gray-500 text-xs">{u.createdAt ? new Date(u.createdAt).toLocaleDateString("fr-FR") : "—"}</td>
                  <td className="px-6 py-4"><StatusBadge status={u.status || "Actif"} /></td>
                  <td className="px-6 py-4">
                    <button onClick={() => toggleStatus(u.id, u.status || "Actif")}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition ${
                        u.status === "Inactif" ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100" : "bg-rose-50 text-rose-700 hover:bg-rose-100"
                      }`}>
                      {u.status === "Inactif" ? "Activer" : "Désactiver"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          )}
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>Page {pg + 1} / {totalPages}</span>
          <div className="flex gap-2">
            <button disabled={pg === 0} onClick={() => setPg(p => p - 1)} className="px-3 py-1.5 border border-gray-200 rounded-xl disabled:opacity-40 hover:bg-gray-50">← Précédent</button>
            <button disabled={pg >= totalPages - 1} onClick={() => setPg(p => p + 1)} className="px-3 py-1.5 border border-gray-200 rounded-xl disabled:opacity-40 hover:bg-gray-50">Suivant →</button>
          </div>
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────
// PAGE : ORGANISATEURS
// ─────────────────────────────────────────────────────────────────
const OrganisateursPage = () => {
  const [search, setSearch] = useState("");
  const [verif, setVerif]   = useState("Tous");
  const [pg, setPg]         = useState(0);
  const timer = useRef(null);

  const buildQ = () => {
    const p = new URLSearchParams({ page: pg, size: 10 });
    if (search) p.set("search", search);
    if (verif !== "Tous") p.set("verified", verif === "Vérifié");
    return p.toString();
  };

  const { data, loading, error, refetch } = useApi(
    () => apiFetch(`/admin/organisateurs?${buildQ()}`),
    [search, verif, pg]
  );

  const orgs = data?.content || [];

  const verify = async (id) => {
    try {
      await apiFetch(`/admin/organisateurs/${id}/verify`, { method: "PATCH" });
      refetch();
    } catch (e) { alert(e.message); }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Organisateurs</h2>

      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex gap-3">
        <div className="relative flex-1">
          <FaSearch className="absolute left-3.5 top-3.5 text-gray-400 text-xs" />
          <input type="text" placeholder="Rechercher un organisateur…"
            onChange={e => { clearTimeout(timer.current); timer.current = setTimeout(() => { setSearch(e.target.value); setPg(0); }, 400); }}
            className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-violet-500" />
        </div>
        <select value={verif} onChange={e => { setVerif(e.target.value); setPg(0); }}
          className="bg-gray-50 border border-gray-200 px-4 py-2.5 rounded-xl text-sm outline-none text-gray-700">
          {["Tous", "Vérifié", "Non vérifié"].map(v => <option key={v}>{v}</option>)}
        </select>
      </div>

      {error && <ErrorBanner message={error} onRetry={refetch} />}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-auto">
        <table className="w-full text-sm min-w-[700px]">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>{["Organisateur", "Email", "Événements", "Revenus", "Vérification", "Actions"].map(h => (
              <th key={h} className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
            ))}</tr>
          </thead>
          {loading ? <LoadingTable cols={6} /> : (
            <tbody className="divide-y divide-gray-50">
              {orgs.length === 0 && <tr><td colSpan={6} className="px-6 py-10 text-center text-gray-400">Aucun organisateur</td></tr>}
              {orgs.map(o => (
                <tr key={o.id} className="hover:bg-gray-50/70 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-semibold text-gray-900">{o.nom || o.name}</p>
                    <p className="text-xs text-gray-400">{o.ville || o.city}</p>
                  </td>
                  <td className="px-6 py-4 text-gray-500">{o.email}</td>
                  <td className="px-6 py-4 text-center font-medium text-gray-800">{o.totalEvents ?? "—"}</td>
                  <td className="px-6 py-4 font-semibold text-gray-900">{o.totalRevenue ? `${o.totalRevenue.toLocaleString()} DH` : "—"}</td>
                  <td className="px-6 py-4"><StatusBadge status={o.verified ? "Vérifié" : "Non vérifié"} /></td>
                  <td className="px-6 py-4">
                    {!o.verified && (
                      <button onClick={() => verify(o.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-violet-50 text-violet-700 hover:bg-violet-100 rounded-xl transition">
                        <FaCheck size={10} /> Vérifier
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          )}
        </table>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────
// PAGE : STATISTIQUES  (graphiques en barres CSS)
// ─────────────────────────────────────────────────────────────────
const StatisticsPage = () => {
  const { data, loading, error, refetch } = useApi(() => apiFetch("/admin/statistiques/detailed"));

  const maxRev = data?.revenueByCategory ? Math.max(...Object.values(data.revenueByCategory)) : 1;
  const maxEv  = data?.eventsByCategory  ? Math.max(...Object.values(data.eventsByCategory))  : 1;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Statistiques</h2>
        <button onClick={refetch} className="flex items-center gap-2 text-sm text-gray-500 hover:text-violet-600 border border-gray-200 px-3 py-2 rounded-xl hover:bg-violet-50 transition">
          <FaSync className={loading ? "animate-spin" : ""} size={12} />
          Actualiser
        </button>
      </div>

      {error && <ErrorBanner message={error} onRetry={refetch} />}
      {loading && <div className="flex justify-center py-12"><Spinner size="lg" /></div>}

      {data && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Réservations totales", value: data.totalBookings?.toLocaleString() || "—" },
              { label: "Taux d'occupation moyen", value: data.avgOccupancyRate ? `${data.avgOccupancyRate.toFixed(1)}%` : "—" },
              { label: "Revenu moyen / événement", value: data.avgRevenuePerEvent ? `${Math.round(data.avgRevenuePerEvent).toLocaleString()} DH` : "—" },
              { label: "Événements ce mois", value: data.eventsThisMonth?.toString() || "—" },
            ].map((s, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                <p className="text-sm text-gray-500 mt-1">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenus par catégorie */}
            {data.revenueByCategory && (
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <h3 className="font-semibold text-gray-800 mb-5 text-sm">Revenus par catégorie</h3>
                <div className="space-y-4">
                  {Object.entries(data.revenueByCategory).sort((a, b) => b[1] - a[1]).map(([cat, val]) => (
                    <div key={cat}>
                      <div className="flex justify-between text-sm mb-1.5">
                        <span className="text-gray-700 font-medium">{cat}</span>
                        <span className="text-gray-900 font-bold">{val.toLocaleString()} DH</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full transition-all"
                          style={{ width: `${Math.round((val / maxRev) * 100)}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Événements par catégorie */}
            {data.eventsByCategory && (
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <h3 className="font-semibold text-gray-800 mb-5 text-sm">Événements par catégorie</h3>
                <div className="space-y-4">
                  {Object.entries(data.eventsByCategory).sort((a, b) => b[1] - a[1]).map(([cat, val]) => (
                    <div key={cat}>
                      <div className="flex justify-between text-sm mb-1.5">
                        <span className="text-gray-700 font-medium">{cat}</span>
                        <span className="text-gray-900 font-bold">{val}</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full transition-all"
                          style={{ width: `${Math.round((val / maxEv) * 100)}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Top villes */}
            {data.topCities && (
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm lg:col-span-2">
                <h3 className="font-semibold text-gray-800 mb-5 text-sm">Top villes par événements</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {data.topCities.map((city, i) => (
                    <div key={i} className="bg-gray-50 rounded-xl p-4 text-center border border-gray-100">
                      <p className="text-2xl font-bold text-gray-900">{city.count}</p>
                      <p className="text-sm text-gray-500 mt-1">{city.name}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────
// PAGE : NOTIFICATIONS
// ─────────────────────────────────────────────────────────────────
const NotificationsPage = () => {
  const [pg, setPg] = useState(0);
  const { data, loading, error, refetch } = useApi(
    () => apiFetch(`/admin/notifications?page=${pg}&size=15&sort=createdAt,desc`),
    [pg]
  );
  const notifs = data?.content || [];

  const markRead = async (id) => {
    try {
      await apiFetch(`/admin/notifications/${id}/lu`, { method: "PATCH" });
      refetch();
    } catch (e) {}
  };

  const markAllRead = async () => {
    try {
      await apiFetch("/admin/notifications/lire-tout", { method: "PATCH" });
      refetch();
    } catch (e) {}
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Notifications</h2>
        <button onClick={markAllRead} className="text-sm text-violet-600 hover:underline font-medium">Tout marquer lu</button>
      </div>

      {error && <ErrorBanner message={error} onRetry={refetch} />}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-50">
        {loading && [...Array(5)].map((_, i) => (
          <div key={i} className="px-5 py-4 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gray-100 animate-pulse flex-shrink-0" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3 bg-gray-100 rounded animate-pulse w-3/4" />
              <div className="h-2.5 bg-gray-100 rounded animate-pulse w-1/3" />
            </div>
          </div>
        ))}
        {!loading && notifs.length === 0 && (
          <p className="text-center text-gray-400 text-sm py-10">Aucune notification</p>
        )}
        {notifs.map(n => (
          <div key={n.id}
            onClick={() => !n.read && markRead(n.id)}
            className={`px-5 py-4 flex items-start gap-3 transition-colors cursor-pointer hover:bg-gray-50 ${!n.read ? "bg-violet-50/40" : ""}`}>
            <div className={`p-2 rounded-xl mt-0.5 flex-shrink-0 ${!n.read ? "bg-violet-100 text-violet-600" : "bg-gray-100 text-gray-400"}`}>
              <FaBell size={12} />
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-sm ${!n.read ? "font-semibold text-gray-900" : "text-gray-600"}`}>{n.message}</p>
              <p className="text-xs text-gray-400 mt-0.5">{n.createdAt ? new Date(n.createdAt).toLocaleString("fr-FR") : n.time}</p>
            </div>
            {!n.read && <div className="w-2 h-2 bg-violet-500 rounded-full mt-2 flex-shrink-0" />}
          </div>
        ))}
      </div>

      {data?.totalPages > 1 && (
        <div className="flex justify-center gap-2 text-sm">
          <button disabled={pg === 0} onClick={() => setPg(p => p - 1)} className="px-3 py-1.5 border border-gray-200 rounded-xl disabled:opacity-40 hover:bg-gray-50">← Précédent</button>
          <button disabled={pg >= data.totalPages - 1} onClick={() => setPg(p => p + 1)} className="px-3 py-1.5 border border-gray-200 rounded-xl disabled:opacity-40 hover:bg-gray-50">Suivant →</button>
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────
// PLACEHOLDER générique
// ─────────────────────────────────────────────────────────────────
const PlaceholderPage = ({ title }) => (
  <div className="bg-white p-10 rounded-2xl border border-gray-100 shadow-sm text-center max-w-md mx-auto">
    <div className="w-14 h-14 bg-violet-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
      <FaCogs className="text-violet-400 text-xl" />
    </div>
    <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-500 text-sm">Connectez ce module à votre API Spring Boot / Oracle.</p>
  </div>
);

// ─────────────────────────────────────────────────────────────────
// MAIN LAYOUT
// ─────────────────────────────────────────────────────────────────
export default function AdminDashboard() {

  const { user, logout } = useAuth();
  const [page, setPage]           = useState("events-validation");
  const [sidebarOpen, setSidebar] = useState(false);

  // Badge "En attente" live
  
  // const { data: pending } = useApi(() => apiFetch("/admin/events/pending-count"));
  // const pendingCount = pending?.count || 0;

  const {
    pendingCount,
    unreadCount,
    newAlerts,
    clearAlerts,
  } = useNotifications();

  const { data: unreadNotifs } = useApi(() => apiFetch("/admin/notifications/nonlu-count"));
  //const unreadCount = unreadNotifs?.count || 0;

  const menu = [
    { id: "dashboard",          label: "Dashboard",             icon: <FaHome /> },
    { id: "users",              label: "Utilisateurs",          icon: <FaUsers /> },
    { id: "organisateurs",         label: "Organisateurs",         icon: <FaUserShield /> },
    { id: "events-validation",  label: "Validation événements", icon: <FaCheckCircle />, badge: pendingCount },
    { id: "notifications",      label: "Notifications",         icon: <FaBell />, badge: unreadCount },
    { id: "categories",         label: "Catégories",            icon: <FaTags /> },
    { id: "villes",             label: "Villes",                icon: <FaMapMarkerAlt /> },
    { id: "statistics",         label: "Statistiques",          icon: <FaChartBar /> },
    { id: "settings",           label: "Paramètres",            icon: <FaCogs /> },
  ];

  const renderPage = () => {
    switch (page) {
      case "dashboard":         return <DashboardHome />;
      case "events-validation": return <EventsValidationPage />;
      case "users":             return <UsersPage />;
      case "organisateurs":        return <OrganisateursPage />;
      case "statistics":        return <StatisticsPage />;
      case "notifications":     return <NotificationsPage />;
      case "categories":        return <CategoriesPage />;
      default:                  return <PlaceholderPage title={menu.find(m => m.id === page)?.label || page} />;
    }
  };

  const SidebarContent = ({ user, logout }) => (
    // ou proprement const { user, logout } = useAuth(); que props
    <>
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center shadow-md shadow-violet-200">
            <FaUserShield className="text-white text-sm" />
          </div>
          <div>
            <p className="font-bold text-gray-900 text-sm">AtlasEvents Admin</p>
            <p className="text-[11px] text-gray-400">Panneau de contrôle</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {menu.map(item => (
          <button key={item.id} onClick={() => { setPage(item.id); setSidebar(false); }}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
              page === item.id
                ? "bg-violet-600 text-white shadow-md shadow-violet-200"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            }`}>
            <div className="flex items-center gap-3">
              <span className="text-base">{item.icon}</span>
              <span>{item.label}</span>
            </div>
            {item.badge > 0 && (
              <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                page === item.id ? "bg-white text-violet-600" : "bg-amber-100 text-amber-800"
              }`}>{item.badge}</span>
            )}
          </button>
        ))}
        {/* ← AJOUTER : séparateur + bouton retour */}
                <div className="pt-3 mt-3 border-t border-gray-100">
                  <Link
                    to="/"
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-all">
                    <FaHome className="text-base" />
                    Retour à l'accueil
                  </Link>
                  <Link
                    to="/events#list"
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-all">
                    <FaCalendarAlt className="text-base" />
                    Voir les événements
                  </Link>
                </div>
      </nav>

      <div className="p-4 border-t border-gray-100 bg-gray-50/50">
        <div className="flex items-center gap-3 px-2 py-1">
          <img
            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.nom || "A")}&size=36&background=1e1b4b&color=fff`}
            alt="admin"
            className="w-9 h-9 rounded-xl border border-gray-200"
          />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-gray-900 truncate">Super Administrateur</p>
            <p className="text-[10px] text-emerald-600 font-medium flex items-center gap-1">● Connecté</p>
          </div>
          <button
            onClick={logout}
            title="Déconnexion"
            className="text-gray-400 hover:text-red-500 transition-colors flex-shrink-0">
            <FaSignOutAlt size={14} />
          </button>
        </div>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="hidden lg:flex w-64 bg-white border-r border-gray-100 flex-col shadow-sm flex-shrink-0">
        <SidebarContent user={user} logout={logout} />
      </aside>

      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSidebar(false)} />
          <aside className="relative w-64 bg-white flex flex-col shadow-xl">
            <button onClick={() => setSidebar(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
              <FaTimes size={18} />
            </button>
            <SidebarContent user={user} logout={logout} />
          </aside>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
            
                        {/* ← BOUTONS ICI à droite */}
                        <Link to="/" className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-blue-600 border border-gray-200 hover:border-blue-300 px-3 py-1.5 rounded-xl transition">
                          <FaHome size={12} /> Accueil
                        </Link>
                        <Link to="/events#list" className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-blue-600 border border-gray-200 hover:border-blue-300 px-3 py-1.5 rounded-xl transition">
                          <FaCalendarAlt size={12} /> Événements
                        </Link>
            <button onClick={() => setSidebar(true)} className="lg:hidden text-gray-500 hover:text-gray-700">
              <FaBars size={18} />
            </button>
            
            <h1 className="font-bold text-gray-800">
              {menu.find(m => m.id === page)?.label || "Administration"}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setPage("notifications")} className="relative p-2 text-gray-500 hover:text-violet-600 hover:bg-violet-50 rounded-xl transition">
              <FaBell size={17} />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>
            <span className="text-xs text-gray-400 font-medium hidden sm:block">Espace d'administration</span>
          </div>
        </header>

        <main className="flex-1 p-6 overflow-auto">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}