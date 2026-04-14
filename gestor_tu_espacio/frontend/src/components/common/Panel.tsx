import type { ReactNode } from "react";

type PanelProps = {
  title?: string;
  subtitle?: string;
  children: ReactNode;
};

export function Panel({ title, subtitle, children }: PanelProps) {
  return (
    <section className="panel">
      {(title || subtitle) && (
        <div className="panel__header">
          {title ? <h2 className="panel__title">{title}</h2> : null}
          {subtitle ? <p className="panel__subtitle">{subtitle}</p> : null}
        </div>
      )}
      {children}
    </section>
  );
}
