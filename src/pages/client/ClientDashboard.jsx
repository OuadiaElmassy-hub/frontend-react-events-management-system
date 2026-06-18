import { useState, useEffect, useCallback, useRef } from "react";
import {
  FaHome, FaTicketAlt, FaHeart, FaStar, FaUser, FaCog,
  FaBars, FaTimes, FaCalendarAlt, FaMapMarkerAlt, FaEuroSign,
  FaDownload, FaEye, FaBell, FaSearch, FaSpinner, FaSync,
  FaExclamationTriangle, FaCheck, FaSave, FaSignOutAlt
} from "react-icons/fa";

import { useAuth } from "../../context/AuthContext";
import apiFetch from "../../utils/fetchFn";
import { HashLink as Link } from 'react-router-hash-link';
import rovistaLogo from '../../assets/logos/rovista.svg'



// ─────────────────────────────────────────────────────────────────
// CONFIG API
// ─────────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────────
// HOOK useApi  — fetch + loading + error + refetch + abort
// ─────────────────────────────────────────────────────────────────
const useApi = (fetchFn, deps = []) => {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    load();
    return () => abortRef.current?.abort();
  }, [load]);

  return { data, loading, error, refetch: load, setData };
};

// ─────────────────────────────────────────────────────────────────
// REUSABLE UI
// ─────────────────────────────────────────────────────────────────
const Spinner = ({ size = "sm" }) => (
  <FaSpinner className={`animate-spin text-blue-500 ${size === "lg" ? "text-3xl" : "text-sm"}`} />
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

const SkeletonCard = () => (
  <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-3 animate-pulse">
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 rounded-xl bg-gray-100" />
      <div className="flex-1 space-y-2">
        <div className="h-3.5 bg-gray-100 rounded w-2/3" />
        <div className="h-3 bg-gray-100 rounded w-1/2" />
      </div>
    </div>
  </div>
);

const SkeletonGrid = ({ n = 3 }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
    {[...Array(n)].map((_, i) => (
      <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-3 animate-pulse">
        <div className="h-3 bg-gray-100 rounded w-1/3" />
        <div className="h-4 bg-gray-100 rounded w-3/4" />
        <div className="h-3 bg-gray-100 rounded w-1/2" />
        <div className="h-8 bg-gray-100 rounded-xl w-full mt-2" />
      </div>
    ))}
  </div>
);

const StatusBadge = ({ statut }) => {
  const map = {
    Confirmé:    "bg-emerald-100 text-emerald-700",
    "En attente": "bg-amber-100 text-amber-700",
    Annulé:      "bg-red-100 text-red-700",
  };
  return (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${map[statut] || "bg-gray-100 text-gray-600"}`}>
      {statut}
    </span>
  );
};

const PaiementBadge = ({ paiement }) => {
  const map = {
    Payé:        "bg-blue-100 text-blue-700",
    "En attente": "bg-yellow-100 text-yellow-700",
    Remboursé:   "bg-purple-100 text-purple-700",
  };
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded ${map[paiement] || "bg-gray-100 text-gray-600"}`}>
      {paiement}
    </span>
  );
};

