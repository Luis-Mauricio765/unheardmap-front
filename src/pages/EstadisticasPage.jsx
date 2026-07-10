import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import Navbar from "../components/Navbar";
import { obtenerSerie, obtenerPorTipo, obtenerForo } from "../api/miembros";
import { TIPOS_DELITO, labelDeTipo, colorDeTipo } from "../utils/crimeTypes";
import { formatearFechaRelativa } from "../utils/dateHelpers";
import "./Estadisticas.css";

const GRANULARIDADES = [
  { value: "dia", label: "Día" },
  { value: "semana", label: "Semana" },
  { value: "mes", label: "Mes" },
  { value: "anio", label: "Año" },
];

const ORDENES_FORO = [
  { value: "RECIENTE", label: "Más recientes" },
  { value: "ANTIGUO", label: "Más antiguos" },
  { value: "MAS_VOTADO", label: "Más votados" },
  { value: "MENOS_VOTADO", label: "Menos votados" },
];

export default function EstadisticasPage() {
  const [granularidad, setGranularidad] = useState("dia");
  const [serie, setSerie] = useState([]);
  const [porTipo, setPorTipo] = useState([]);
  const [orden, setOrden] = useState("RECIENTE");
  const [foro, setForo] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    obtenerSerie(granularidad)
      .then(setSerie)
      .catch(() => setError("No se pudo cargar la serie temporal"));
  }, [granularidad]);

  useEffect(() => {
    obtenerPorTipo()
      .then(setPorTipo)
      .catch(() => setError("No se pudieron cargar las estadísticas por tipo"));
  }, []);

  useEffect(() => {
    obtenerForo(orden)
      .then(setForo)
      .catch(() => setError("No se pudo cargar el foro"));
  }, [orden]);

  const totalReportes = porTipo.reduce((acc, t) => acc + t.total, 0);
  const tipoMasComun = porTipo[0]?.tipo ?? null;

  const datosTipo = porTipo.map((t) => ({
    name: labelDeTipo(t.tipo),
    value: t.total,
    hex: TIPOS_DELITO[t.tipo]?.hex ?? TIPOS_DELITO.OTRO.hex,
  }));

  return (
    <div className="stats-page">
      <Navbar />

      <div className="stats-page__body">
        <header className="stats-page__header">
          <h1>Estadísticas</h1>
          <p className="stats-page__subtitle">
            Panel exclusivo para miembros de Unheard Map
          </p>
        </header>

        {error && <p className="stats-error">{error}</p>}

        <div className="stats-cards">
          <div className="stats-card stats-card--kpi">
            <span className="stats-card__kpi-valor">{totalReportes}</span>
            <span className="stats-card__kpi-label">Reportes totales</span>
          </div>
          <div className="stats-card stats-card--kpi">
            <span
              className="stats-card__kpi-valor"
              style={{ color: tipoMasComun ? colorDeTipo(tipoMasComun) : undefined }}
            >
              {tipoMasComun ? labelDeTipo(tipoMasComun) : "—"}
            </span>
            <span className="stats-card__kpi-label">Delito más reportado</span>
          </div>
        </div>

        <div className="stats-grid">
          <div className="stats-card">
            <div className="stats-card__head">
              <h2>Reportes en el tiempo</h2>
              <div className="stats-toggle">
                {GRANULARIDADES.map((g) => (
                  <button
                    key={g.value}
                    className={granularidad === g.value ? "is-active" : ""}
                    onClick={() => setGranularidad(g.value)}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={serie} margin={{ top: 10, right: 20, bottom: 0, left: -10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(127,140,141,0.2)" />
                <XAxis dataKey="periodo" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="total"
                  name="Reportes"
                  stroke="#17a2a0"
                  strokeWidth={2.5}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="stats-card">
            <div className="stats-card__head">
              <h2>Reportes por tipo</h2>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={datosTipo}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={55}
                  outerRadius={95}
                  paddingAngle={2}
                >
                  {datosTipo.map((d) => (
                    <Cell key={d.name} fill={d.hex} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="stats-card stats-card--wide">
            <div className="stats-card__head">
              <h2>Comparativa por tipo</h2>
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={datosTipo} margin={{ top: 10, right: 20, bottom: 0, left: -10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(127,140,141,0.2)" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="value" name="Reportes" radius={[6, 6, 0, 0]}>
                  {datosTipo.map((d) => (
                    <Cell key={d.name} fill={d.hex} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <section className="stats-foro">
          <div className="stats-card__head">
            <h2>Foro de reportes</h2>
            <select
              className="stats-foro__orden"
              value={orden}
              onChange={(e) => setOrden(e.target.value)}
            >
              {ORDENES_FORO.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          <ul className="stats-foro__lista">
            {foro.map((r) => (
              <li key={r.id} className="stats-foro__item">
                <span
                  className="stats-foro__badge"
                  style={{ background: colorDeTipo(r.tipo) }}
                >
                  {labelDeTipo(r.tipo)}
                </span>
                <div className="stats-foro__contenido">
                  <p className="stats-foro__descripcion">{r.descripcion}</p>
                  <span className="stats-foro__meta">
                    {formatearFechaRelativa(r.fechaSuceso)}
                  </span>
                </div>
                <span
                  className={`stats-foro__puntos ${r.puntuacion < 0 ? "is-neg" : ""}`}
                >
                  {r.puntuacion > 0 ? `+${r.puntuacion}` : r.puntuacion}
                </span>
              </li>
            ))}
            {foro.length === 0 && (
              <li className="stats-foro__vacio">Aún no hay reportes.</li>
            )}
          </ul>
        </section>
      </div>
    </div>
  );
}
