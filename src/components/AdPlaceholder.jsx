import { Link } from "react-router-dom";
import "./AdPlaceholder.css";

// Placeholder de publicidad: solo lo ven usuarios sin membresía
export default function AdPlaceholder() {
  return (
    <div className="ad-placeholder">
      <span className="ad-placeholder__tag">Publicidad</span>
      <div className="ad-placeholder__contenido">
        <span className="ad-placeholder__texto">Tu anuncio podría estar aquí</span>
        <Link to="/pagoMembresia" className="ad-placeholder__quitar">
          Quitar anuncios con Premium →
        </Link>
      </div>
    </div>
  );
}
