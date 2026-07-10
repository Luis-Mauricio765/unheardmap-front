import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Navbar.css";

export default function Navbar({ onReportarClick }) {
  const { isAuthenticated, username, isAdmin, esMiembro, logout } = useAuth();
  const [menuAbierto, setMenuAbierto] = useState(false);
  const navigate = useNavigate();

  return (
    <header className="navbar">
      <div className="navbar__brand">
        <span className="navbar__mark" aria-hidden="true" />
        <Link to="/" className="navbar__title">
          Unheard Map
        </Link>
      </div>

      <nav className={`navbar__links ${menuAbierto ? "is-open" : ""}`}>
        <Link to="/" onClick={() => setMenuAbierto(false)}>
          Mapa
        </Link>
        {isAuthenticated && (
          <Link to="/estadisticas" onClick={() => setMenuAbierto(false)}>
            Estadísticas
          </Link>
        )}
        <a href="#contacto" onClick={() => setMenuAbierto(false)}>
          Contacto
        </a>
        <a href="#comunidad" onClick={() => setMenuAbierto(false)}>
          Comunidad
        </a>

        {isAuthenticated && onReportarClick && (
          <button className="navbar__cta" onClick={onReportarClick}>
            + Reportar
          </button>
        )}

        {isAuthenticated ? (
          <div className="navbar__user">
            {isAdmin && (
              <Link to="/admin" onClick={() => setMenuAbierto(false)}>
                Admin
              </Link>
            )}
            <span className="navbar__username mono">@{username}</span>
            {esMiembro && !isAdmin && (
              <span className="navbar__member-badge">Miembro</span>
            )}
            <button
              className="navbar__logout"
              onClick={() => {
                logout();
                navigate("/");
              }}
            >
              Salir
            </button>
          </div>
        ) : (
          <Link to="/login" className="navbar__login">
            Iniciar sesión
          </Link>
        )}
      </nav>

      <button
        className="navbar__burger"
        aria-label="Abrir menú"
        onClick={() => setMenuAbierto((v) => !v)}
      >
        <span />
        <span />
        <span />
      </button>
    </header>
  );
}
