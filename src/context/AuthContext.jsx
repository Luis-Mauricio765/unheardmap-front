import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { login as loginRequest, register as registerRequest } from "../api/auth";

const AuthContext = createContext(null);

// Decodifica el payload del JWT sin librerías externas
function decodePayload(token) {
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("um_token"));
  const [username, setUsername] = useState(() => localStorage.getItem("um_user"));
  const [isAdmin, setIsAdmin] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (token) {
      localStorage.setItem("um_token", token);
      const payload = decodePayload(token);
      if (payload?.sub) {
        setUsername(payload.sub);
        localStorage.setItem("um_user", payload.sub);
      }
      setIsAdmin(Boolean(payload?.roles?.includes("ROLE_ADMIN")));
    } else {
      localStorage.removeItem("um_token");
      localStorage.removeItem("um_user");
      setUsername(null);
      setIsAdmin(false);
    }
  }, [token]);

  const login = useCallback(async (credenciales) => {
    setCargando(true);
    setError(null);
    try {
      const { token } = await loginRequest(credenciales);
      setToken(token);
      return true;
    } catch (err) {
      setError(err.response?.data?.mensaje || "Usuario o contraseña incorrectos");
      return false;
    } finally {
      setCargando(false);
    }
  }, []);

  const register = useCallback(async (datos) => {
    setCargando(true);
    setError(null);
    try {
      const { token } = await registerRequest(datos);
      setToken(token);
      return true;
    } catch (err) {
      setError(err.response?.data?.mensaje || "No se pudo completar el registro");
      return false;
    } finally {
      setCargando(false);
    }
  }, []);

  const logout = useCallback(() => {
    setToken(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        token,
        username,
        isAdmin,
        isAuthenticated: !!token,
        cargando,
        error,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
}
