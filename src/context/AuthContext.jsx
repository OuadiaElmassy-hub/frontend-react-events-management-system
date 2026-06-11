// import { createContext, useContext, useEffect, useState } from "react";
// import { jwtDecode } from "jwt-decode";
// import { BASE_URL } from "../utils/api";

// const AuthContext = createContext();

// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null); // {id, role, email...}
//   const [token, setToken] = useState(localStorage.getItem("token"));
  
//   const [loading, setLoading] = useState(true)  // ← true par défaut

//   // Decode JWT au chargement
//   useEffect(() => {
//     if (token) {
//       try {
//         const decoded = jwtDecode(token);
//         // Vérifier expiration
//         if (decoded.exp && decoded.exp * 1000 < Date.now()) {
//           logout(); // token expiré → déconnexion auto
//           return;
//         }
//         setUser(decoded);
//         setLoading(false)  //--------
//       } catch (e) {
//         logout();
//       }
//     }
//   }, [token]);

//   // // au lieu de decodage on verifier par le backend

//   // useEffect(() => {
//   //   const token = localStorage.getItem('token')
//   //   if (!token) {
//   //     setLoading(false)
//   //     return
//   //   }
//   //   // appel /api/auth/me pour vérifier le token
//   //   fetch(`${BASE_URL}/auth/me`, {
//   //     headers: { Authorization: `Bearer ${token}` }
//   //   })
//   //     .then(res => res.ok ? res.json() : null)
//   //     .then(data => { setUser(data) })
//   //     .then(data => {
//   //       console.log("AUTH /ME =", data);
//   //       setUser(data);
//   //     })
//   //    .catch(() => setUser(null))
//   //    .finally(() => setLoading(false))  // ← loading = false seulement après la réponse
//   // }, [])

//   const login = (jwt) => {
//     localStorage.setItem("token", jwt);
//     setToken(jwt);
//     setUser(jwtDecode(jwt));
//   };

//   const logout = () => {
//     localStorage.removeItem("token");
//     setToken(null);
//     setUser(null);
//     window.location.href = "/"; // logout propre // ou "/auth"
//   };

//   const isAuthenticated = !!token;

//   return (
//     <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated , loading }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export const useAuth = () => useContext(AuthContext);


import { createContext, useContext, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // 💡 ÉTAPE 1 : On récupère le token de manière synchrone au tout début
  const initialToken = localStorage.getItem("token");
  console.log("INITIAL TOKEN AU REFRESH:", initialToken); // ← ajouter
  
  // On essaie de décoder le token immédiatement pour éviter le décalage de timing
  const getInitialUser = () => {
    if (!initialToken) return null;
    try {
      const decoded = jwtDecode(initialToken);
       console.log("TOKEN DECODED:", decoded); // ← ajouter
    console.log("EXPIRED?", decoded.exp * 1000 < Date.now()); // ← ajouter
      // Si le token est expiré dès le départ, on ne prend pas le user
      if (decoded.exp && decoded.exp * 1000 < Date.now()) {
        return null;
      }
      return decoded;
    } catch (e) {
      console.log("DECODE ERROR:", e); // ← ajouter
      return null;
    }
  };

  const [token, setToken] = useState(initialToken);
  const [user, setUser] = useState(getInitialUser());
  
  // 💡 ÉTAPE 2 : Le loading est FALSE immédiatement si le user initial est déjà chargé !
  // Il n'est TRUE que si vous utilisez une API asynchrone (comme votre code commenté /auth/me)
  const [loading, setLoading] = useState(initialToken && !user ? true : false);

  // Ce useEffect ne sert plus qu'à nettoyer si le token expire en cours de session
  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode(token);
        if (decoded.exp && decoded.exp * 1000 < Date.now()) {
          logout();
        }
      } catch (e) {
        logout();
      }
    }
  }, [token]);

  const login = (jwt) => {

    //  On écrit d'abord dans le localStorage (bloquant/synchrone)
    localStorage.setItem("token", jwt);
    
    // 💡 ÉTAPE 3 : On met à jour TOUS les états en même temps, de manière synchrone
    const decoded = jwtDecode(jwt);
    setUser(decoded);
    setToken(jwt);
    //setLoading(false); // On s'assure que loading est bien false ici
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    //setLoading(false);
    window.location.href = "/";
  };

  const isAuthenticated = !!token && !!user;

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);