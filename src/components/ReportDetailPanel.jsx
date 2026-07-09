import { useEffect, useState } from "react";
import { obtenerReporte, votar, quitarVoto, eliminarReporte } from "../api/reportes";
import { labelDeTipo, colorDeTipo } from "../utils/crimeTypes";
import { formatearFechaRelativa, formatearFechaCompleta } from "../utils/dateHelpers";
import { useAuth } from "../context/AuthContext";
import "./ReportDetailPanel.css";

export default function ReportDetailPanel({ reporteId, onClose, onCambio }) {
  const { isAuthenticated } = useAuth();
  const [reporte, setReporte] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [votando, setVotando] = useState(false);

  useEffect(() => {
    if (!reporteId) return;
    setCargando(true);
    setError(null);
    obtenerReporte(reporteId)
      .then(setReporte)
      .catch(() => setError("No se pudo cargar el reporte"))
      .finally(() => setCargando(false));
  }, [reporteId]);

  async function manejarVoto(valor) {
    if (!isAuthenticated || votando) return;
    setVotando(true);
    try {
      if (reporte.miVoto === valor) {
        const { puntuacion } = await quitarVoto(reporteId);
        setReporte((r) => ({ ...r, puntuacion, miVoto: null }));
      } else {
        const { puntuacion } = await votar(reporteId, valor);
        setReporte((r) => ({ ...r, puntuacion, miVoto: valor }));
      }
      onCambio?.();
    } catch {
      setError("No se pudo registrar tu voto");
    } finally {
      setVotando(false);
    }
  }

  return (
    <aside className={`detail-panel ${reporteId ? "is-open" : ""}`}>
      {cargando && <div className="detail-panel__loading">Cargando reporte…</div>}

      {error && <div className="detail-panel__error">{error}</div>}

      {reporte && !cargando && (
        <>
          <button className="detail-panel__close" onClick={onClose} aria-label="Cerrar">
            ✕
          </button>

          <div className="detail-panel__badge" style={{ background: colorDeTipo(reporte.tipo) }}>
            {labelDeTipo(reporte.tipo)}
          </div>

          <h3 className="detail-panel__title">Reporte anónimo</h3>
          <p className="detail-panel__meta mono">
            Suceso: {formatearFechaCompleta(reporte.fechaSuceso)}
          </p>
          <p className="detail-panel__relative">{formatearFechaRelativa(reporte.fechaSuceso)}</p>

          <p className="detail-panel__descripcion">{reporte.descripcion}</p>

          <div className="detail-panel__votes">
            <button
              className={`vote-btn ${reporte.miVoto === 1 ? "vote-btn--up-active" : ""}`}
              disabled={!isAuthenticated || votando}
              onClick={() => manejarVoto(1)}
              title={isAuthenticated ? "Confirmar" : "Inicia sesión para votar"}
            >
              ▲
            </button>
            <span className="detail-panel__score mono">{reporte.puntuacion}</span>
            <button
              className={`vote-btn ${reporte.miVoto === -1 ? "vote-btn--down-active" : ""}`}
              disabled={!isAuthenticated || votando}
              onClick={() => manejarVoto(-1)}
              title={isAuthenticated ? "Poner en duda" : "Inicia sesión para votar"}
            >
              ▼
            </button>
          </div>

          {!isAuthenticated && (
            <p className="detail-panel__hint">Inicia sesión para valorar este reporte.</p>
          )}
        </>
      )}
    </aside>
  );
}
