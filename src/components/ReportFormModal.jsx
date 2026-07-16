import { useState } from "react";
import { TIPOS_LISTA } from "../utils/crimeTypes";
import { maxFechaInput } from "../utils/dateHelpers";
import { crearReporte } from "../api/reportes";
import "./ReportFormModal.css";

export default function ReportFormModal({ ubicacion, cercaUsuario = null, onClose, onCreado }) {
  const [tipo, setTipo] = useState("ROBO");
  const [descripcion, setDescripcion] = useState("");
  const [fechaSuceso, setFechaSuceso] = useState(maxFechaInput());
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState(null);

  async function manejarSubmit(e) {
    e.preventDefault();
    if (!ubicacion) {
      setError("Haz clic en el mapa para marcar la ubicación del suceso");
      return;
    }
    if (descripcion.trim().length < 10) {
      setError("Describe el suceso con al menos 10 caracteres");
      return;
    }

    setEnviando(true);
    setError(null);
    try {
      await crearReporte({
        latitud: ubicacion.lat,
        longitud: ubicacion.lng,
        tipo,
        descripcion: descripcion.trim(),
        fechaSuceso: new Date(fechaSuceso).toISOString(),
        cercaUsuario,
      });
      onCreado();
    } catch (err) {
      setError(err.response?.data?.mensaje || "No se pudo publicar el reporte");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal__header">
          <h3>Nuevo reporte</h3>
          <button className="modal__close" onClick={onClose} aria-label="Cerrar">
            ✕
          </button>
        </div>

        <p className="modal__subtitle">
          Tu identidad nunca se muestra junto al reporte. Se publica de forma anónima.
        </p>

        <form onSubmit={manejarSubmit} className="modal__form">
          <label className="field">
            <span>Tipo de incidente</span>
            <div className="field__grid">
              {TIPOS_LISTA.map((t) => (
                <button
                  type="button"
                  key={t.value}
                  className={`type-option ${tipo === t.value ? "type-option--active" : ""}`}
                  onClick={() => setTipo(t.value)}
                >
                  <span className="type-option__dot" style={{ background: t.hex }} />
                  {t.label}
                </button>
              ))}
            </div>
          </label>

          <label className="field">
            <span>Ubicación</span>
            <div className="field__location mono">
              {ubicacion
                ? `${ubicacion.lat.toFixed(5)}, ${ubicacion.lng.toFixed(5)}`
                : "Cierra este formulario y haz clic en el mapa"}
            </div>
          </label>

          <label className="field">
            <span>Fecha y hora del suceso</span>
            <input
              type="datetime-local"
              value={fechaSuceso}
              max={maxFechaInput()}
              onChange={(e) => setFechaSuceso(e.target.value)}
              required
            />
          </label>

          <label className="field">
            <span>Descripción</span>
            <textarea
              rows={4}
              maxLength={1000}
              placeholder="Describe qué ocurrió, con el mayor detalle posible..."
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              required
            />
            <span className="field__counter mono">{descripcion.length}/1000</span>
          </label>

          {error && <p className="modal__error">{error}</p>}

          <button type="submit" className="modal__submit" disabled={enviando}>
            {enviando ? "Publicando…" : "Publicar reporte anónimo"}
          </button>
        </form>
      </div>
    </div>
  );
}
