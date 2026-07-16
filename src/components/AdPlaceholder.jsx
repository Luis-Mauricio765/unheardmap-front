import { useMemo } from "react";
import { Link } from "react-router-dom";
import "./AdPlaceholder.css";

// Anuncios ficticios (placeholders): ninguno lleva a un sitio real
const ANUNCIOS = [
  {
    icono: "🛡️",
    titulo: "SeguroTotal Hogar",
    texto: "Protege tu casa desde $12/mes. Cotiza en línea en 2 minutos.",
    cta: "Cotizar ahora",
    gradiente: "linear-gradient(135deg, #134e5e, #71b280)",
  },
  {
    icono: "📷",
    titulo: "VigilaCam Pro",
    texto: "Cámaras con visión nocturna y alertas directo a tu celular.",
    cta: "Ver ofertas",
    gradiente: "linear-gradient(135deg, #2f80ed, #56ccf2)",
  },
  {
    icono: "🚨",
    titulo: "Alarma Vecinal+",
    texto: "La red de alarmas comunitarias más grande de tu distrito.",
    cta: "Únete gratis",
    gradiente: "linear-gradient(135deg, #c0392b, #e67e22)",
  },
  {
    icono: "🔒",
    titulo: "CandadoMax",
    texto: "Cerraduras inteligentes con apertura desde tu teléfono.",
    cta: "Comprar hoy",
    gradiente: "linear-gradient(135deg, #41295a, #2f0743)",
  },
  {
    icono: "🚴",
    titulo: "BiciSegura",
    texto: "GPS antirrobo para tu bicicleta. Rastreo en tiempo real.",
    cta: "Conócelo",
    gradiente: "linear-gradient(135deg, #136a8a, #267871)",
  },
];

// Placeholder de publicidad: solo lo ven usuarios sin membresía.
// variante: "banner" (flotante sobre el mapa) | "card" (bloque en paneles)
export default function AdPlaceholder({ variante = "banner" }) {
  const anuncio = useMemo(
    () => ANUNCIOS[Math.floor(Math.random() * ANUNCIOS.length)],
    []
  );

  return (
    <div className={`ad ad--${variante}`}>
      <span className="ad__tag">Publicidad</span>

      <div className="ad__media" style={{ background: anuncio.gradiente }} aria-hidden="true">
        {anuncio.icono}
      </div>

      <div className="ad__body">
        <strong className="ad__titulo">{anuncio.titulo}</strong>
        <p className="ad__texto">{anuncio.texto}</p>
      </div>

      <div className="ad__acciones">
        <span className="ad__cta">{anuncio.cta}</span>
        <Link to="/pagoMembresia" className="ad__quitar">
          Quitar anuncios ✕
        </Link>
      </div>
    </div>
  );
}
