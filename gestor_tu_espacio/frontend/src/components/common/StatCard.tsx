type StatCardProps = {
  label: string;
  value: string | number;
  help: string;
};

export function StatCard({ label, value, help }: StatCardProps) {
  return (
    <article className="stat-card">
      <div className="stat-card__label">{label}</div>
      <div className="stat-card__value">{value}</div>
      <div className="stat-card__help">{help}</div>
    </article>
  );
}
