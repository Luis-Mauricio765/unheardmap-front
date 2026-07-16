import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { obtenerReporte, votar, quitarVoto } from "../api/reportes";
import { listarComentarios, crearComentario } from "../api/comentarios";
import { crearDenuncia } from "../api/denuncias";
import { eliminarComentarioAdmin } from "../api/admin";
import { labelDeTipo, colorDeTipo } from "../utils/crimeTypes";
import { formatearFechaRelativa, formatearFechaCompleta } from "../utils/dateHelpers";
import { useAuth } from "../context/AuthContext";
import AdPlaceholder from "./AdPlaceholder";
import "./ReportDetailPanel.css";

const MOTIVOS_DENUNCIA = [
  { value: "INFORMACION_FALSA", label: "Información falsa" },
  { value: "SPAM", label: "Spam" },
  { value: "CONTENIDO_OFENSIVO", label: "Contenido ofensivo" },
  { value: "OTRO", label: "Otro" },
];

export default function ReportDetailPanel({ reporteId, onClose, onCambio }) {
  const { isAuthenticated, esMiembro, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [reporte, setReporte] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [votando, setVotando] = useState(false);

  // Comentarios
  const [comentarios, setComentarios] = useState([]);
  const [nuevoComentario, setNuevoComentario] = useState("");
  const [comentando, setComentando] = useState(false);

  // Denuncia
  const [denunciaAbierta, setDenunciaAbierta] = useState(false);
  const [motivoDenuncia, setMotivoDenuncia] = useState("INFORMACION_FALSA");
  const [detalleDenuncia, setDetalleDenuncia] = useState("");
  const [denunciaMensaje, setDenunciaMensaje] = useState(null);

  useEffect(() => {
    if (!reporteId) return;
    setCargando(true);
    setError(null);
    setComentarios([]);
    setNuevoComentario("");
    setDenunciaAbierta(false);
    setDetalleDenuncia("");
    setDenunciaMensaje(null);

    obtenerReporte(reporteId)
      .then(setReporte)
      .catch(() => setError("No se pudo cargar el reporte"))
      .finally(() => setCargando(false));

    if (esMiembro) {
      listarComentarios(reporteId)
        .then(setComentarios)
        .catch(() => {});
    }
  }, [reporteId, esMiembro]);

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

  async function manejarComentar(e) {
    e.preventDefault();
    const texto = nuevoComentario.trim();
    if (!texto || comentando) return;
    setComentando(true);
    try {
      const creado = await crearComentario(reporteId, texto);
      setComentarios((prev) => [...prev, creado]);
      setNuevoComentario("");
    } catch {
      setError("No se pudo publicar el comentario");
    } finally {
      setComentando(false);
    }
  }

  async function manejarEliminarComentario(id) {
    if (!window.confirm("¿Eliminar este comentario?")) return;
    try {
      await eliminarComentarioAdmin(id);
      setComentarios((prev) => prev.filter((c) => c.id !== id));
    } catch {
      setError("No se pudo eliminar el comentario");
    }
  }

  async function manejarDenunciar(e) {
    e.preventDefault();
    setDenunciaMensaje(null);
    try {
      await crearDenuncia(reporteId, motivoDenuncia, detalleDenuncia.trim());
      setDenunciaMensaje({ tipo: "ok", texto: "Denuncia enviada. Un administrador la revisará." });
      setDenunciaAbierta(false);
      setDetalleDenuncia("");
    } catch (err) {
      setDenunciaMensaje({
        tipo: "error",
        texto: err.response?.data?.mensaje || "No se pudo enviar la denuncia",
      });
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

          {reporte.cercaUsuario != null && (
            <p
              className={`detail-panel__ubicacion ${
                reporte.cercaUsuario ? "is-cerca" : "is-lejos"
              }`}
            >
              {reporte.cercaUsuario
                ? "Incidente dentro de la ubicación del usuario"
                : "Incidente lejos de la ubicación del usuario"}
            </p>
          )}

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

            {esMiembro && (
              <button
                className="detail-panel__denunciar"
                onClick={() => setDenunciaAbierta((v) => !v)}
              >
                ⚑ Denunciar
              </button>
            )}
          </div>

          {!isAuthenticated && (
            <p className="detail-panel__hint">Inicia sesión para valorar este reporte.</p>
          )}

          {denunciaAbierta && (
            <form className="detail-panel__denuncia-form" onSubmit={manejarDenunciar}>
              <label htmlFor="motivo-denuncia">Motivo</label>
              <select
                id="motivo-denuncia"
                value={motivoDenuncia}
                onChange={(e) => setMotivoDenuncia(e.target.value)}
              >
                {MOTIVOS_DENUNCIA.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
              <textarea
                rows={2}
                maxLength={500}
                placeholder="Detalle (opcional)"
                value={detalleDenuncia}
                onChange={(e) => setDetalleDenuncia(e.target.value)}
              />
              <button type="submit">Enviar denuncia</button>
            </form>
          )}

          {denunciaMensaje && (
            <p
              className={`detail-panel__denuncia-msg ${
                denunciaMensaje.tipo === "error" ? "is-error" : "is-ok"
              }`}
            >
              {denunciaMensaje.texto}
            </p>
          )}

          <section className="detail-panel__comentarios">
            <h4>Comentarios</h4>

            {esMiembro ? (
              <>
                <ul className="detail-panel__comentarios-lista">
                  {comentarios.map((c) => (
                    <li key={c.id}>
                      <div className="detail-panel__comentario-head">
                        <span className="detail-panel__comentario-autor">Anónimo</span>
                        <span className="detail-panel__comentario-fecha">
                          {formatearFechaRelativa(c.creadoEn)}
                        </span>
                        {isAdmin && (
                          <button
                            className="detail-panel__comentario-borrar"
                            onClick={() => manejarEliminarComentario(c.id)}
                            title="Eliminar comentario"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                      <p>{c.texto}</p>
                    </li>
                  ))}
                  {comentarios.length === 0 && (
                    <li className="detail-panel__comentarios-vacio">
                      Sé el primero en comentar.
                    </li>
                  )}
                </ul>

                <form className="detail-panel__comentario-form" onSubmit={manejarComentar}>
                  <textarea
                    rows={2}
                    maxLength={500}
                    placeholder="Escribe un comentario anónimo…"
                    value={nuevoComentario}
                    onChange={(e) => setNuevoComentario(e.target.value)}
                  />
                  <button type="submit" disabled={comentando || !nuevoComentario.trim()}>
                    {comentando ? "Publicando…" : "Comentar"}
                  </button>
                </form>
              </>
            ) : (
              <button
                className="detail-panel__comentarios-bloqueado"
                onClick={() => navigate("/pagoMembresia")}
              >
                🔒 Los comentarios son exclusivos para miembros.
                <span>Hazte miembro →</span>
              </button>
            )}
          </section>

          {!esMiembro && <AdPlaceholder variante="card" />}
        </>
      )}
    </aside>
  );
}
