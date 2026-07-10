import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  listarUsuarios,
  cambiarEstadoUsuario,
  listarTodosReportes,
  eliminarReporteAdmin,
  listarDenuncias,
  descartarDenuncia,
  listarComentariosAdmin,
  eliminarComentarioAdmin,
} from "../api/admin";
import { labelDeTipo } from "../utils/crimeTypes";
import { formatearFechaCompleta } from "../utils/dateHelpers";
import "./AdminDashboard.css";

const MOTIVOS = {
  INFORMACION_FALSA: "Información falsa",
  SPAM: "Spam",
  CONTENIDO_OFENSIVO: "Contenido ofensivo",
  OTRO: "Otro",
};

export default function AdminDashboardPage() {
  const { username } = useAuth();
  const [tab, setTab] = useState("reportes");

  const [reportes, setReportes] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [denuncias, setDenuncias] = useState([]);
  const [comentarios, setComentarios] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);

  const cargar = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      const [rs, us, ds, cs] = await Promise.all([
        listarTodosReportes(),
        listarUsuarios(),
        listarDenuncias(),
        listarComentariosAdmin(),
      ]);
      setReportes(rs);
      setUsuarios(us);
      setDenuncias(ds);
      setComentarios(cs);
    } catch {
      setError("No se pudo cargar la información del panel de administración");
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  async function manejarEliminarReporte(id) {
    if (!window.confirm(`¿Eliminar el reporte #${id}? Esta acción no se puede deshacer.`)) return;
    try {
      await eliminarReporteAdmin(id);
      setReportes((prev) => prev.filter((r) => r.id !== id));
    } catch {
      setError("No se pudo eliminar el reporte");
    }
  }

  async function manejarCambiarEstado(usuario) {
    const nuevoEstado = !usuario.activo;
    const accion = nuevoEstado ? "desbanear" : "banear";
    if (!window.confirm(`¿Seguro que quieres ${accion} a @${usuario.username}?`)) return;
    try {
      const actualizado = await cambiarEstadoUsuario(usuario.id, nuevoEstado);
      setUsuarios((prev) => prev.map((u) => (u.id === usuario.id ? actualizado : u)));
    } catch {
      setError("No se pudo actualizar el estado del usuario");
    }
  }

  async function manejarEliminarReporteDenunciado(denuncia) {
    if (
      !window.confirm(
        `¿Eliminar el reporte #${denuncia.reporteId}? Se borrarán también sus denuncias y comentarios.`
      )
    )
      return;
    try {
      await eliminarReporteAdmin(denuncia.reporteId);
      setDenuncias((prev) => prev.filter((d) => d.reporteId !== denuncia.reporteId));
      setReportes((prev) => prev.filter((r) => r.id !== denuncia.reporteId));
      setComentarios((prev) => prev.filter((c) => c.reporteId !== denuncia.reporteId));
    } catch {
      setError("No se pudo eliminar el reporte denunciado");
    }
  }

  async function manejarDescartarDenuncia(id) {
    if (!window.confirm("¿Descartar esta denuncia? El reporte se mantiene.")) return;
    try {
      await descartarDenuncia(id);
      setDenuncias((prev) => prev.filter((d) => d.id !== id));
    } catch {
      setError("No se pudo descartar la denuncia");
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

  return (
    <div className="admin-page">
      <header className="admin-page__header">
        <h1>Panel de administración</h1>
        <p className="admin-page__subtitle">Sesión de @{username}</p>
      </header>

      <div className="admin-tabs">
        <button
          className={tab === "reportes" ? "is-active" : ""}
          onClick={() => setTab("reportes")}
        >
          Reportes ({reportes.length})
        </button>
        <button
          className={tab === "usuarios" ? "is-active" : ""}
          onClick={() => setTab("usuarios")}
        >
          Usuarios ({usuarios.length})
        </button>
        <button
          className={tab === "denuncias" ? "is-active" : ""}
          onClick={() => setTab("denuncias")}
        >
          Denuncias ({denuncias.length})
        </button>
        <button
          className={tab === "comentarios" ? "is-active" : ""}
          onClick={() => setTab("comentarios")}
        >
          Comentarios ({comentarios.length})
        </button>
      </div>

      {error && <p className="admin-error">{error}</p>}
      {cargando && <p className="admin-loading">Cargando…</p>}

      {!cargando && tab === "reportes" && (
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Tipo</th>
              <th>Descripción</th>
              <th>Publicado por</th>
              <th>Puntuación</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {reportes.map((r) => (
              <tr key={r.id}>
                <td>{r.id}</td>
                <td>{labelDeTipo(r.tipo)}</td>
                <td className="admin-table__descripcion">{r.descripcion}</td>
                <td>@{r.usuarioUsername}</td>
                <td>{r.puntuacion}</td>
                <td>
                  <button className="admin-btn admin-btn--danger" onClick={() => manejarEliminarReporte(r.id)}>
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
            {reportes.length === 0 && (
              <tr>
                <td colSpan={6}>No hay reportes.</td>
              </tr>
            )}
          </tbody>
        </table>
      )}

      {!cargando && tab === "usuarios" && (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Usuario</th>
              <th>Rol</th>
              <th>Publicaciones</th>
              <th>Estado</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((u) => (
              <tr key={u.id}>
                <td>@{u.username}</td>
                <td>{u.rol}</td>
                <td>{u.totalReportes}</td>
                <td>
                  <span className={`admin-status ${u.activo ? "is-active" : "is-banned"}`}>
                    {u.activo ? "Activo" : "Baneado"}
                  </span>
                </td>
                <td>
                  {u.username === username ? (
                    <span className="admin-note">(tú)</span>
                  ) : (
                    <button
                      className={`admin-btn ${u.activo ? "admin-btn--danger" : "admin-btn--ok"}`}
                      onClick={() => manejarCambiarEstado(u)}
                    >
                      {u.activo ? "Banear" : "Desbanear"}
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {usuarios.length === 0 && (
              <tr>
                <td colSpan={5}>No hay usuarios.</td>
              </tr>
            )}
          </tbody>
        </table>
      )}

      {!cargando && tab === "denuncias" && (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Motivo</th>
              <th>Detalle</th>
              <th>Denunciante</th>
              <th>Reporte</th>
              <th>Fecha</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {denuncias.map((d) => (
              <tr key={d.id}>
                <td>{MOTIVOS[d.motivo] ?? d.motivo}</td>
                <td className="admin-table__descripcion">{d.detalle || "—"}</td>
                <td>@{d.denuncianteUsername}</td>
                <td className="admin-table__descripcion">
                  #{d.reporteId} · {labelDeTipo(d.reporteTipo)} · {d.reporteDescripcion}
                </td>
                <td>{formatearFechaCompleta(d.creadoEn)}</td>
                <td>
                  <div className="admin-acciones">
                    <button
                      className="admin-btn admin-btn--danger"
                      onClick={() => manejarEliminarReporteDenunciado(d)}
                    >
                      Eliminar reporte
                    </button>
                    <button
                      className="admin-btn admin-btn--neutral"
                      onClick={() => manejarDescartarDenuncia(d.id)}
                    >
                      Descartar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {denuncias.length === 0 && (
              <tr>
                <td colSpan={6}>No hay denuncias pendientes.</td>
              </tr>
            )}
          </tbody>
        </table>
      )}

      {!cargando && tab === "comentarios" && (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Comentario</th>
              <th>Autor</th>
              <th>Reporte</th>
              <th>Fecha</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {comentarios.map((c) => (
              <tr key={c.id}>
                <td className="admin-table__descripcion">{c.texto}</td>
                <td>@{c.usuarioUsername}</td>
                <td>#{c.reporteId}</td>
                <td>{formatearFechaCompleta(c.creadoEn)}</td>
                <td>
                  <button
                    className="admin-btn admin-btn--danger"
                    onClick={() => manejarEliminarComentario(c.id)}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
            {comentarios.length === 0 && (
              <tr>
                <td colSpan={5}>No hay comentarios.</td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
