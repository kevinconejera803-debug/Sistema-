import { EmptyState } from "../components/common/EmptyState";
import { PageHeader } from "../components/common/PageHeader";
import { Panel } from "../components/common/Panel";
import { useAsyncValue } from "../hooks/useAsyncData";
import { getMarkets } from "../services/marketsService";

export function MarketsPage() {
  const { value: payload, error } = useAsyncValue(getMarkets, "No se pudieron cargar los mercados.");
  const rows = payload?.rows ?? [];

  return (
    <div className="page">
      <PageHeader
        eyebrow="Mercados"
        title="Seguimiento financiero"
        description="Datos servidos desde Flask con cache simple y presentacion limpia en React."
      />

      <Panel title="Cotizaciones" subtitle="Vista resumida de los simbolos seguidos">
        {error ? (
          <EmptyState title="Sin cotizaciones" description={error} />
        ) : (
          <div className="market-grid">
            {rows.map((row) => (
              <article key={row.symbol} className="market-card">
                <small>{row.symbol}</small>
                <strong>{row.price_fmt ?? row.price.toFixed(2)}</strong>
                <span className={row.chg_pct >= 0 ? "pill pill--success" : "pill pill--danger"}>
                  {row.chg_fmt ?? `${row.chg_pct.toFixed(2)}%`}
                </span>
              </article>
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
}
