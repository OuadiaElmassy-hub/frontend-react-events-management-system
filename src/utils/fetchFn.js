
 //partager pour les pages proteger


export const BASE_URL = import.meta.env?.VITE_API_URL || "http://localhost:8080/api";

const apiFetch = async (path, options = {}) => {
  const token = localStorage.getItem("token");
  console.log("TOKEN DANS APIFETCH:", token);  // ← ajouter temporairement
  
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  });

  if (res.status === 401) {
    localStorage.removeItem("token");
    console.error("401 sur:", path); // ← temporaire pour debug
    window.location.href = "/auth";
    throw new Error("Non autorisé");
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`);
  return data;
};

export default apiFetch;