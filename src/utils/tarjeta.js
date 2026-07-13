// Utilidades del formulario de tarjeta simulado (los datos nunca se envían).

// Agrupa el número en bloques de 4 dígitos: "0000 0000 0000 0000"
export function formatearNumeroTarjeta(valor) {
  const digitos = valor.replace(/\D/g, "").slice(0, 16);
  return digitos.match(/.{1,4}/g)?.join(" ") ?? digitos;
}

// Formatea MM/AA mientras se escribe: inserta la "/" automáticamente
// y limita el mes a 01-12.
export function formatearVencimiento(valor) {
  let digitos = valor.replace(/\D/g, "").slice(0, 4);
  if (digitos.length === 0) return "";

  // Si el primer dígito es 2-9 solo puede ser un mes de un dígito: 02, 03, …
  if (digitos[0] > "1") {
    digitos = "0" + digitos;
  }

  if (digitos.length >= 2) {
    let mes = digitos.slice(0, 2);
    if (mes === "00") mes = "01";
    if (Number(mes) > 12) mes = "12";
    digitos = mes + digitos.slice(2);
  }

  // La "/" aparece al escribir el tercer dígito (así borrar no se traba)
  return digitos.length > 2 ? `${digitos.slice(0, 2)}/${digitos.slice(2)}` : digitos;
}

// Devuelve un mensaje de error, o null si la fecha MM/AA es válida y futura
// (la tarjeta vale hasta el último día de su mes).
export function validarVencimiento(valor) {
  const m = valor.match(/^(\d{2})\/(\d{2})$/);
  if (!m) return "Ingresa el vencimiento en formato MM/AA";

  const mes = Number(m[1]);
  const anio = 2000 + Number(m[2]);
  if (mes < 1 || mes > 12) return "El mes debe estar entre 01 y 12";

  const ahora = new Date();
  const anioActual = ahora.getFullYear();
  const mesActual = ahora.getMonth() + 1;
  if (anio < anioActual || (anio === anioActual && mes < mesActual)) {
    return "La tarjeta está vencida: usa una fecha futura";
  }
  return null;
}
