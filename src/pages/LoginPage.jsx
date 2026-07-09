import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Auth.css";

export default function LoginPage() {
  const { login, cargando, error } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  async function manejarSubmit(e) {
    e.preventDefault();
    const ok = await login({ username, password });
    if (ok) navigate("/");
  }

  return (
    <div className="auth-page">
      <div className="auth-page__body">
        <div className="auth-card">
          <span className="auth-card__eyebrow">Unheard Map</span>
          <h1>Inicia sesión</h1>
          <p className="auth-card__subtitle">
            Accede para reportar incidentes y valorar los reportes de tu comunidad.
          </p>

          <form className="auth-form" onSubmit={manejarSubmit}>
            <div className="auth-field">
              <label htmlFor="username">Usuario</label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="username"
              />
            </div>

            <div className="auth-field">
              <label htmlFor="password">Contraseña</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>

            {error && <p className="auth-error">{error}</p>}

            <button type="submit" className="auth-submit" disabled={cargando}>
              {cargando ? "Ingresando…" : "Iniciar sesión"}
            </button>
          </form>

          <p className="auth-switch">
            ¿Aún no tienes cuenta? <Link to="/registro">Regístrate</Link>
          </p>

          <p className="auth-note">
            Tus reportes en el mapa siempre se publican de forma anónima. Tu cuenta
            solo se usa para autenticarte y controlar el sistema de votos.
          </p>
        </div>
      </div>
    </div>
  );
}
