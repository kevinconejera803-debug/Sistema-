import { EmptyState } from "../components/common/EmptyState";
import { PageHeader } from "../components/common/PageHeader";
import { Panel } from "../components/common/Panel";
import { useAsyncValue } from "../hooks/useAsyncData";
import { getNews } from "../services/newsService";

export function NewsPage() {
  const { value: payload, error } = useAsyncValue(getNews, "No se pudieron cargar las noticias.");
  const items = payload?.items ?? [];

  return (
    <div className="page">
      <PageHeader
        eyebrow="Fuentes"
        title="Noticias curadas"
        description="El frontend consume un contrato de API claro y el backend mantiene cache y parsing RSS encapsulados."
      />

      <Panel title="Ultimos titulares" subtitle="Resumen por medio y categoria">
        {error ? (
          <EmptyState title="Sin noticias" description={error} />
        ) : items.length === 0 ? (
          <EmptyState title="Nada por mostrar" description="Todavia no hay titulares disponibles." />
        ) : (
          <div className="news-list">
            {items.map((item) => (
              <a key={`${item.source}-${item.title}`} className="news-item" href={item.link} target="_blank" rel="noreferrer">
                <small>{item.region_label}</small>
                <strong>{item.title}</strong>
                <p>{item.summary}</p>
                <span>{item.source}</span>
              </a>
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
}
