import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function RequireMiembro({ children }) {
  const { isAuthenticated, esMiembro, meCargado } = useAuth();

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  // Evita un redirect falso mientras aún no sabemos si es miembro
  if (!meCargado) {
    return <div style={{ padding: 40, textAlign: "center" }}>Cargando…</div>;
  }

  return esMiembro ? children : <Navigate to="/pagoMembresia" replace />;
}
