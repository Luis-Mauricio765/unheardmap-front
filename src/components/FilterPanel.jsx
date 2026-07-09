import { TIPOS_LISTA } from "../utils/crimeTypes";
import "./FilterPanel.css";

export default function FilterPanel({ filtroTipo, onChangeFiltro }) {
  return (
    <div className="filter-panel">
      <div className="filter-panel__header">
        <h2>Reportes</h2>
        <span className="filter-panel__subtitle">Filtra por tipo de incidente</span>
      </div>

      <div className="filter-panel__chips">
        <button
          className={`chip ${!filtroTipo ? "chip--active" : ""}`}
          onClick={() => onChangeFiltro(null)}
        >
          Todos
        </button>
        {TIPOS_LISTA.map((t) => (
          <button
            key={t.value}
            className={`chip ${filtroTipo === t.value ? "chip--active" : ""}`}
            onClick={() => onChangeFiltro(t.value)}
          >
            <span className="chip__dot" style={{ background: t.hex }} />
            {t.label}
          </button>
        ))}
      </div>

      <div className="filter-panel__legend">
        <div className="legend-item">
          <span className="legend-ring legend-ring--red" />
          Menos de 24 horas
        </div>
        <div className="legend-item">
          <span className="legend-ring legend-ring--yellow" />
          Entre 1 y 7 días
        </div>
      </div>
    </div>
  );
}
