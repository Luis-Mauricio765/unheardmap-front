import api from "./client";

export async function listarUsuarios() {
  const { data } = await api.get("/api/admin/usuarios");
  return data;
}

export async function cambiarEstadoUsuario(id, activo) {
  const { data } = await api.patch(`/api/admin/usuarios/${id}/activo`, null, {
    params: { activo },
  });
  return data;
}

export async function listarTodosReportes() {
  const { data } = await api.get("/api/admin/reportes");
  return data;
}

export async function eliminarReporteAdmin(id) {
  await api.delete(`/api/admin/reportes/${id}`);
}

export async function listarDenuncias() {
  const { data } = await api.get("/api/admin/denuncias");
  return data;
}

export async function descartarDenuncia(id) {
  await api.delete(`/api/admin/denuncias/${id}`);
}

export async function listarComentariosAdmin() {
  const { data } = await api.get("/api/admin/comentarios");
  return data;
}

export async function eliminarComentarioAdmin(id) {
  await api.delete(`/api/admin/comentarios/${id}`);
}
