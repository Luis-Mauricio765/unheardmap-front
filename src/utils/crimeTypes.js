// Catálogo único de tipos de delito: color, etiqueta e ícono (emoji ligero, sin dependencias extra)
export const TIPOS_DELITO = {
  ROBO: { label: "Robo", color: "var(--tipo-robo)", hex: "#e74c3c" },
  EXTORSION: { label: "Extorsión", color: "var(--tipo-extorsion)", hex: "#9b59b6" },
  ASALTO: { label: "Asalto", color: "var(--tipo-asalto)", hex: "#e67e22" },
  VANDALISMO: { label: "Vandalismo", color: "var(--tipo-vandalismo)", hex: "#f1c40f" },
  ACOSO: { label: "Acoso", color: "var(--tipo-acoso)", hex: "#ec4899" },
  FRAUDE: { label: "Fraude", color: "var(--tipo-fraude)", hex: "#34495e" },
  OTRO: { label: "Otro", color: "var(--tipo-otro)", hex: "#7f8c8d" },
};

export const TIPOS_LISTA = Object.entries(TIPOS_DELITO).map(([value, data]) => ({
  value,
  ...data,
}));

export function colorDeTipo(tipo) {
  return TIPOS_DELITO[tipo]?.hex ?? TIPOS_DELITO.OTRO.hex;
}

export function labelDeTipo(tipo) {
  return TIPOS_DELITO[tipo]?.label ?? "Otro";
}