// ─────────────────────────────────────────────────────────────────
// PAGE : DASHBOARD HOME
// Endpoints :
//   GET /client/dashboard/stats   → { totalBookings, eventsAttended, totalFavorites }
//   GET /client/reservations?status=Confirmé&size=5  → { content: [...] }
//   GET /client/recommendations?size=3           → { content: [...] }
// ─────────────────────────────────────────────────────────────────
const DashboardHome = ({ onNavigate }) => {
  const { user } = useAuth();


  const { data: stats,   loading: lStats,  error: eStats,  refetch: rStats  } = useApi(() => apiFetch("/client/dashboard/stats"));
  const { data: upcoming,loading: lUp,     error: eUp,     refetch: rUp     } = useApi(() => apiFetch("/client/reservations")); // ?statut=Confirmé&size=5&sort=date,asc
  const { data: recs,    loading: lRecs,   error: eRecs,   refetch: rRecs   } = useApi(() => apiFetch("/client/recommendations?size=3"));

  const statCards = stats ? [
    { label: "Réservations",          value: stats.totalBookings,  icon: <FaTicketAlt />,  color: "bg-blue-50 text-blue-600" },
    { label: "Événements participés", value: stats.eventsAttended, icon: <FaCalendarAlt />, color: "bg-emerald-50 text-emerald-600" },
    { label: "Favoris",               value: stats.totalFavorites, icon: <FaHeart />,       color: "bg-rose-50 text-rose-600" },
  ] : [];

  const addFavorite = async (eventId) => {
    try {
      await apiFetch(`/client/favoris/${eventId}`, { method: "POST" });
      rRecs(); // rafraîchir les recommandations pour màj état favori
    } catch (e) { alert(e.message); }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">
            Bonjour{user?.prenom ? `, ${user.prenom}` : user?.nom ? `, ${user.nom}` : ""} 👋
          </h2>
          <p className="text-gray-500 text-sm">Voici un aperçu de votre activité</p>
        </div>
        <button onClick={() => { rStats(); rUp(); rRecs(); }}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 border border-gray-200 px-3 py-2 rounded-xl hover:bg-blue-50 transition">
          <FaSync className={lStats ? "animate-spin" : ""} size={12} />
          Actualiser
        </button>
      </div>

      {/* Stats cards */}
      {eStats && <ErrorBanner message={eStats} onRetry={rStats} />}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {lStats
          ? [...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4 shadow-sm animate-pulse">
                <div className="w-12 h-12 rounded-xl bg-gray-100" />
                <div className="space-y-2">
                  <div className="h-6 w-10 bg-gray-100 rounded" />
                  <div className="h-3 w-24 bg-gray-100 rounded" />
                </div>
              </div>
            ))
          : statCards.map((s, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4 shadow-sm">
                <div className={`p-3 rounded-xl text-xl ${s.color}`}>{s.icon}</div>
                <div>
                  <p className="text-3xl font-bold text-gray-900">{s.value ?? "—"}</p>
                  <p className="text-sm text-gray-500 mt-0.5">{s.label}</p>
                </div>
              </div>
            ))
        }
      </div>

      {/* Prochains événements */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-800">Prochains événements</h3>
          {lUp && <Spinner />}
        </div>
        {eUp && <ErrorBanner message={eUp} onRetry={rUp} />}
        <div className="space-y-3">
          {lUp && [...Array(3)].map((_, i) => <SkeletonCard key={i} />)}
          {!lUp && upcoming?.content?.length === 0 && (
            <p className="text-center text-gray-400 text-sm py-6 bg-white rounded-2xl border border-gray-100">
              Aucune réservation confirmée à venir
            </p>
          )}
          {!lUp && upcoming?.content?.map(b => (
            <div key={b.id} className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                <FaCalendarAlt className="text-white text-sm" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 truncate">{b.titre || b.title}</p>
                <p className="text-sm text-gray-500">
                  {b.date ? new Date(b.date).toLocaleDateString("fr-FR") : b.dateFormatted} · {b.lieu || b.location}
                </p>
              </div>
              <StatusBadge statut={b.statut || b.status} />
            </div>
          ))}
        </div>
      </div>

      {/* Recommandations */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-800">Recommandations pour vous</h3>
          {lRecs && <Spinner />}
        </div>
        {eRecs && <ErrorBanner message={eRecs} onRetry={rRecs} />}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {lRecs && [...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm space-y-2 animate-pulse">
              <div className="h-3 w-1/3 bg-gray-100 rounded" />
              <div className="h-4 w-3/4 bg-gray-100 rounded" />
              <div className="h-3 w-1/2 bg-gray-100 rounded" />
              <div className="h-6 w-1/4 bg-gray-100 rounded" />
            </div>
          ))}
          {!lRecs && recs?.content?.map(r => (
            <div key={r.id} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
              <div className="flex items-start justify-between mb-3">
                <span className="text-xs bg-blue-50 text-blue-600 font-semibold px-2 py-0.5 rounded-full">
                  Score {r.score}%
                </span>
                <button onClick={() => addFavorite(r.id)}
                  className={`transition-colors ${r.isFavorite ? "text-rose-500" : "text-gray-300 group-hover:text-rose-400"}`}>
                  <FaHeart />
                </button>
              </div>
              <p className="font-semibold text-gray-900 text-sm mb-1">{r.titre || r.title}</p>
              <p className="text-xs text-gray-500 mb-2">
                {r.date ? new Date(r.date).toLocaleDateString("fr-FR") : r.dateFormatted} · {r.lieu || r.city}
              </p>
              <p className="text-blue-600 font-bold">{r.prix || r.price} DH</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────
// PAGE : MES RÉSERVATIONS
// Endpoints :
//   GET /client/reservations?statut=&page=&size=10&sort=date,desc
//   GET /client/reservations/{id}/ticket  → blob PDF (téléchargement)
// ─────────────────────────────────────────────────────────────────
const BookingsPage = () => {
  const [filter, setFilter] = useState("Tous");
  const [pg, setPg]         = useState(0);

  const buildQ = () => {
    const p = new URLSearchParams({ page: pg, size: 10, sort: "date,desc" });
    if (filter !== "Tous") p.set("statut", filter);
    return p.toString();
  };

  const { data, loading, error, refetch } = useApi(
    () => apiFetch(`/client/reservations?${buildQ()}`),
    [filter, pg]
  );

  const reservations   = data?.content || [];
  const totalPages = data?.totalPages || 0;
  const totalEl    = data?.totalElements || 0;

  const downloadTicket = async (id, titre) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${BASE_URL}/client/reservations/${id}/ticket`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) { window.location.href = "/auth"; return; }
      if (!res.ok) throw new Error("Impossible de télécharger le billet");
      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href     = url;
      a.download = `billet-${titre?.replace(/\s+/g, "-") || id}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) { alert(e.message); }
  };

  const statuts = ["Tous", "Confirmé", "En attente", "Annulé"];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Mes Réservations</h2>
          <p className="text-gray-500 text-sm">
            {loading ? "Chargement…" : `${totalEl} réservation${totalEl !== 1 ? "s" : ""}`}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {statuts.map(s => (
            <button key={s} onClick={() => { setFilter(s); setPg(0); }}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                filter === s ? "bg-blue-600 text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {error && <ErrorBanner message={error} onRetry={refetch} />}

      <div className="space-y-3">
        {loading && [...Array(4)].map((_, i) => <SkeletonCard key={i} />)}

        {!loading && reservations.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
            <FaTicketAlt className="text-gray-300 text-3xl mx-auto mb-3" />
            <p className="text-gray-400 font-medium">Aucune réservation trouvée</p>
          </div>
        )}

        {!loading && reservations.map(b => (
          <div key={b.id} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center flex-shrink-0">
                <FaTicketAlt className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <p className="font-bold text-gray-900">{b.titre || b.title}</p>
                  <StatusBadge statut={b.statut || b.status} />
                </div>
                <div className="flex flex-wrap gap-x-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <FaCalendarAlt className="text-xs" />
                    {b.date ? new Date(b.date).toLocaleDateString("fr-FR") : b.dateFormatted}
                  </span>
                  <span className="flex items-center gap-1">
                    <FaMapMarkerAlt className="text-xs" />{b.lieu || b.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <FaEuroSign className="text-xs" />{b.prix || b.price} DH
                  </span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2 flex-shrink-0">
                <PaiementBadge paiement={b.paiement || b.paymentStatus} />
                <div className="flex gap-2">
                  <button
                    title="Voir le détail"
                    className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition">
                    <FaEye size={14} />
                  </button>
                  {(b.statut === "Confirmé" || b.status === "Confirmé") && (
                    <button
                      onClick={() => downloadTicket(b.id, b.titre || b.title)}
                      title="Télécharger le billet PDF"
                      className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition">
                      <FaDownload size={14} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>Page {pg + 1} / {totalPages}</span>
          <div className="flex gap-2">
            <button disabled={pg === 0} onClick={() => setPg(p => p - 1)}
              className="px-3 py-1.5 border border-gray-200 rounded-xl disabled:opacity-40 hover:bg-gray-50 transition">
              ← Précédent
            </button>
            <button disabled={pg >= totalPages - 1} onClick={() => setPg(p => p + 1)}
              className="px-3 py-1.5 border border-gray-200 rounded-xl disabled:opacity-40 hover:bg-gray-50 transition">
              Suivant →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────
// PAGE : FAVORIS
// Endpoints :
//   GET    /client/favoris?page=&size=10
//   DELETE /client/favoris/{eventId}
// ─────────────────────────────────────────────────────────────────
const FavoritesPage = () => {
  const [pg, setPg]         = useState(0);
  const [removing, setRem]  = useState(null); // id en cours de suppression

  const { data, loading, error, refetch, setData } = useApi(
    () => apiFetch(`/client/favoris?page=${pg}&size=10`),
    [pg]
  );

  const favs       = data?.content || [];
  const totalPages = data?.totalPages || 0;

  const cats = {
    Théâtre:  "bg-purple-50 text-purple-700",
    Festival: "bg-orange-50 text-orange-700",
    Art:      "bg-pink-50 text-pink-700",
    Sport:    "bg-green-50 text-green-700",
    Concert:  "bg-blue-50 text-blue-700",
  };

  const removeFavorite = async (eventId) => {
    setRem(eventId);
    try {
      await apiFetch(`/client/favoris/${eventId}`, { method: "DELETE" });
      // Mise à jour optimiste : retirer de la liste locale
      setData(prev => ({
        ...prev,
        content: prev.content.filter(f => f.id !== eventId),
        totalElements: (prev.totalElements || 1) - 1,
      }));
    } catch (e) {
      alert(e.message);
      refetch(); // rollback en rechargeant
    } finally {
      setRem(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Mes Favoris</h2>
        <p className="text-gray-500 text-sm">
          {loading ? "Chargement…" : `${data?.totalElements ?? 0} événement${(data?.totalElements ?? 0) !== 1 ? "s" : ""} sauvegardé${(data?.totalElements ?? 0) !== 1 ? "s" : ""}`}
        </p>
      </div>

      {error && <ErrorBanner message={error} onRetry={refetch} />}

      {loading && <SkeletonGrid n={4} />}

      {!loading && favs.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
          <FaHeart className="text-gray-300 text-3xl mx-auto mb-3" />
          <p className="text-gray-400 font-medium">Aucun favori enregistré</p>
        </div>
      )}

      {!loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {favs.map(f => (
            <div key={f.id} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all group">
              <div className="flex items-start justify-between mb-3">
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${cats[f.categorie || f.category] || "bg-gray-100 text-gray-600"}`}>
                  {f.categorie || f.category}
                </span>
                <button
                  onClick={() => removeFavorite(f.id)}
                  disabled={removing === f.id}
                  className="text-rose-400 hover:text-rose-600 transition-colors disabled:opacity-50">
                  {removing === f.id ? <Spinner /> : <FaHeart />}
                </button>
              </div>
              <h3 className="font-bold text-gray-900 mb-1">{f.titre || f.title}</h3>
              <div className="flex gap-4 text-sm text-gray-500 mb-4">
                <span className="flex items-center gap-1">
                  <FaCalendarAlt className="text-xs" />
                  {f.date ? new Date(f.date).toLocaleDateString("fr-FR") : f.dateFormatted}
                </span>
                <span className="flex items-center gap-1">
                  <FaMapMarkerAlt className="text-xs" />{f.lieu || f.city}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xl font-bold text-blue-600">{f.prix || f.price} DH</span>
                <button className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-1.5 rounded-lg font-medium transition">
                  Réserver
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

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

// ─────────────────────────────────────────────────────────────────
// PAGE : RECOMMANDATIONS
// Endpoint : GET /client/recommendations?page=&size=9
//            POST /client/favoris/{id}  → ajouter en favori
// ─────────────────────────────────────────────────────────────────
const RecommendationsPage = () => {
  const [pg, setPg] = useState(0);

  const { data, loading, error, refetch, setData } = useApi(
    () => apiFetch(`/client/recommendations?page=${pg}&size=9`),
    [pg]
  );

  const recs       = data?.content || [];
  const totalPages = data?.totalPages || 0;

  const toggleFavorite = async (rec) => {
    const wasFav = rec.isFavorite;
    // Mise à jour optimiste locale
    setData(prev => ({
      ...prev,
      content: prev.content.map(r =>
        r.id === rec.id ? { ...r, isFavorite: !wasFav } : r
      ),
    }));
    try {
      if (wasFav) {
        await apiFetch(`/client/favoris/${rec.id}`, { method: "DELETE" });
      } else {
        await apiFetch(`/client/favoris/${rec.id}`, { method: "POST" });
      }
    } catch (e) {
      // Rollback
      setData(prev => ({
        ...prev,
        content: prev.content.map(r =>
          r.id === rec.id ? { ...r, isFavorite: wasFav } : r
        ),
      }));
      alert(e.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Recommandations</h2>
          <p className="text-gray-500 text-sm">Sélectionnés selon vos préférences</p>
        </div>
        <button onClick={refetch} className="flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 border border-gray-200 px-3 py-2 rounded-xl hover:bg-blue-50 transition">
          <FaSync className={loading ? "animate-spin" : ""} size={12} />
          Actualiser
        </button>
      </div>

      {error && <ErrorBanner message={error} onRetry={refetch} />}

      {loading && <SkeletonGrid n={6} />}

      {!loading && recs.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
          <FaStar className="text-gray-300 text-3xl mx-auto mb-3" />
          <p className="text-gray-400 font-medium">Aucune recommandation disponible pour le moment</p>
        </div>
      )}

      {!loading && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {recs.map(r => (
            <div key={r.id} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition group cursor-pointer">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1">
                  <FaStar className="text-amber-400 text-sm" />
                  <span className="text-sm font-semibold text-amber-600">{r.score}%</span>
                </div>
                <button onClick={() => toggleFavorite(r)}
                  className={`transition-colors ${r.isFavorite ? "text-rose-500" : "text-gray-300 group-hover:text-rose-400"}`}>
                  <FaHeart />
                </button>
              </div>
              <h3 className="font-bold text-gray-900 mb-1">{r.titre || r.title}</h3>
              <p className="text-sm text-gray-500 mb-3">
                {r.date ? new Date(r.date).toLocaleDateString("fr-FR") : r.dateFormatted} · {r.lieu || r.city}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xl font-bold text-blue-600">{r.prix || r.price} DH</span>
                <button className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-1.5 rounded-lg font-medium transition">
                  Voir
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

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

// ─────────────────────────────────────────────────────────────────
// PAGE : PROFIL
// Endpoints :
//   GET   /client/profile          → { nom, email, telephone, ville, avatar, ... }
//   PUT   /client/profile          → body: { nom, email, telephone, ville }
//   PATCH /client/profile/password → body: { currentPassword, newPassword }
// ─────────────────────────────────────────────────────────────────
const ProfilePage = () => {
  const { data: profile, loading, error, refetch } = useApi(() => apiFetch("/client/profile"));

  const [form,        setForm]        = useState(null);
  const [pwdForm,     setPwdForm]     = useState({ currentPassword: "", newPassword: "", confirm: "" });
  const [saving,      setSaving]      = useState(false);
  const [savingPwd,   setSavingPwd]   = useState(false);
  const [successMsg,  setSuccess]     = useState("");
  const [formError,   setFormError]   = useState("");

  // Pré-remplir le form dès que le profil est chargé
  useEffect(() => {
    if (profile) {
      setForm({
        nom:       profile.nom || profile.name || "",
        email:     profile.email || "",
        telephone: profile.telephone || profile.phone || "",
        ville:     profile.ville || profile.city || "",
      });
    }
  }, [profile]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormError("");
    setSuccess("");
    try {
      await apiFetch("/client/profile", { method: "PUT", body: JSON.stringify(form) });
      setSuccess("Profil mis à jour avec succès ✓");
      refetch();
    } catch (e) {
      setFormError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (pwdForm.newPassword !== pwdForm.confirm) {
      setFormError("Les mots de passe ne correspondent pas.");
      return;
    }
    setSavingPwd(true);
    setFormError("");
    setSuccess("");
    try {
      await apiFetch("/client/profile/password", {
        method: "PATCH",
        body: JSON.stringify({
          currentPassword: pwdForm.currentPassword,
          newPassword:     pwdForm.newPassword,
        }),
      });
      setSuccess("Mot de passe modifié avec succès ✓");
      setPwdForm({ currentPassword: "", newPassword: "", confirm: "" });
    } catch (e) {
      setFormError(e.message);
    } finally {
      setSavingPwd(false);
    }
  };

  if (loading) return (
    <div className="max-w-xl space-y-4">
      <div className="h-8 w-40 bg-gray-100 rounded animate-pulse" />
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-4 animate-pulse">
        <div className="flex items-center gap-5 pb-6 border-b border-gray-100">
          <div className="w-20 h-20 rounded-2xl bg-gray-100" />
          <div className="space-y-2">
            <div className="h-5 w-32 bg-gray-100 rounded" />
            <div className="h-3 w-24 bg-gray-100 rounded" />
          </div>
        </div>
        {[...Array(4)].map((_, i) => <div key={i} className="h-10 bg-gray-100 rounded-xl" />)}
      </div>
    </div>
  );

  return (
    <div className="max-w-xl space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Mon Profil</h2>

      {error && <ErrorBanner message={error} onRetry={refetch} />}

      {/* Infos principales */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <div className="flex items-center gap-5 mb-6 pb-6 border-b border-gray-100">
          <img
            src={profile?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(form?.nom || "U")}&size=80&background=3b82f6&color=fff`}
            alt="Avatar"
            className="w-20 h-20 rounded-2xl object-cover"
          />
          <div>
            <h3 className="text-xl font-bold text-gray-900">{form?.nom || "—"}</h3>
            <p className="text-gray-500 text-sm">
              Client depuis {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString("fr-FR", { month: "long", year: "numeric" }) : "—"}
            </p>
            <span className="mt-1 inline-block bg-blue-50 text-blue-600 text-xs font-semibold px-2.5 py-1 rounded-full">
              Compte actif
            </span>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          {[
            ["Nom complet",  "nom",       "text"],
            ["Email",        "email",     "email"],
            ["Téléphone",    "telephone", "tel"],
            ["Ville",        "ville",     "text"],
          ].map(([label, key, type]) => (
            <div key={key}>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</label>
              <input
                type={type}
                value={form?.[key] || ""}
                onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
              />
            </div>
          ))}

          {formError  && <p className="text-sm text-red-600 font-medium">{formError}</p>}
          {successMsg && <p className="text-sm text-emerald-600 font-medium">{successMsg}</p>}

          <button type="submit" disabled={saving}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white py-2.5 rounded-xl font-semibold transition flex items-center justify-center gap-2 mt-2">
            {saving ? <Spinner /> : <FaSave />}
            {saving ? "Sauvegarde…" : "Sauvegarder les modifications"}
          </button>
        </form>
      </div>

      {/* Changer mot de passe */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <h3 className="font-bold text-gray-800 mb-4">Changer le mot de passe</h3>
        <form onSubmit={handlePasswordChange} className="space-y-4">
          {[
            ["Mot de passe actuel",    "currentPassword"],
            ["Nouveau mot de passe",   "newPassword"],
            ["Confirmer le nouveau",   "confirm"],
          ].map(([label, key]) => (
            <div key={key}>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</label>
              <input
                type="password"
                value={pwdForm[key]}
                onChange={e => setPwdForm(p => ({ ...p, [key]: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
              />
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

// ─────────────────────────────────────────────────────────────────
// PAGE : PARAMÈTRES
// Endpoint :
//   GET   /client/settings           → { notifications: {...}, privacy: {...} }
//   PATCH /client/settings           → body: { key, value }
// ─────────────────────────────────────────────────────────────────
const SettingsPage = () => {
  const { data: settings, loading, error, refetch, setData } = useApi(
    () => apiFetch("/client/settings")
  );
  const [saving, setSaving] = useState(null); // clé en cours de sauvegarde

  const toggle = async (section, key) => {
    const currentVal = settings?.[section]?.[key];
    const newVal     = !currentVal;
    // Mise à jour optimiste
    setData(prev => ({
      ...prev,
      [section]: { ...prev?.[section], [key]: newVal },
    }));
    setSaving(`${section}.${key}`);
    try {
      await apiFetch("/client/settings", {
        method: "PATCH",
        body: JSON.stringify({ section, key, value: newVal }),
      });
    } catch (e) {
      // Rollback
      setData(prev => ({
        ...prev,
        [section]: { ...prev?.[section], [key]: currentVal },
      }));
      alert(e.message);
    } finally {
      setSaving(null);
    }
  };

  // Définition des sections et items avec leur clé API
  const sections = [
    {
      section: "notifications",
      label:   "Notifications",
      items: [
        { key: "bookingConfirmed",    label: "Réservations confirmées" },
        { key: "eventReminders",      label: "Rappels d'événements" },
        { key: "newRecommendations",  label: "Nouvelles recommandations" },
        { key: "promotions",          label: "Promotions et offres" },
      ],
    },
    {
      section: "privacy",
      label:   "Confidentialité",
      items: [
        { key: "publicProfile",    label: "Profil public" },
        { key: "analyticsSharing", label: "Partage de données analytiques" },
      ],
    },
  ];

  if (loading) return (
    <div className="max-w-xl space-y-4">
      {[...Array(2)].map((_, i) => (
        <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm animate-pulse space-y-4">
          <div className="h-4 w-32 bg-gray-100 rounded" />
          {[...Array(3)].map((_, j) => (
            <div key={j} className="flex items-center justify-between py-2">
              <div className="h-3 w-48 bg-gray-100 rounded" />
              <div className="h-5 w-10 bg-gray-100 rounded-full" />
            </div>
          ))}
        </div>
      ))}
    </div>
  );

  return (
    <div className="max-w-xl space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Paramètres</h2>
      {error && <ErrorBanner message={error} onRetry={refetch} />}

      {sections.map(({ section, label, items }) => (
        <div key={section} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <h3 className="font-bold text-gray-800 mb-4">{label}</h3>
          <div className="space-y-3">
            {items.map(({ key, label: itemLabel }) => {
              const checked  = settings?.[section]?.[key] ?? false;
              const isLoading = saving === `${section}.${key}`;
              return (
                <div key={key} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <span className="text-sm text-gray-700">{itemLabel}</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => !isLoading && toggle(section, key)}
                      className="sr-only peer"
                    />
                    <div className={`w-10 h-5 rounded-full transition-colors ${
                      checked ? "bg-blue-600" : "bg-gray-200"
                    } ${isLoading ? "opacity-50" : ""} peer peer-checked:after:translate-x-5 after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all`} />
                  </label>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────
// MAIN LAYOUT
// ─────────────────────────────────────────────────────────────────
export default function ClientDashboard() {

  const { user, logout } = useAuth();

  const [page,        setPage]        = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Badge notifications non lues
  const { data: notifData } = useApi(() => apiFetch("/client/notifications/nonlu-count"));
  const unreadCount = notifData?.count || 0;

  const menu = [
    { id: "dashboard",       label: "Tableau de bord", icon: <FaHome /> },
    { id: "reservations",        label: "Mes réservations", icon: <FaTicketAlt /> },
    { id: "favoris",       label: "Favoris",          icon: <FaHeart /> },
    { id: "recommendations", label: "Recommandations",  icon: <FaStar /> },
    { id: "profile",         label: "Profil",           icon: <FaUser /> },
    { id: "settings",        label: "Paramètres",       icon: <FaCog /> },
  ];

  const pages = {
    dashboard:       <DashboardHome onNavigate={setPage} />,
    reservations:        <BookingsPage />,
    favoris:       <FavoritesPage />,
    recommendations: <RecommendationsPage />,
    profile:         <ProfilePage />,
    settings:        <SettingsPage />,
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-gray-100 flex-shrink-0">
        <div className="flex items-center gap-3">
          {/* <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <FaCalendarAlt className="text-white text-sm" />
          </div> */}
          <div className="w-16 h-16 bg-white/40 rounded-xl flex items-center justify-center backdrop-blur-sm shadow-lg">
            <img src={rovistaLogo} alt="AtlasEvents" className="h-14 w-14" />
          </div>
          <div>
            <p className="font-bold text-gray-900 text-sm">AtlasEvents</p>
            <p className="text-xs text-gray-500">Espace Client</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        {menu.map(item => (
          <button key={item.id}
            onClick={() => { setPage(item.id); setSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
              page === item.id
                ? "bg-blue-600 text-white shadow-sm"
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
            toString="/events"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-all">
            <FaCalendarAlt className="text-base" />
            Voir les événements
          </Link>
        </div>
      </nav>
      {/* Profil en bas */}
      <div className="p-4 border-t border-gray-100 flex-shrink-0">
        <div className="flex items-center gap-3 px-3 py-2">
          <img
            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.nom || "C")}&size=36&background=3b82f6&color=fff`}
            alt="avatar"
            className="w-9 h-9 rounded-xl"
          />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-gray-900 truncate">{user?.nom || "Mon compte"}</p>
            <p className="text-xs text-gray-500">{user?.role || "Client"}</p>
          </div>
          
          {/* ← Ajouter ce bouton */}
          <button
            onClick={logout}
            title="Déconnexion"
            className="text-gray-400 hover:text-red-500 transition-colors">
            <FaSignOutAlt size={16} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden">
      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex w-64 bg-white border-r border-gray-100 flex-col shadow-sm flex-shrink-0 h-screen">
        <SidebarContent />
      </aside>

      {/* Sidebar Mobile */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
          <aside className="relative w-64 bg-white flex flex-col shadow-xl h-full">            <button onClick={() => setSidebarOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
              <FaTimes size={20} />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <header className=" bg-white border-b border-gray-100 px-6 py-3.5 flex items-center justify-between shadow-sm">
          {/* Gauche : hamburger + recherche */}
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-gray-500 hover:text-gray-700">
              <FaBars size={20} />
            </button>
            <div className="hidden sm:flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 w-64">
              <FaSearch className="text-gray-400 text-sm" />
              <input type="text" placeholder="Rechercher un événement..."
                className="bg-transparent text-sm text-gray-700 outline-none w-full placeholder-gray-400" />
            </div>
          </div>

          {/* Droite : boutons retour + cloche + avatar */}
          <div className="flex items-center gap-3">

            {/* ← BOUTONS ICI à droite */}
            <Link to="/" className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-blue-600 border border-gray-200 hover:border-blue-300 px-3 py-1.5 rounded-xl transition">
              <FaHome size={12} /> Accueil
            </Link>
            <Link to="/events#list" className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-blue-600 border border-gray-200 hover:border-blue-300 px-3 py-1.5 rounded-xl transition">
              <FaCalendarAlt size={12} /> Événements
            </Link>

            <button className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition">
              <FaBell size={18} />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>
            <img
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.nom || "C")}&size=36&background=3b82f6&color=fff`}
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