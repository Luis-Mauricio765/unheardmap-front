import api from "./client";

// Pago simulado: no se envía ningún dato de tarjeta al backend
export async function pagarMembresia() {
  const { data } = await api.post("/api/membresias/pagar");
  return data; // { esMiembro, miembroHasta }
}
