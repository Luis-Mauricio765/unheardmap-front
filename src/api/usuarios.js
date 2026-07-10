import api from "./client";

export async function obtenerMe() {
  const { data } = await api.get("/api/usuarios/me");
  return data; // { id, username, rol, esMiembro, miembroHasta }
}
