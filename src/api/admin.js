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
