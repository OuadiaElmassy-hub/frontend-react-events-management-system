import React from "react";
import { useAuth } from "../context/AuthContext"; // ton contexte

const UnauthorizedPage = () => {
  const { logout } = useAuth();

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>🚫 Accès refusé</h1>
      <p>Vous n’avez pas l’autorisation d’accéder à cette page.</p>
      <button onClick={logout}>Retour à la page de connexion</button>
    </div>
  );
};

export default UnauthorizedPage;
