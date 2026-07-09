import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { login as loginRequest, register as registerRequest } from "../api/auth";

const AuthContext = createContext(null);

// Decodifica el payload del JWT sin librerías externas (solo para leer el username)
function decodeUsername(token) {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.sub || null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("um_token"));
  const [username, setUsername] = useState(() => localStorage.getItem("um_user"));
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (token) {
      localStorage.setItem("um_token", token);
      const u = decodeUsername(token);
      if (u) {
        setUsername(u);
        localStorage.setItem("um_user", u);
      }
    } else {
      localStorage.removeItem("um_token");
      localStorage.removeItem("um_user");
      setUsername(null);
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
