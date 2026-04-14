import { Link } from "react-router-dom";
import { EmptyState } from "../components/common/EmptyState";
import { PageHeader } from "../components/common/PageHeader";
import { Panel } from "../components/common/Panel";
import { StatCard } from "../components/common/StatCard";
import { useAsyncValue } from "../hooks/useAsyncData";
import { navigation } from "../navigation";
import { getStats } from "../services/systemService";

export function HomePage() {
  const { value: stats, error } = useAsyncValue(getStats, "No se pudieron cargar las metricas.");

  return (
    <div className="page">
      <PageHeader
        eyebrow="Sistema organizado"
        title="Una base limpia para seguir creciendo"
        description="El proyecto ahora separa backend Flask, frontend React y acceso a datos con una estructura lista para portfolio o despliegue."
      />

      <section className="hero-grid">
        <Panel title="Estado del workspace" subtitle="Metricas vivas desde el backend">
          {stats ? (
            <div className="stats-grid">
              <StatCard label="Eventos" value={stats.events} help="Agenda activa" />
              <StatCard label="Contactos" value={stats.contacts} help="Red disponible" />
              <StatCard label="Tareas" value={stats.assignments} help="Flujo academico" />
              <StatCard label="Total" value={stats.total} help="Items persistidos" />
            </div>
          ) : error ? (
            <EmptyState title="Metricas no disponibles" description={error} />
          ) : (
            <div className="loading-copy">Cargando metricas del backend...</div>
          )}
        </Panel>

        <Panel title="Principios aplicados" subtitle="Decisiones que hacen al proyecto mas sostenible">
          <ul className="bullet-list">
            <li>Separacion nitida entre rutas, servicios, modelos y configuracion.</li>
            <li>Frontend con paginas, componentes reutilizables y servicios de API desacoplados.</li>
            <li>SQLite bajo SQLAlchemy con ruta configurable para evolucionar a otro motor sin reescribir el dominio.</li>
          </ul>
        </Panel>
      </section>

      <Panel title="Modulos" subtitle="Accesos principales del producto">
        <div className="module-grid">
          {navigation
            .filter((item) => item.path !== "/")
            .map((item) => (
              <Link key={item.path} to={item.path} className="module-card">
                <span className="module-card__badge">{item.badge}</span>
                <h3>{item.label}</h3>
                <p>{item.description}</p>
              </Link>
            ))}
        </div>
      </Panel>
    </div>
  );
}
