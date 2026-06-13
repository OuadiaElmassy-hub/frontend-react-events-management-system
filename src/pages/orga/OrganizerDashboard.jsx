
// Voici ce qui a été transformé — même architecture que Client et Admin :

// **Endpoints Spring Boot attendus**

// | Page | Endpoint | Méthode | Réponse |
// |------|----------|---------|---------|
// | Dashboard | `GET /organisateur/dashboard/stats` | — | `{ activeEvents, totalParticipants, totalRevenue, avgFillRate, prenom, ... }` |
// | Dashboard | `GET /organisateur/events?sort=createdAt,desc&size=5` | — | `Page<EventDTO>` |
// | Événements | `GET /organisateur/events?search=&status=&page=&size=` | — | `Page<EventDTO>` |
// | Événements | `POST /organisateur/events` | body JSON | `EventDTO` |
// | Événements | `PUT /organisateur/events/{id}` | body JSON | `EventDTO` |
// | Événements | `DELETE /organisateur/events/{id}` | — | `204` |
// | Événements | `PATCH /organisateur/events/{id}/status` | `{ status }` | `200` |
// | Réservations | `GET /organisateur/reservations?eventId=&statut=&page=` | — | `Page + totalRevenu` |
// | Réservations | `GET /organisateur/reservations/export/pdf` | — | `blob PDF` |
// | Réservations | `GET /organisateur/reservations/export/excel` | — | `blob XLSX` |
// | Statistiques | `GET /organisateur/statistics` | — | `{ revenueByEvent[], fillRateByEvent[], bookingsByMonth[] }` |
// | Profil | `GET /organisateur/profile` | — | `{ nom, organisationNom, siret, verified, ... }` |
// | Profil | `PUT /organisateur/profile` | body JSON | `200` |
// | Profil | `PATCH /organisateur/profile/password` | `{ currentPassword, newPassword }` | `200` |
// | Notif badge | `GET /organisateur/notifications/nonlu-count` | — | `{ count }` |

// **Fonctionnalités ajoutées vs version mock :**
// - Skeletons animés sur toutes les pages
// - `useApi` hook avec abort controller et refetch
// - CRUD complet avec feedback spinner + gestion d'erreurs inline
// - Suppression avec `window.confirm` + état `deleting` par ligne
// - Publication/dépublication avec état `toggling` par ligne
// - Export PDF/Excel avec téléchargement blob natif
// - Filtre réservations par événement (chargé depuis l'API)
// - Badge notifications live dans le header
// - Graphique barres CSS pour réservations par mois
// - Clic avatar → redirige vers Profil
// - `defaultShowForm={true}` sur "Ajouter événement" ouvre le formulaire directement


// promotions:

import { useState, useEffect, useCallback, useRef } from "react";
import {
  FaHome, FaCalendarAlt, FaPlus, FaTicketAlt, FaChartBar,
  FaUser, FaBars, FaTimes, FaEdit, FaTrash, FaEye, FaSignOutAlt,
  FaDownload, FaBell, FaSpinner, FaSync, FaExclamationTriangle,
  FaCheck, FaSave, FaFileExcel, FaFilePdf, FaTag, FaToggleOn,
  FaToggleOff, FaPercent, FaDollarSign, FaClock, FaGift
} from "react-icons/fa";

import { useAuth } from "../../context/AuthContext";
import apiFetch, { BASE_URL } from "../../utils/fetchFn";
import { HashLink as Link } from 'react-router-hash-link';
import rovistaLogo from '../../assets/logos/rovista.svg'

// ═══════════════════════════════════════════════════════════════
// CONFIG API
// ═══════════════════════════════════════════════════════════════

// Téléchargement blob (PDF / Excel)
const apiFetchBlob = async (path) => {
  const token = localStorage.getItem("token");
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { ...(token && { Authorization: `Bearer ${token}` }) },
  });
  if (res.status === 401) { window.location.href = "/auth"; return; }
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.blob();
};

// ═══════════════════════════════════════════════════════════════
// HOOK useApi
// ═══════════════════════════════════════════════════════════════
const useApi = (fetchFn, deps = []) => {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  const abortRef = useRef(null);

  const load = useCallback(async () => {

    // ← AJOUT : ne pas fetcher si pas de token
    if (!localStorage.getItem("token")) {
      setLoading(false);
      return;
    }
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    load();
    return () => abortRef.current?.abort();
  }, [load]);

  return { data, loading, error, refetch: load, setData };
};

// ═══════════════════════════════════════════════════════════════
// REUSABLE UI
// ═══════════════════════════════════════════════════════════════
const Spinner = ({ size = "sm" }) => (
  <FaSpinner className={`animate-spin text-violet-500 ${size === "lg" ? "text-3xl" : "text-sm"}`} />
);

const ErrorBanner = ({ message, onRetry }) => (
  <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center justify-between gap-3">
    <div className="flex items-center gap-2 text-red-700 text-sm font-medium">
      <FaExclamationTriangle />
      <span>{message}</span>
    </div>
    {onRetry && (
      <button onClick={onRetry} className="text-xs text-red-600 underline hover:no-underline font-semibold">
        Réessayer
      </button>
    )}
  </div>
);

const SkeletonRow = ({ cols = 6 }) => (
  <tr className="border-b border-gray-50">
    {[...Array(cols)].map((_, j) => (
      <td key={j} className="px-5 py-4">
        <div className="h-3.5 bg-gray-100 rounded-full animate-pulse" style={{ width: `${55 + Math.random() * 40}%` }} />
      </td>
    ))}
  </tr>
);

