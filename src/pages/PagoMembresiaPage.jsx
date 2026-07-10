import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import { pagarMembresia } from "../api/membresia";
import { formatearFechaCompleta } from "../utils/dateHelpers";
import "./PagoMembresia.css";

// Agrupa el número de tarjeta en bloques de 4 dígitos: "0000 0000 0000 0000"
function formatearNumeroTarjeta(valor) {
  const digitos = valor.replace(/\D/g, "").slice(0, 16);
  return digitos.match(/.{1,4}/g)?.join(" ") ?? digitos;
}

const BENEFICIOS = [
  "Navega sin anuncios",
  "Panel de Estadísticas con gráficos y tendencias",
  "Foro de reportes con filtros avanzados",
  "Comenta anónimamente en los reportes",
  "Denuncia reportes falsos o abusivos",
];

export default function PagoMembresiaPage() {
  const { isAuthenticated, esMiembro, miembroHasta, refrescarMe } = useAuth();
  const navigate = useNavigate();

  // Formulario 100% simulado: estos datos nunca se envían a ningún servidor
  const [nombre, setNombre] = useState("");
  const [tarjeta, setTarjeta] = useState("");
  const [vencimiento, setVencimiento] = useState("");
  const [cvv, setCvv] = useState("");
  const [pagando, setPagando] = useState(false);
  const [error, setError] = useState(null);

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  async function manejarPago(e) {
    e.preventDefault();
    setPagando(true);
    setError(null);
    try {
      await pagarMembresia();
      await refrescarMe();
      navigate("/estadisticas");
    } catch {
      setError("No se pudo procesar la membresía. Intenta de nuevo.");
    } finally {
      setPagando(false);
    }
  }

  return (
    <div className="pago-page">
      <Navbar />
      <div className="pago-page__body">
        <div className="pago-card">
          <span className="pago-card__eyebrow">Unheard Map Premium</span>
          <h1>Hazte miembro</h1>

          {esMiembro && miembroHasta && (
            <p className="pago-card__vigente">
              Ya eres miembro hasta el {formatearFechaCompleta(miembroHasta)}. Puedes
              extender tu membresía 30 días más.
            </p>
          )}

          <div className="pago-card__precio">
            <span className="pago-card__monto">$15</span>
            <span className="pago-card__periodo">/ mes</span>
          </div>

          <ul className="pago-card__beneficios">
            {BENEFICIOS.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>

          <form className="pago-form" onSubmit={manejarPago}>
            <div className="pago-field">
              <label htmlFor="nombre">Nombre en la tarjeta</label>
              <input
                id="nombre"
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Como figura en la tarjeta"
                required
              />
            </div>

            <div className="pago-field">
              <label htmlFor="tarjeta">Número de tarjeta</label>
              <input
                id="tarjeta"
                type="text"
                inputMode="numeric"
                maxLength={19}
                value={tarjeta}
                onChange={(e) => setTarjeta(formatearNumeroTarjeta(e.target.value))}
                placeholder="0000 0000 0000 0000"
                required
              />
            </div>

            <div className="pago-form__row">
              <div className="pago-field">
                <label htmlFor="vencimiento">Vencimiento</label>
                <input
                  id="vencimiento"
                  type="text"
                  maxLength={5}
                  value={vencimiento}
                  onChange={(e) => setVencimiento(e.target.value)}
                  placeholder="MM/AA"
                  required
                />
              </div>
              <div className="pago-field">
                <label htmlFor="cvv">CVV</label>
                <input
                  id="cvv"
                  type="password"
                  inputMode="numeric"
                  maxLength={3}
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 3))}
                  placeholder="123"
                  required
                />
              </div>
            </div>

            {error && <p className="pago-error">{error}</p>}

            <button type="submit" className="pago-submit" disabled={pagando}>
              {pagando
                ? "Procesando…"
                : esMiembro
                  ? "Extender membresía 30 días"
                  : "Confirmar pago"}
            </button>
          </form>

          <p className="pago-note">
            Demo académica: el pago es simulado y los datos de la tarjeta no se envían
            ni se guardan en ningún servidor.
          </p>
        </div>
      </div>
    </div>
  );
}
