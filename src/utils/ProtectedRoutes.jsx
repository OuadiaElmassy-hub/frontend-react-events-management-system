// import { Navigate } from "react-router-dom";
// import { useAuth } from "../context/AuthContext";

// // // Pour les routes nécessitant juste d'être connecté
// // export function ProtectedRoute({ children }) {
// //   const { isAuthenticated } = useAuth();
// //   return isAuthenticated ? children : <Navigate to="/auth" replace />;
// // }
// export function ProtectedRoutes({ children, allowedRoles }) {
//   const { user, loading } = useAuth()  // ← loading doit exister dans AuthContext

//   if (loading) return null  // ou un spinner — NE PAS rediriger tant que loading = true

//   if (!user) return <Navigate to="/auth" replace />

//   if (allowedRoles && !allowedRoles.some(r => user.roles?.includes(r))) {
//     return <Navigate to="/unauthorized" replace />
//   }
// console.log("USER =", user);
// console.log("LOADING =", loading);
// console.log("ROLES =", user?.roles);
//   return children
// }

// // Pour les routes nécessitant un rôle spécifique
// export default function RoleGuard({ children, allowedRoles }) {
//   const { user, isAuthenticated , loading } = useAuth();

//   if (!isAuthenticated) return <Navigate to="/auth" replace />;

//   // Le token décodé peut avoir "roles" (tableau) ou "role" (string)
//   const userRoles = Array.isArray(user?.roles) ? user.roles : [user?.role];
//   const hasRole = allowedRoles.some(r => userRoles.includes(r));

//   if (!hasRole) return <Navigate to="/unauthorized" replace />;

// console.log("USER =", user);
// console.log("LOADING =", loading);
// console.log("ROLES =", user?.roles);

//   return children;
// }
// //----------


import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function RoleGuard({ children, allowedRoles }) {
  const { user, isAuthenticated, loading } = useAuth();

  // 1. IMPORTANT : On attend que le backend ait répondu avant de prendre une décision
  if (loading) {
    return null; // Ou un spinner <div className="spinner">Chargement...</div>
  }

  // 2. Si l'utilisateur n'est pas connecté ou que le token est absent
  if (!isAuthenticated || !user) {
    return <Navigate to="/auth" replace />;
  }

  // 3. Si des rôles spécifiques sont requis, on effectue la vérification
  if (allowedRoles && allowedRoles.length > 0) {
    // Normalisation sécurisée : gère "roles" [] ou "role" ""
    const userRoles = Array.isArray(user?.roles) 
      ? user.roles 
      : user?.role 
        ? [user.role] 
        : [];

    const hasRole = allowedRoles.some(r => userRoles.includes(r));

    if (!hasRole) {
      console.warn(`Accès refusé. Rôles requis: [${allowedRoles}], Rôles utilisateur:`, userRoles);
      return <Navigate to="/unauthorized" replace />;
    }
  }

  // Les logs de débogage pour vous aider en développement
  console.log("=== RoleGuard Check ===");
  console.log("User:", user);
  console.log("Roles validés:", Array.isArray(user?.roles) ? user.roles : [user?.role]);

  // 4. Si connecté et rôle OK (ou si aucun rôle n'était requis)
  return children;
}