const StatusBadge = ({ status }) => {
  const m = {
    "Publié":     "bg-emerald-100 text-emerald-700",
    "Brouillon":  "bg-amber-100 text-amber-700",
    "Suspendu":   "bg-red-100 text-red-700",
    "Confirmé":   "bg-blue-100 text-blue-700",
    "En attente": "bg-yellow-100 text-yellow-700",
    "Annulé":     "bg-red-100 text-red-700",
  };
  return (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${m[status] || "bg-gray-100 text-gray-600"}`}>
      {status}
    </span>
  );
};

// ═══════════════════════════════════════════════════════════════
// PAGE : DASHBOARD HOME
// GET /organisateur/dashboard/stats
//   → { activeEvents, totalParticipants, totalRevenue, avgFillRate,
//       newParticipantsThisWeek, revenueGrowth, prenom }
// GET /organisateur/events?sort=createdAt,desc&size=5
//   → { content: [...] }
// ═══════════════════════════════════════════════════════════════
const OrgDashboard = () => {
  const { user, logout } = useAuth(); 
  const { data: stats,   loading: lS, error: eS, refetch: rS } = useApi(
    () => apiFetch("/organisateur/statistiques")
  );
  const { data: recent,  loading: lR, error: eR, refetch: rR } = useApi(
    () => apiFetch("/organisateur/events?sort=createdAt,desc&size=5")
  );

  const cards = stats ? [
    { label: "Événements actifs",    value: stats.activeEvents,
      icon: <FaCalendarAlt />, color: "bg-blue-50 text-blue-600",
      change: stats.newEventsThisMonth ? `+${stats.newEventsThisMonth} ce mois` : null },
    { label: "Participants",          value: (stats.totalParticipants || 0).toLocaleString(),
      icon: <FaUser />,        color: "bg-emerald-50 text-emerald-600",
      change: stats.newParticipantsThisWeek ? `+${stats.newParticipantsThisWeek} cette semaine` : null },
    { label: "Revenus",               value: stats.totalRevenue
        ? `${(stats.totalRevenue / 1000).toFixed(0)}k DH`
        : "0 DH",
      icon: <FaChartBar />,    color: "bg-violet-50 text-violet-600",
      change: stats.revenueGrowth ? `${stats.revenueGrowth > 0 ? "+" : ""}${stats.revenueGrowth}% ce mois` : null },
    { label: "Taux de remplissage",   value: stats.avgFillRate
        ? `${Math.round(stats.avgFillRate)}%`
        : "—",
      icon: <FaTicketAlt />,   color: "bg-amber-50 text-amber-600",
      change: "Moyen" },
  ] : [];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">
            Bonjour{user?.prenom ? `, ${user.prenom}` : user?.nom ? `, ${user.nom}` : ""} 👋
          </h2>
          <p className="text-gray-500 text-sm">Vue d'ensemble de votre activité</p>
        </div>
        <button onClick={() => { rS(); rR(); }}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-violet-600 border border-gray-200 px-3 py-2 rounded-xl hover:bg-violet-50 transition">
          <FaSync className={(lS || lR) ? "animate-spin" : ""} size={12} />
          Actualiser
        </button>
      </div>

      {eS && <ErrorBanner message={eS} onRetry={rS} />}

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {lS
          ? [...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm animate-pulse space-y-3">
                <div className="w-10 h-10 bg-gray-100 rounded-xl" />
                <div className="h-6 w-14 bg-gray-100 rounded" />
                <div className="h-3 w-24 bg-gray-100 rounded" />
              </div>
            ))
          : cards.map((s, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${s.color}`}>{s.icon}</div>
                <p className="text-2xl font-bold text-gray-900">{s.value ?? "—"}</p>
                <p className="text-sm text-gray-500 mt-0.5">{s.label}</p>
                {s.change && <p className="text-xs text-emerald-600 font-medium mt-1">{s.change}</p>}
              </div>
            ))
        }
      </div>

      {/* Événements récents */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-800">Événements récents</h3>
          {lR && <Spinner />}
        </div>
        {eR && <ErrorBanner message={eR} onRetry={rR} />}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-auto">
          <table className="w-full text-sm min-w-[600px]">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {["Événement", "Date", "Participants", "Revenus", "Statut"].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            {lR
              ? <tbody>{[...Array(4)].map((_, i) => <SkeletonRow key={i} cols={5} />)}</tbody>
              : (
                <tbody className="divide-y divide-gray-50">
                  {!recent?.content?.length && (
                    <tr><td colSpan={5} className="px-5 py-10 text-center text-gray-400">Aucun événement</td></tr>
                  )}
                  {recent?.content?.map(e => {
                    const pct = e.capacite > 0
                      ? Math.round((e.participants / e.capacite) * 100)
                      : 0;
                    return (
                      <tr key={e.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-5 py-3.5 font-medium text-gray-900">{e.titre}</td>
                        <td className="px-5 py-3.5 text-gray-500">
                          {e.date ? new Date(e.date).toLocaleDateString("fr-FR") : "—"}
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden w-16">
                              <div className="h-full bg-blue-500 rounded-full" style={{ width: `${pct}%` }} />
                            </div>
                            <span className="text-xs text-gray-500">{e.participants ?? 0}/{e.capacite ?? 0}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 font-semibold text-gray-900">
                          {(e.revenus ?? 0).toLocaleString()} DH
                        </td>
                        <td className="px-5 py-3.5"><StatusBadge status={e.status} /></td>
                      </tr>
                    );
                  })}
                </tbody>
              )
            }
          </table>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// PAGE : MES ÉVÉNEMENTS (CRUD complet)
// GET    /organisateur/events?search=&status=&page=&size=10
// POST   /organisateur/events          → créer
// PUT    /organisateur/events/{id}     → modifier
// DELETE /organisateur/events/{id}     → supprimer
// PATCH  /organisateur/events/{id}/status → { status: "Publié"|"Brouillon" }
// ═══════════════════════════════════════════════════════════════
const EMPTY_FORM = {
  titre: "", date: "", lieu: "", prix: "",
  categorie: "Concert", capacite: "", status: "Brouillon", description: ""
};

const EventsPage = ({ defaultShowForm = false }) => {
  const [pg, setPg]           = useState(0);
  const [search, setSearch]   = useState("");
  const [stFilter, setStFil]  = useState("Tous");
  const [showForm, setShowForm] = useState(defaultShowForm);
  const [editing, setEditing]  = useState(null);
  const [form, setForm]        = useState(EMPTY_FORM);
  const [saving, setSaving]    = useState(false);
  const [formError, setFErr]   = useState("");
  const [deleting, setDeleting]= useState(null);
  const [toggling, setToggling]= useState(null);
  const searchTimer = useRef(null);

  const buildQ = () => {
    const p = new URLSearchParams({ page: pg, size: 10, sort: "createdAt,desc" });
    if (search)             p.set("search", search);
    if (stFilter !== "Tous") p.set("status", stFilter);
    return p.toString();
  };

  const { data, loading, error, refetch } = useApi(
    () => apiFetch(`/organisateur/events?${buildQ()}`),
    [pg, search, stFilter]
  );

  const events     = data?.content || [];
  const totalPages = data?.totalPages || 0;
  const totalEl    = data?.totalElements || 0;

  // ── Créer / Modifier ─────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFErr("");
    try {
      const body = { ...form, prix: +form.prix, capacite: +form.capacite };
      if (editing) {
        await apiFetch(`/organisateur/events/${editing}`, {
          method: "PUT", body: JSON.stringify(body),
        });
      } else {
        await apiFetch("/organisateur/events", {
          method: "POST", body: JSON.stringify(body),
        });
      }
      setShowForm(false);
      setEditing(null);
      setForm(EMPTY_FORM);
      refetch();
    } catch (e) {
      setFErr(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (ev) => {
    setForm({
      titre: ev.titre, date: ev.date?.split("T")[0] || ev.date,
      lieu: ev.lieu, prix: ev.prix, categorie: ev.categorie,
      capacite: ev.capacite, status: ev.status, description: ev.description || ""
    });
    setEditing(ev.id);
    setShowForm(true);
    setFErr("");
  };

  // ── Supprimer ─────────────────────────────────────────────────
  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer cet événement définitivement ?")) return;
    setDeleting(id);
    try {
      await apiFetch(`/organisateur/events/${id}`, { method: "DELETE" });
      refetch();
    } catch (e) { alert(e.message); }
    finally { setDeleting(null); }
  };

  // ── Publier / Dépublier ───────────────────────────────────────
  const toggleStatus = async (ev) => {
    setToggling(ev.id);
    const newStatus = ev.status === "Publié" ? "Brouillon" : "Publié";
    try {
      await apiFetch(`/organisateur/events/${ev.id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: newStatus }),
      });
      refetch();
    } catch (e) { alert(e.message); }
    finally { setToggling(null); }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Mes Événements</h2>
          <p className="text-gray-500 text-sm">
            {loading ? "Chargement…" : `${totalEl} événement${totalEl !== 1 ? "s" : ""}`}
          </p>
        </div>
        <button
          onClick={() => { setShowForm(true); setEditing(null); setForm(EMPTY_FORM); setFErr(""); }}
          className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-4 py-2.5 rounded-xl font-semibold transition text-sm">
          <FaPlus /> Nouvel événement
        </button>
      </div>

      {/* Filtres */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <input type="text" placeholder="Rechercher un événement…"
            onChange={e => {
              clearTimeout(searchTimer.current);
              searchTimer.current = setTimeout(() => { setSearch(e.target.value); setPg(0); }, 400);
            }}
            className="w-full pl-4 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-violet-500"
          />
        </div>
        <select value={stFilter} onChange={e => { setStFil(e.target.value); setPg(0); }}
          className="bg-gray-50 border border-gray-200 px-4 py-2.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-violet-500 text-gray-700">
          {["Tous", "Publié", "Brouillon", "Suspendu"].map(s => <option key={s}>{s}</option>)}
        </select>
      </div>

      {error && <ErrorBanner message={error} onRetry={refetch} />}

      {/* Formulaire Créer / Modifier */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-violet-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-bold text-gray-900">
              {editing ? "Modifier l'événement" : "Créer un événement"}
            </h3>
            <button onClick={() => { setShowForm(false); setEditing(null); }}
              className="text-gray-400 hover:text-gray-600"><FaTimes /></button>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              ["titre",    "Titre",       "text",   "sm:col-span-2"],
              ["date",     "Date",        "date",   ""],
              ["lieu",     "Lieu",        "text",   ""],
              ["prix",     "Prix (DH)",   "number", ""],
              ["capacite", "Capacité",    "number", ""],
            ].map(([name, label, type, cls]) => (
              <div key={name} className={cls}>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</label>
                <input type={type} value={form[name]}
                  onChange={e => setForm(p => ({ ...p, [name]: e.target.value }))}
                  required
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-violet-500 text-sm" />
              </div>
            ))}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Catégorie</label>
              <select value={form.categorie}
                onChange={e => setForm(p => ({ ...p, categorie: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-violet-500 text-sm">
                {["Concert","Festival","Théâtre","Sport","Conférence","Art","Comédie","Cinéma"]
                  .map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Statut</label>
              <select value={form.status}
                onChange={e => setForm(p => ({ ...p, status: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-violet-500 text-sm">
                <option>Brouillon</option>
                <option>Publié</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description</label>
              <textarea value={form.description}
                onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                rows={3}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-violet-500 text-sm resize-none" />
            </div>

            {formError && <p className="sm:col-span-2 text-sm text-red-600 font-medium">{formError}</p>}

            <div className="sm:col-span-2 flex gap-3">
              <button type="submit" disabled={saving}
                className="bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white px-6 py-2.5 rounded-xl font-semibold transition text-sm flex items-center gap-2">
                {saving ? <Spinner /> : <FaSave />}
                {editing ? "Mettre à jour" : "Créer"}
              </button>
              <button type="button"
                onClick={() => { setShowForm(false); setEditing(null); }}
                className="border border-gray-200 px-6 py-2.5 rounded-xl font-semibold text-gray-600 hover:bg-gray-50 transition text-sm">
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tableau */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-auto">
        <table className="w-full text-sm min-w-[750px]">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {["Titre","Date","Lieu","Prix","Remplissage","Statut","Actions"].map(h => (
                <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          {loading
            ? <tbody>{[...Array(5)].map((_, i) => <SkeletonRow key={i} cols={7} />)}</tbody>
            : (
              <tbody className="divide-y divide-gray-50">
                {events.length === 0 && (
                  <tr><td colSpan={7} className="px-5 py-12 text-center text-gray-400">
                    Aucun événement trouvé
                  </td></tr>
                )}
                {events.map(ev => {
                  const pct = ev.capacite > 0
                    ? Math.round(((ev.participants ?? 0) / ev.capacite) * 100)
                    : 0;
                  return (
                    <tr key={ev.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3.5 font-medium text-gray-900 max-w-[200px] truncate">{ev.titre}</td>
                      <td className="px-5 py-3.5 text-gray-500">
                        {ev.date ? new Date(ev.date).toLocaleDateString("fr-FR") : "—"}
                      </td>
                      <td className="px-5 py-3.5 text-gray-500">{ev.lieu}</td>
                      <td className="px-5 py-3.5 font-semibold text-gray-900">{ev.prix} DH</td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden w-16">
                            <div className="h-full bg-violet-500 rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-xs text-gray-500">{pct}%</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5"><StatusBadge status={ev.status} /></td>
                      <td className="px-5 py-3.5">
                        <div className="flex gap-1">
                          {/* Publier / Dépublier */}
                          <button
                            onClick={() => toggleStatus(ev)}
                            disabled={toggling === ev.id || ev.status === "Suspendu"}
                            title={ev.status === "Publié" ? "Dépublier" : "Publier"}
                            className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition disabled:opacity-40">
                            {toggling === ev.id ? <Spinner /> : <FaCheck size={12} />}
                          </button>
                          {/* Modifier */}
                          <button onClick={() => handleEdit(ev)}
                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition">
                            <FaEdit size={12} />
                          </button>
                          {/* Supprimer */}
                          <button
                            onClick={() => handleDelete(ev.id)}
                            disabled={deleting === ev.id}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-40">
                            {deleting === ev.id ? <Spinner /> : <FaTrash size={12} />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            )
          }
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>Page {pg + 1} / {totalPages}</span>
          <div className="flex gap-2">
            <button disabled={pg === 0} onClick={() => setPg(p => p - 1)}
              className="px-3 py-1.5 border border-gray-200 rounded-xl disabled:opacity-40 hover:bg-gray-50">← Précédent</button>
            <button disabled={pg >= totalPages - 1} onClick={() => setPg(p => p + 1)}
              className="px-3 py-1.5 border border-gray-200 rounded-xl disabled:opacity-40 hover:bg-gray-50">Suivant →</button>
          </div>
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// PAGE : RÉSERVATIONS
// GET /organisateur/bookings?eventId=&statut=&page=&size=10
// GET /organisateur/bookings/export/pdf   → blob PDF
// GET /organisateur/bookings/export/excel → blob Excel
// ═══════════════════════════════════════════════════════════════
const BookingsPage = () => {
  const [pg, setPg]           = useState(0);
  const [eventFilter, setEv]  = useState("");
  const [stFilter, setSt]     = useState("Tous");
  const [exporting, setExp]   = useState(null); // "pdf" | "excel"

  // Charger la liste des événements de l'organisateur pour le filtre
  const { data: eventsData } = useApi(() => apiFetch("/organisateur/events?size=100&status=Publié"));
  const myEvents = eventsData?.content || [];

  const buildQ = () => {
    const p = new URLSearchParams({ page: pg, size: 10, sort: "createdAt,desc" });
    if (eventFilter)            p.set("eventId", eventFilter);
    if (stFilter !== "Tous")    p.set("statut", stFilter);
    return p.toString();
  };

  const { data, loading, error, refetch } = useApi(
    () => apiFetch(`/organisateur/reservations?${buildQ()}`),
    [pg, eventFilter, stFilter]
  );

  const bookings   = data?.content || [];
  const totalPages = data?.totalPages || 0;
  const totalEl    = data?.totalElements || 0;
  const totalRevenu = data?.totalRevenu || 0;

  const exportFile = async (type) => {
    setExp(type);
    try {
      const q = new URLSearchParams();
      if (eventFilter) q.set("eventId", eventFilter);
      if (stFilter !== "Tous") q.set("statut", stFilter);

      const blob = await apiFetchBlob(`/organisateur/reservations/export/${type}?${q}`);
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href     = url;
      a.download = `reservations.${type === "pdf" ? "pdf" : "xlsx"}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) { alert(e.message); }
    finally { setExp(null); }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Réservations</h2>
          <p className="text-gray-500 text-sm">
            {loading ? "Chargement…"
              : `${totalEl} réservation${totalEl !== 1 ? "s" : ""} · Revenu : ${totalRevenu.toLocaleString()} DH`}
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => exportFile("pdf")} disabled={exporting === "pdf"}
            className="flex items-center gap-2 border border-gray-200 px-4 py-2 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition disabled:opacity-50">
            {exporting === "pdf" ? <Spinner /> : <FaFilePdf size={13} />} Export PDF
          </button>
          <button onClick={() => exportFile("excel")} disabled={exporting === "excel"}
            className="flex items-center gap-2 border border-gray-200 px-4 py-2 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition disabled:opacity-50">
            {exporting === "excel" ? <Spinner /> : <FaFileExcel size={13} />} Export Excel
          </button>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row gap-3">
        <select value={eventFilter} onChange={e => { setEv(e.target.value); setPg(0); }}
          className="flex-1 bg-gray-50 border border-gray-200 px-4 py-2.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-violet-500 text-gray-700">
          <option value="">Tous les événements</option>
          {myEvents.map(e => (
            <option key={e.id} value={e.id}>{e.titre}</option>
          ))}
        </select>
        <select value={stFilter} onChange={e => { setSt(e.target.value); setPg(0); }}
          className="bg-gray-50 border border-gray-200 px-4 py-2.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-violet-500 text-gray-700">
          {["Tous", "Confirmé", "En attente", "Annulé"].map(s => <option key={s}>{s}</option>)}
        </select>
      </div>

      {error && <ErrorBanner message={error} onRetry={refetch} />}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-auto">
        <table className="w-full text-sm min-w-[700px]">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {["Client","Email","Événement","Date","Billets","Total","Statut"].map(h => (
                <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          {loading
            ? <tbody>{[...Array(5)].map((_, i) => <SkeletonRow key={i} cols={7} />)}</tbody>
            : (
              <tbody className="divide-y divide-gray-50">
                {bookings.length === 0 && (
                  <tr><td colSpan={7} className="px-5 py-10 text-center text-gray-400">
                    Aucune réservation
                  </td></tr>
                )}
                {bookings.map(b => (
                  <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3.5 font-semibold text-gray-900">{b.clientNom || b.client}</td>
                    <td className="px-5 py-3.5 text-gray-400 text-xs">{b.clientEmail || b.email}</td>
                    <td className="px-5 py-3.5 text-gray-700 max-w-[160px] truncate">{b.eventTitre || b.event}</td>
                    <td className="px-5 py-3.5 text-gray-500">
                      {b.createdAt ? new Date(b.createdAt).toLocaleDateString("fr-FR") : b.date}
                    </td>
                    <td className="px-5 py-3.5 text-center font-medium text-gray-800">{b.nbBillets ?? b.billets}</td>
                    <td className="px-5 py-3.5 font-bold text-gray-900">{(b.total ?? 0).toLocaleString()} DH</td>
                    <td className="px-5 py-3.5"><StatusBadge status={b.statut} /></td>
                  </tr>
                ))}
              </tbody>
            )
          }
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>Page {pg + 1} / {totalPages}</span>
          <div className="flex gap-2">
            <button disabled={pg === 0} onClick={() => setPg(p => p - 1)}
              className="px-3 py-1.5 border border-gray-200 rounded-xl disabled:opacity-40 hover:bg-gray-50">← Précédent</button>
            <button disabled={pg >= totalPages - 1} onClick={() => setPg(p => p + 1)}
              className="px-3 py-1.5 border border-gray-200 rounded-xl disabled:opacity-40 hover:bg-gray-50">Suivant →</button>
          </div>
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// PAGE : STATISTIQUES
// GET /organisateur/statistics
//   → { totalRevenue, totalParticipants, avgFillRate, activeEvents,
//       revenueByEvent: [{titre, revenus}],
//       fillRateByEvent: [{titre, participants, capacite}],
//       bookingsByMonth: [{month, count}] }
// ═══════════════════════════════════════════════════════════════
const StatisticsPage = () => {
  const { data, loading, error, refetch } = useApi(
    () => apiFetch("/organisateur/statistiques")
  );

  const maxRev  = data?.revenueByEvent
    ? Math.max(...data.revenueByEvent.map(e => e.revenus), 1)
    : 1;
  const maxBook = data?.bookingsByMonth
    ? Math.max(...data.bookingsByMonth.map(m => m.count), 1)
    : 1;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Statistiques</h2>
          <p className="text-gray-500 text-sm">Analyse de vos performances</p>
        </div>
        <button onClick={refetch}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-violet-600 border border-gray-200 px-3 py-2 rounded-xl hover:bg-violet-50 transition">
          <FaSync className={loading ? "animate-spin" : ""} size={12} />
          Actualiser
        </button>
      </div>

      {error && <ErrorBanner message={error} onRetry={refetch} />}
      {loading && <div className="flex justify-center py-12"><Spinner size="lg" /></div>}

      {data && (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Revenu total",          value: `${(data.totalRevenue || 0).toLocaleString()} DH` },
              { label: "Total participants",     value: (data.totalParticipants || 0).toLocaleString() },
              { label: "Taux moyen remplissage", value: `${Math.round(data.avgFillRate || 0)}%` },
              { label: "Événements actifs",      value: data.activeEvents ?? "—" },
            ].map((s, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">{s.label}</p>
                <p className="text-2xl font-bold text-gray-900">{s.value}</p>
              </div>
            ))}
          </div>

          {/* Revenus par événement */}
          {data.revenueByEvent?.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <h3 className="font-semibold text-gray-800 mb-6">Revenus par événement</h3>
              <div className="space-y-4">
                {[...data.revenueByEvent]
                  .sort((a, b) => b.revenus - a.revenus)
                  .map((e, i) => (
                    <div key={i}>
                      <div className="flex justify-between text-sm mb-1.5">
                        <span className="font-medium text-gray-700 truncate mr-4">{e.titre}</span>
                        <span className="font-bold text-gray-900 flex-shrink-0">
                          {(e.revenus || 0).toLocaleString()} DH
                        </span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full transition-all"
                          style={{ width: `${Math.round((e.revenus / maxRev) * 100)}%` }} />
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Taux de remplissage */}
          {data.fillRateByEvent?.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <h3 className="font-semibold text-gray-800 mb-6">Taux de remplissage</h3>
              <div className="space-y-4">
                {data.fillRateByEvent.map((e, i) => {
                  const pct = e.capacite > 0
                    ? Math.round(((e.participants ?? 0) / e.capacite) * 100)
                    : 0;
                  return (
                    <div key={i}>
                      <div className="flex justify-between text-sm mb-1.5">
                        <span className="font-medium text-gray-700 truncate mr-4">{e.titre}</span>
                        <span className="text-xs text-gray-400 mr-2">{e.participants}/{e.capacite}</span>
                        <span className="font-bold text-gray-900 flex-shrink-0">{pct}%</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all ${
                          pct >= 80 ? "bg-emerald-500" : pct >= 50 ? "bg-amber-400" : "bg-blue-400"
                        }`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Réservations par mois */}
          {data.bookingsByMonth?.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <h3 className="font-semibold text-gray-800 mb-6">Réservations par mois</h3>
              <div className="flex items-end gap-2 h-32">
                {data.bookingsByMonth.map((m, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-xs text-gray-500 font-medium">{m.count}</span>
                    <div className="w-full bg-violet-100 rounded-t-lg transition-all hover:bg-violet-200"
                      style={{ height: `${Math.round((m.count / maxBook) * 100)}%`, minHeight: "4px" }} />
                    <span className="text-[10px] text-gray-400">{m.month}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// PAGE : PROFIL ORGANISATEUR
// GET   /organisateur/profile
//   → { nom, email, telephone, ville, organisationNom, siret, avatar, verified, createdAt }
// PUT   /organisateur/profile → body: { nom, email, telephone, ville, organisationNom, siret }
// PATCH /organisateur/profile/password → body: { currentPassword, newPassword }
// ═══════════════════════════════════════════════════════════════
const OrgProfilePage = () => {
  const { user } = useAuth();
  const { data: profile, loading, error, refetch } = useApi(
    () => apiFetch("/organisateur/profile")
  );

  const [form,      setForm]      = useState(null);
  const [pwdForm,   setPwd]       = useState({ currentPassword: "", newPassword: "", confirm: "" });
  const [saving,    setSaving]    = useState(false);
  const [savingPwd, setSavingPwd] = useState(false);
  const [success,   setSuccess]   = useState("");
  const [formErr,   setFormErr]   = useState("");

  useEffect(() => {
    if (profile) {
      setForm({
        nom:             profile.nom || "",
        prenom:             profile.prnom || "",
        email:           profile.email || "",
        telephone:       profile.telephone || "",
        ville:           profile.ville || "",
        organisationNom: profile.organisationNom || "",
        siret:           profile.siret || "",
      });
    }
  }, [profile]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true); setFormErr(""); setSuccess("");
    try {
      await apiFetch("/organisateur/profile", {
        method: "PUT", body: JSON.stringify(form),
      });
      setSuccess("Profil mis à jour avec succès ✓");
      refetch();
    } catch (e) { setFormErr(e.message); }
    finally { setSaving(false); }
  };

  const handlePwd = async (e) => {
    e.preventDefault();
    if (pwdForm.newPassword !== pwdForm.confirm) {
      setFormErr("Les mots de passe ne correspondent pas."); return;
    }
    setSavingPwd(true); setFormErr(""); setSuccess("");
    try {
      await apiFetch("/organisateur/profile/password", {
        method: "PATCH",
        body: JSON.stringify({
          currentPassword: pwdForm.currentPassword,
          newPassword:     pwdForm.newPassword,
        }),
      });
      setSuccess("Mot de passe modifié ✓");
      setPwd({ currentPassword: "", newPassword: "", confirm: "" });
    } catch (e) { setFormErr(e.message); }
    finally { setSavingPwd(false); }
  };

  if (loading) return (
    <div className="max-w-xl space-y-4">
      <div className="h-8 w-48 bg-gray-100 rounded animate-pulse" />
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm animate-pulse space-y-4">
        <div className="flex items-center gap-5 pb-6 border-b border-gray-100">
          <div className="w-20 h-20 rounded-2xl bg-gray-100" />
          <div className="space-y-2">
            <div className="h-5 w-32 bg-gray-100 rounded" />
            <div className="h-3 w-24 bg-gray-100 rounded" />
          </div>
        </div>
        {[...Array(5)].map((_, i) => <div key={i} className="h-10 bg-gray-100 rounded-xl" />)}
      </div>
    </div>
  );

  return (
    <div className="max-w-xl space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Profil Organisateur</h2>
      {error && <ErrorBanner message={error} onRetry={refetch} />}

      {/* Infos principales */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <div className="flex items-center gap-5 mb-6 pb-6 border-b border-gray-100">
          <img
            src={profile?.avatar ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(form?.organisationNom || "O")}&size=80&background=6366f1&color=fff`}
            alt="avatar"
            className="w-20 h-20 rounded-2xl object-cover"
          />
          <div>
            <h3 className="text-xl font-bold text-gray-900">{form?.organisationNom || "—"}</h3>
            <p className="text-gray-500 text-sm">
              Organisateur depuis{" "}
              {profile?.createdAt
                ? new Date(profile.createdAt).toLocaleDateString("fr-FR", { month: "long", year: "numeric" })
                : "—"}
            </p>
            <span className={`mt-1 inline-block text-xs font-semibold px-2.5 py-1 rounded-full ${
              profile?.verified
                ? "bg-violet-50 text-violet-600"
                : "bg-amber-50 text-amber-600"
            }`}>
              {profile?.verified ? "✓ Vérifié" : "⏳ En attente de vérification"}
            </span>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          {[
            ["organisationNom", "Nom de l'organisation", "text"],
            ["nom",             "Nom du responsable",    "text"],
            ["prenom",             "Prénom du responsable",    "text"],
            ["email",           "Email",                 "email"],
            ["telephone",       "Téléphone",             "tel"],
            ["ville",           "Ville",                 "text"],
            ["siret",           "SIRET / RC",            "text"],
          ].map(([key, label, type]) => (
            <div key={key}>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</label>
              <input type={type} value={form?.[key] || ""}
                onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none text-sm" />
            </div>
          ))}

          {formErr   && <p className="text-sm text-red-600 font-medium">{formErr}</p>}
          {success   && <p className="text-sm text-emerald-600 font-medium">{success}</p>}

          <button type="submit" disabled={saving}
            className="w-full bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white py-2.5 rounded-xl font-semibold transition flex items-center justify-center gap-2">
            {saving ? <Spinner /> : <FaSave />}
            {saving ? "Sauvegarde…" : "Sauvegarder les modifications"}
          </button>
        </form>
      </div>

      {/* Changer mot de passe */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <h3 className="font-bold text-gray-800 mb-4">Changer le mot de passe</h3>
        <form onSubmit={handlePwd} className="space-y-4">
          {[
            ["currentPassword", "Mot de passe actuel"],
            ["newPassword",     "Nouveau mot de passe"],
            ["confirm",         "Confirmer le nouveau"],
          ].map(([key, label]) => (
            <div key={key}>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</label>
              <input type="password" value={pwdForm[key]}
                onChange={e => setPwd(p => ({ ...p, [key]: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 outline-none text-sm" />
            </div>
          ))}
          <button type="submit" disabled={savingPwd}
            className="w-full border border-gray-200 hover:bg-gray-50 disabled:opacity-60 text-gray-700 py-2.5 rounded-xl font-semibold transition flex items-center justify-center gap-2">
            {savingPwd ? <Spinner /> : null}
            {savingPwd ? "Modification…" : "Modifier le mot de passe"}
          </button>
        </form>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// PAGE : PROMOTIONS
// GET    /organisateur/promotions?page=&size=10
// POST   /organisateur/promotions
// PUT    /organisateur/promotions/{id}
// PATCH  /organisateur/promotions/{id}/toggle  → activer/désactiver
// DELETE /organisateur/promotions/{id}
// ═══════════════════════════════════════════════════════════════
const EMPTY_PROMO = {
  code: "", description: "", type: "POURCENTAGE",
  valeur: "", eventId: "", dateDebut: "", dateFin: "",
  maxUtilisations: "", montantMinimum: "",
};

const PromotionsPage = () => {
  const [pg, setPg]             = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing]   = useState(null);
  const [form, setForm]         = useState(EMPTY_PROMO);
  const [saving, setSaving]     = useState(false);
  const [toggling, setToggling] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [formError, setFErr]    = useState("");
  const [success, setSuccess]   = useState("");

  // Liste des promos paginée
  const { data, loading, error, refetch } = useApi(
    () => apiFetch(`/organisateur/promotions?page=${pg}&size=10&sort=createdAt,desc`),
    [pg]
  );

  // Liste des events approuvés pour le select
  const { data: eventsData } = useApi(
    () => apiFetch("/organisateur/events?status=Publié&size=100")
  );
  const myEvents = eventsData?.content || [];

  const promos     = data?.content || [];
  const totalPages = data?.totalPages || 0;
  const totalEl    = data?.totalElements || 0;

  // ── Créer / Modifier ─────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true); setFErr(""); setSuccess("");
    try {
      const body = {
        ...form,
        code:             form.code.toUpperCase(),
        valeur:           +form.valeur,
        eventId:          +form.eventId,
        maxUtilisations:  form.maxUtilisations ? +form.maxUtilisations : null,
        montantMinimum:   form.montantMinimum  ? +form.montantMinimum  : null,
        dateDebut:        form.dateDebut || null,
        dateFin:          form.dateFin   || null,
      };
      if (editing) {
        await apiFetch(`/organisateur/promotions/${editing}`, {
          method: "PUT", body: JSON.stringify(body),
        });
        setSuccess("Promotion modifiée avec succès ✓");
      } else {
        await apiFetch("/organisateur/promotions", {
          method: "POST", body: JSON.stringify(body),
        });
        setSuccess("Promotion créée avec succès ✓");
      }
      setShowForm(false); setEditing(null); setForm(EMPTY_PROMO);
      refetch();
    } catch (e) { setFErr(e.message); }
    finally { setSaving(false); }
  };

  const handleEdit = (p) => {
    setForm({
      code:            p.code,
      description:     p.description || "",
      type:            p.type,
      valeur:          p.valeur,
      eventId:         p.eventId,
      dateDebut:       p.dateDebut ? p.dateDebut.split("T")[0] : "",
      dateFin:         p.dateFin   ? p.dateFin.split("T")[0]   : "",
      maxUtilisations: p.maxUtilisations ?? "",
      montantMinimum:  p.montantMinimum  ?? "",
    });
    setEditing(p.id); setShowForm(true); setFErr(""); setSuccess("");
  };

  // ── Activer / Désactiver ──────────────────────────────────────
  const handleToggle = async (id) => {
    setToggling(id);
    try {
      await apiFetch(`/organisateur/promotions/${id}/toggle`, { method: "PATCH" });
      refetch();
    } catch (e) { alert(e.message); }
    finally { setToggling(null); }
  };

  // ── Supprimer ─────────────────────────────────────────────────
  const handleDelete = async (id, code) => {
    if (!window.confirm(`Supprimer la promotion "${code}" ?`)) return;
    setDeleting(id);
    try {
      await apiFetch(`/organisateur/promotions/${id}`, { method: "DELETE" });
      refetch();
    } catch (e) { alert(e.message); }
    finally { setDeleting(null); }
  };

  // ── Helpers UI ────────────────────────────────────────────────
  const formatReduction = (p) =>
    p.type === "POURCENTAGE"
      ? `${p.valeur}%`
      : `${p.valeur} DH`;

  const getStatusInfo = (p) => {
    if (!p.active) return { label: "Désactivée", cls: "bg-gray-100 text-gray-500" };
    if (!p.valide) return { label: "Expirée",    cls: "bg-red-100 text-red-600"   };
    return              { label: "Active",       cls: "bg-emerald-100 text-emerald-700" };
  };

  const statsCards = [
    { label: "Total promos",    value: totalEl,
      icon: <FaTag />,     color: "bg-violet-50 text-violet-600" },
    { label: "Actives",
      value: promos.filter(p => p.active && p.valide).length,
      icon: <FaCheck />,   color: "bg-emerald-50 text-emerald-600" },
    { label: "Utilisations",
      value: promos.reduce((s, p) => s + (p.nbUtilisations || 0), 0),
      icon: <FaGift />,    color: "bg-blue-50 text-blue-600" },
    { label: "Expirées",
      value: promos.filter(p => !p.valide).length,
      icon: <FaClock />,   color: "bg-amber-50 text-amber-600" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Promotions</h2>
          <p className="text-gray-500 text-sm">
            {loading ? "Chargement…"
              : `${totalEl} promotion${totalEl !== 1 ? "s" : ""} — visible uniquement par les clients connectés`}
          </p>
        </div>
        <button
          onClick={() => { setShowForm(true); setEditing(null); setForm(EMPTY_PROMO); setFErr(""); setSuccess(""); }}
          className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-4 py-2.5 rounded-xl font-semibold transition text-sm">
          <FaPlus /> Nouvelle promotion
        </button>
      </div>

      {/* Info banner */}
      <div className="bg-violet-50 border border-violet-200 rounded-2xl p-4 flex items-start gap-3">
        <FaGift className="text-violet-500 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-sm font-semibold text-violet-800">Visibilité des promotions</p>
          <p className="text-xs text-violet-600 mt-0.5">
            Les codes promo ne sont visibles et utilisables que par les clients connectés.
            Les visiteurs non inscrits n'y ont pas accès.
          </p>
        </div>
      </div>

      {/* Stats mini-cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((s, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${s.color}`}>{s.icon}</div>
            <div>
              <p className="text-xl font-bold text-gray-900">{s.value}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {error && <ErrorBanner message={error} onRetry={refetch} />}
      {success && !showForm && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 text-sm text-emerald-700 font-medium">
          ✓ {success}
        </div>
      )}

      {/* Formulaire créer / modifier */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-violet-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <FaTag className="text-violet-500" />
              {editing ? "Modifier la promotion" : "Créer une promotion"}
            </h3>
            <button onClick={() => { setShowForm(false); setEditing(null); }}
              className="text-gray-400 hover:text-gray-600">
              <FaTimes />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            {/* Code */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Code promo <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.code}
                onChange={e => setForm(p => ({ ...p, code: e.target.value.toUpperCase() }))}
                placeholder="ex: ROCK20"
                required
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-violet-500 text-sm font-mono uppercase"
              />
              <p className="text-xs text-gray-400 mt-1">Majuscules, chiffres, - et _ uniquement</p>
            </div>

            {/* Événement lié */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Événement <span className="text-red-500">*</span>
              </label>
              <select
                value={form.eventId}
                onChange={e => setForm(p => ({ ...p, eventId: e.target.value }))}
                required
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-violet-500 text-sm">
                <option value="">— Choisir un événement —</option>
                {myEvents.map(e => (
                  <option key={e.id} value={e.id}>{e.titre}</option>
                ))}
              </select>
              {myEvents.length === 0 && (
                <p className="text-xs text-amber-600 mt-1">
                  Aucun événement approuvé disponible
                </p>
              )}
            </div>

            {/* Description */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Description
              </label>
              <input
                type="text"
                value={form.description}
                onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                placeholder="ex: Réduction spéciale fans de rock"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-violet-500 text-sm"
              />
            </div>

            {/* Type de réduction */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Type de réduction <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-3">
                {[
                  { val: "POURCENTAGE", label: "Pourcentage (%)", icon: <FaPercent size={12} /> },
                  { val: "MONTANT_FIXE", label: "Montant fixe (DH)", icon: <FaDollarSign size={12} /> },
                ].map(t => (
                  <button
                    key={t.val}
                    type="button"
                    onClick={() => setForm(p => ({ ...p, type: t.val }))}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium border transition ${
                      form.type === t.val
                        ? "bg-violet-600 text-white border-violet-600"
                        : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                    }`}>
                    {t.icon} {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Valeur */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Valeur{" "}
                <span className="text-gray-400 font-normal">
                  {form.type === "POURCENTAGE" ? "(1–100%)" : "(DH)"}
                </span>
                <span className="text-red-500"> *</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={form.valeur}
                  onChange={e => setForm(p => ({ ...p, valeur: e.target.value }))}
                  min="1"
                  max={form.type === "POURCENTAGE" ? "100" : undefined}
                  required
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-violet-500 text-sm pr-12"
                />
                <span className="absolute right-3 top-3 text-gray-400 text-sm font-medium">
                  {form.type === "POURCENTAGE" ? "%" : "DH"}
                </span>
              </div>
            </div>

            {/* Date début */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Date de début
              </label>
              <input
                type="date"
                value={form.dateDebut}
                onChange={e => setForm(p => ({ ...p, dateDebut: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-violet-500 text-sm"
              />
            </div>

            {/* Date fin */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Date de fin
              </label>
              <input
                type="date"
                value={form.dateFin}
                onChange={e => setForm(p => ({ ...p, dateFin: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-violet-500 text-sm"
              />
            </div>

            {/* Max utilisations */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Nb max d'utilisations
                <span className="text-gray-400 font-normal ml-1">(vide = illimité)</span>
              </label>
              <input
                type="number"
                value={form.maxUtilisations}
                onChange={e => setForm(p => ({ ...p, maxUtilisations: e.target.value }))}
                min="1"
                placeholder="ex: 100"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-violet-500 text-sm"
              />
            </div>

            {/* Montant minimum */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Montant minimum (DH)
                <span className="text-gray-400 font-normal ml-1">(vide = aucun)</span>
              </label>
              <input
                type="number"
                value={form.montantMinimum}
                onChange={e => setForm(p => ({ ...p, montantMinimum: e.target.value }))}
                min="0"
                placeholder="ex: 100"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-violet-500 text-sm"
              />
            </div>

            {formError && (
              <div className="sm:col-span-2 bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700 font-medium">
                {formError}
              </div>
            )}

            <div className="sm:col-span-2 flex gap-3 pt-2">
              <button type="submit" disabled={saving}
                className="bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white px-6 py-2.5 rounded-xl font-semibold transition text-sm flex items-center gap-2">
                {saving ? <Spinner /> : <FaSave />}
                {editing ? "Mettre à jour" : "Créer la promotion"}
              </button>
              <button type="button"
                onClick={() => { setShowForm(false); setEditing(null); }}
                className="border border-gray-200 px-6 py-2.5 rounded-xl font-semibold text-gray-600 hover:bg-gray-50 transition text-sm">
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tableau des promotions */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-auto">
        <table className="w-full text-sm min-w-[800px]">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {["Code", "Événement", "Réduction", "Validité", "Utilisations", "Statut", "Actions"].map(h => (
                <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          {loading
            ? <tbody>{[...Array(4)].map((_, i) => <SkeletonRow key={i} cols={7} />)}</tbody>
            : (
              <tbody className="divide-y divide-gray-50">
                {promos.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-5 py-12 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <FaTag className="text-gray-300 text-3xl" />
                        <p className="text-gray-400 font-medium">Aucune promotion créée</p>
                        <button
                          onClick={() => { setShowForm(true); setEditing(null); setForm(EMPTY_PROMO); }}
                          className="text-violet-600 hover:underline text-sm font-medium">
                          Créer votre première promotion →
                        </button>
                      </div>
                    </td>
                  </tr>
                )}

                {promos.map(p => {
                  const statusInfo = getStatusInfo(p);
                  return (
                    <tr key={p.id} className="hover:bg-gray-50 transition-colors">

                      {/* Code */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-violet-700 bg-violet-50 px-2.5 py-1 rounded-lg text-sm tracking-wide">
                            {p.code}
                          </span>
                        </div>
                        {p.description && (
                          <p className="text-xs text-gray-400 mt-1 max-w-[160px] truncate">
                            {p.description}
                          </p>
                        )}
                      </td>

                      {/* Événement */}
                      <td className="px-5 py-4">
                        <p className="font-medium text-gray-900 max-w-[150px] truncate">
                          {p.eventTitre}
                        </p>
                      </td>

                      {/* Réduction */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5">
                          <span className={`p-1.5 rounded-lg ${
                            p.type === "POURCENTAGE"
                              ? "bg-blue-50 text-blue-600"
                              : "bg-emerald-50 text-emerald-600"
                          }`}>
                            {p.type === "POURCENTAGE"
                              ? <FaPercent size={10} />
                              : <FaDollarSign size={10} />}
                          </span>
                          <span className="font-bold text-gray-900 text-base">
                            {formatReduction(p)}
                          </span>
                        </div>
                        {p.montantMinimum && (
                          <p className="text-xs text-gray-400 mt-1">
                            Min : {p.montantMinimum} DH
                          </p>
                        )}
                      </td>

                      {/* Validité */}
                      <td className="px-5 py-4 text-xs text-gray-500">
                        {p.dateDebut || p.dateFin ? (
                          <div className="space-y-0.5">
                            {p.dateDebut && (
                              <p>Du {new Date(p.dateDebut).toLocaleDateString("fr-FR")}</p>
                            )}
                            {p.dateFin && (
                              <p>Au {new Date(p.dateFin).toLocaleDateString("fr-FR")}</p>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400 italic">Illimitée</span>
                        )}
                      </td>

                      {/* Utilisations */}
                      <td className="px-5 py-4">
                        <div className="text-center">
                          <span className="font-bold text-gray-900">
                            {p.nbUtilisations}
                          </span>
                          <span className="text-gray-400 text-xs">
                            {p.maxUtilisations ? ` / ${p.maxUtilisations}` : " / ∞"}
                          </span>
                        </div>
                        {p.maxUtilisations && (
                          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mt-1.5 w-16 mx-auto">
                            <div
                              className="h-full bg-violet-500 rounded-full"
                              style={{ width: `${Math.round((p.nbUtilisations / p.maxUtilisations) * 100)}%` }}
                            />
                          </div>
                        )}
                      </td>

                      {/* Statut */}
                      <td className="px-5 py-4">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusInfo.cls}`}>
                          {statusInfo.label}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4">
                        <div className="flex gap-1">
                          {/* Toggle activer/désactiver */}
                          <button
                            onClick={() => handleToggle(p.id)}
                            disabled={toggling === p.id}
                            title={p.active ? "Désactiver" : "Activer"}
                            className={`p-1.5 rounded-lg transition disabled:opacity-40 ${
                              p.active
                                ? "text-emerald-600 bg-emerald-50 hover:bg-emerald-100"
                                : "text-gray-400 bg-gray-100 hover:bg-gray-200"
                            }`}>
                            {toggling === p.id
                              ? <Spinner />
                              : p.active ? <FaToggleOn size={14} /> : <FaToggleOff size={14} />}
                          </button>

                          {/* Modifier */}
                          <button
                            onClick={() => handleEdit(p)}
                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition">
                            <FaEdit size={12} />
                          </button>

                          {/* Supprimer */}
                          <button
                            onClick={() => handleDelete(p.id, p.code)}
                            disabled={deleting === p.id}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-40">
                            {deleting === p.id ? <Spinner /> : <FaTrash size={12} />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            )
          }
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>Page {pg + 1} / {totalPages}</span>
          <div className="flex gap-2">
            <button disabled={pg === 0} onClick={() => setPg(p => p - 1)}
              className="px-3 py-1.5 border border-gray-200 rounded-xl disabled:opacity-40 hover:bg-gray-50">
              ← Précédent
            </button>
            <button disabled={pg >= totalPages - 1} onClick={() => setPg(p => p + 1)}
              className="px-3 py-1.5 border border-gray-200 rounded-xl disabled:opacity-40 hover:bg-gray-50">
              Suivant →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// MAIN LAYOUT
// ═══════════════════════════════════════════════════════════════
export default function OrganisateurDashboard() {
  const { user } = useAuth()
  const [page,        setPage]        = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Badge notifications non lues
  const { data: notifData } = useApi(
    () => apiFetch("/organisateur/notifications/nonlu-count")
  );
  const unreadCount = notifData?.count || 0;

  const menu = [
    { id: "dashboard",   label: "Dashboard",         icon: <FaHome /> },
    { id: "events",      label: "Mes événements",     icon: <FaCalendarAlt /> },
    { id: "add-event",   label: "Ajouter événement",  icon: <FaPlus /> },
    { id: "bookings",    label: "Réservations",       icon: <FaTicketAlt /> },
    { id: "promotions",  label: "Promotions",         icon: <FaTag /> },
    { id: "statistics",  label: "Statistiques",       icon: <FaChartBar /> },
    { id: "profile",     label: "Profil",             icon: <FaUser /> },
  ];

  const pages = {
    dashboard:    <OrgDashboard />,
    events:       <EventsPage />,
    "add-event":  <EventsPage defaultShowForm={true} />,
    bookings:     <BookingsPage />,
    promotions:   <PromotionsPage />,
    statistics:   <StatisticsPage />,
    profile:      <OrgProfilePage />,
  };

  const SidebarContent = () => {
    const { user, logout } = useAuth();
    return (
      <>
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            {/* <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center">
              <FaCalendarAlt className="text-white text-sm" />
            </div> */}
            <div className="w-16 h-16 bg-white/40 rounded-xl flex items-center justify-center backdrop-blur-sm shadow-lg">
                        <img src={rovistaLogo} alt="Rovista" className="h-14 w-14" />
                      </div>
            <div>
              <p className="font-bold text-gray-900 text-sm">AtlasEvents</p>
              <p className="text-xs text-gray-500">Espace Organisateur</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {menu.map(item => (
            <button key={item.id}
              onClick={() => { setPage(item.id); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                page === item.id
                  ? "bg-violet-600 text-white shadow-sm"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`}>
              <span className="text-base">{item.icon}</span>
              {item.label}
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

        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3 px-3 py-2">
            <img
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.nom || "O")}&size=36&background=6366f1&color=fff`}
              alt="avatar"
              className="w-9 h-9 rounded-xl"
            />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-gray-900 truncate">{user?.nom || "Mon organisation"}</p>
              <p className="text-xs text-gray-500">{user?.role || "Organisateur"}</p>
            </div>
            <button
              onClick={logout}
              title="Déconnexion"
              className="text-gray-400 hover:text-red-500 transition-colors flex-shrink-0">
              <FaSignOutAlt size={16} />
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex w-64 bg-white border-r border-gray-100 flex-col shadow-sm flex-shrink-0">
        <SidebarContent />
      </aside>

      {/* Sidebar Mobile */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
          <aside className="relative w-64 bg-white flex flex-col shadow-xl">
            <button onClick={() => setSidebarOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
              <FaTimes size={20} />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-gray-100 px-6 py-3.5 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-gray-500 hover:text-gray-700">
              <FaBars size={20} />
            </button>
            <h1 className="font-semibold text-gray-800">
              {menu.find(m => m.id === page)?.label || "Dashboard"}
            </h1>
          </div>
          <div className="flex items-center gap-3">

            {/* ← BOUTONS ICI à droite */}
            <Link to="/" className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-blue-600 border border-gray-200 hover:border-blue-300 px-3 py-1.5 rounded-xl transition">
              <FaHome size={12} /> Accueil
            </Link>
            <Link to="/events#list" className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-blue-600 border border-gray-200 hover:border-blue-300 px-3 py-1.5 rounded-xl transition">
              <FaCalendarAlt size={12} /> Événements
            </Link>
            <button className="relative p-2 text-gray-500 hover:text-violet-600 hover:bg-violet-50 rounded-xl transition">
              <FaBell size={18} />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>
            <img
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.nom || "O")}&size=36&background=6366f1&color=fff`}
              alt="avatar"
              className="w-9 h-9 rounded-xl cursor-pointer"
              onClick={() => setPage("profile")}
            />
          </div>
        </header>

        <main className="flex-1 p-6 overflow-auto">
          {pages[page]}
        </main>
      </div>
    </div>
  );
}