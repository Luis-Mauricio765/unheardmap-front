import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import { listarMetas, donar } from "../api/donaciones";
import {
  formatearNumeroTarjeta,
  formatearVencimiento,
  validarVencimiento,
} from "../utils/tarjeta";
import "./Donaciones.css";

const PRESETS = [1, 5, 10, 25];

function formatearMonto(valor) {
  return `$${Number(valor).toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
}

export default function DonacionesPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [metas, setMetas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [agradecimiento, setAgradecimiento] = useState(null);

  // Modal de donación: undefined = cerrado, null = donación general, objeto = meta elegida
  const [metaSeleccionada, setMetaSeleccionada] = useState(undefined);

  const cargarMetas = useCallback(() => {
    listarMetas()
      .then(setMetas)
      .catch(() => setError("No se pudieron cargar las metas de donación"))
      .finally(() => setCargando(false));
  }, []);

  useEffect(() => {
    cargarMetas();
  }, [cargarMetas]);

  function abrirDonacion(meta) {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    setAgradecimiento(null);
    setMetaSeleccionada(meta);
  }

  return (
    <div className="dona-page">
      <Navbar />

      <div className="dona-page__body">
        <header className="dona-hero">
          <span className="dona-hero__eyebrow">Donaciones</span>
          <h1>Apoya a UnheardMap</h1>
          <p>
            Cada aporte mantiene el mapa en línea y nos permite seguir mejorando la
            seguridad de tu comunidad.
          </p>
        </header>

        {error && <p className="dona-error">{error}</p>}

        {agradecimiento && (
          <div className="dona-gracias">
            <span>💚</span> {agradecimiento}
          </div>
        )}

        {cargando && <p className="dona-cargando">Cargando…</p>}

        {!cargando && metas.length > 0 && (
          <div className="dona-grid">
            {metas.map((meta) => {
              const porcentaje =
                meta.objetivo > 0 ? (meta.recaudado / meta.objetivo) * 100 : 0;
              const alcanzada = porcentaje >= 100;
              return (
                <article key={meta.id} className="dona-card">
                  <div className="dona-card__top">
                    <h2>{meta.titulo}</h2>
                    {alcanzada && (
                      <span className="dona-card__lograda">¡Meta alcanzada!</span>
                    )}
                  </div>

                  {meta.descripcion && (
                    <p className="dona-card__descripcion">{meta.descripcion}</p>
                  )}

                  <div className="dona-progress">
                    <div
                      className="dona-progress__fill"
                      style={{ width: `${Math.min(porcentaje, 100)}%` }}
                    />
                  </div>

                  <div className="dona-card__cifras">
                    <span className="dona-card__recaudado">
                      {formatearMonto(meta.recaudado)}{" "}
                      <span className="dona-card__objetivo">
                        de {formatearMonto(meta.objetivo)}
                      </span>
                    </span>
                    <span className="dona-card__porcentaje">
                      {porcentaje.toFixed(0)}%
                    </span>
                  </div>

                  <button className="dona-card__btn" onClick={() => abrirDonacion(meta)}>
                    Donar
                  </button>
                </article>
              );
            })}
          </div>
        )}

        {!cargando && metas.length === 0 && !error && (
          <div className="dona-card dona-card--mensaje">
            <h2>¿Te ha sido útil UnheardMap? ¡Apoya el proyecto!</h2>
            <p>
              Nuestra misión es visibilizar lo que ocurre en nuestras calles de forma
              segura. Si crees en el poder de la información ciudadana, considera hacer
              una pequeña donación. Tu contribución nos ayuda a pagar los costos
              técnicos del mapa y a seguir agregando nuevas funciones.
            </p>
            <button className="dona-card__btn" onClick={() => abrirDonacion(null)}>
              Donar al proyecto
            </button>
          </div>
        )}
      </div>

      {metaSeleccionada !== undefined && (
        <DonacionModal
          meta={metaSeleccionada}
          onClose={() => setMetaSeleccionada(undefined)}
          onDonado={(monto) => {
            setMetaSeleccionada(undefined);
            setAgradecimiento(
              `¡Gracias por tu donación de ${formatearMonto(monto)}! Tu apoyo hace posible UnheardMap.`
            );
            cargarMetas();
          }}
        />
      )}
    </div>
  );
}

function DonacionModal({ meta, onClose, onDonado }) {
  const [monto, setMonto] = useState("5");
  const [nombre, setNombre] = useState("");
  const [tarjeta, setTarjeta] = useState("");
  const [vencimiento, setVencimiento] = useState("");
  const [cvv, setCvv] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState(null);

  async function manejarSubmit(e) {
    e.preventDefault();
    const valor = Number(monto);
    if (!valor || valor <= 0) {
      setError("Ingresa un monto mayor a 0");
      return;
    }
    if (valor > 10000) {
      setError("El monto máximo por donación es $10,000");
      return;
    }
    const errorVencimiento = validarVencimiento(vencimiento);
    if (errorVencimiento) {
      setError(errorVencimiento);
      return;
    }

    setEnviando(true);
    setError(null);
    try {
      // Solo viaja { metaId, monto }; los datos de la tarjeta nunca salen del navegador
      await donar(meta?.id ?? null, valor);
      onDonado(valor);
    } catch (err) {
      setError(err.response?.data?.mensaje || "No se pudo procesar la donación");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="dona-modal__overlay" onClick={onClose}>
      <div className="dona-modal" onClick={(e) => e.stopPropagation()}>
        <button className="dona-modal__close" onClick={onClose} aria-label="Cerrar">
          ✕
        </button>

        <h2>{meta ? `Donar a: ${meta.titulo}` : "Donar a UnheardMap"}</h2>

        <div className="dona-modal__presets">
          {PRESETS.map((p) => (
            <button
              key={p}
              type="button"
              className={Number(monto) === p ? "is-active" : ""}
              onClick={() => setMonto(String(p))}
            >
              ${p}
            </button>
          ))}
        </div>

        <form className="dona-modal__form" onSubmit={manejarSubmit}>
          <div className="dona-field">
            <label htmlFor="dona-monto">Monto ($)</label>
            <input
              id="dona-monto"
              type="number"
              min="1"
              max="10000"
              step="0.5"
              value={monto}
              onChange={(e) => setMonto(e.target.value)}
              required
            />
          </div>

          <div className="dona-field">
            <label htmlFor="dona-nombre">Nombre en la tarjeta</label>
            <input
              id="dona-nombre"
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Como figura en la tarjeta"
              required
            />
          </div>

          <div className="dona-field">
            <label htmlFor="dona-tarjeta">Número de tarjeta</label>
            <input
              id="dona-tarjeta"
              type="text"
              inputMode="numeric"
              maxLength={19}
              value={tarjeta}
              onChange={(e) => setTarjeta(formatearNumeroTarjeta(e.target.value))}
              placeholder="0000 0000 0000 0000"
              required
            />
          </div>

          <div className="dona-modal__row">
            <div className="dona-field">
              <label htmlFor="dona-venc">Vencimiento</label>
              <input
                id="dona-venc"
                type="text"
                inputMode="numeric"
                maxLength={5}
                value={vencimiento}
                onChange={(e) => setVencimiento(formatearVencimiento(e.target.value))}
                placeholder="MM/AA"
                required
              />
            </div>
            <div className="dona-field">
              <label htmlFor="dona-cvv">CVV</label>
              <input
                id="dona-cvv"
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

          {error && <p className="dona-error">{error}</p>}

          <button type="submit" className="dona-modal__submit" disabled={enviando}>
            {enviando ? "Procesando…" : `Donar ${formatearMonto(Number(monto) || 0)}`}
          </button>
        </form>

        <p className="dona-modal__note">
          Demo académica: el pago es simulado y los datos de la tarjeta no se envían ni
          se guardan en ningún servidor.
        </p>
      </div>
    </div>
  );
}
