import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

export default function PrivateRoute({ children }) {
  const { user, token } = useAuth();
  // Optionally: check token expiry here
  if (!user || !token) {
    return <Navigate to="/login" replace />;
  }
  return children;
}
