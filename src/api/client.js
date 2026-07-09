import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Adjunta el token JWT a cada request si existe
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("um_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Si el token expiró o es inválido, limpiamos sesión
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("um_token");
      localStorage.removeItem("um_user");
    }
    return Promise.reject(error);
  }
);

export default api;
