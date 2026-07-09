import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Auth.css";

export default function RegisterPage() {
  const { register, cargando, error } = useAuth();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  async function manejarSubmit(e) {
    e.preventDefault();
    const ok = await register({ username, email, password });
    if (ok) navigate("/");
  }

  return (
    <div className="auth-page">
      <div className="auth-page__body">
        <div className="auth-card">
          <span className="auth-card__eyebrow">Unheard Map</span>
          <h1>Crea tu cuenta</h1>
          <p className="auth-card__subtitle">
            Únete para poder reportar incidentes y participar en la valoración
            comunitaria.
          </p>

          <form className="auth-form" onSubmit={manejarSubmit}>
            <div className="auth-field">
              <label htmlFor="username">Usuario</label>
              <input
                id="username"
                type="text"
                minLength={3}
                maxLength={50}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="username"
              />
            </div>

            <div className="auth-field">
              <label htmlFor="email">Correo electrónico</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div className="auth-field">
              <label htmlFor="password">Contraseña</label>
              <input
                id="password"
                type="password"
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
            </div>

            {error && <p className="auth-error">{error}</p>}

            <button type="submit" className="auth-submit" disabled={cargando}>
              {cargando ? "Creando cuenta…" : "Crear cuenta"}
            </button>
          </form>

          <p className="auth-switch">
            ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
          </p>

          <p className="auth-note">
            Tu correo y usuario nunca se muestran públicamente junto a tus reportes.
          </p>
        </div>
      </div>
    </div>
  );
}
