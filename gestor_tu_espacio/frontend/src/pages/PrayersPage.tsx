import { type FormEvent, useEffect, useState } from "react";
import { EmptyState } from "../components/common/EmptyState";
import { PageHeader } from "../components/common/PageHeader";
import { Panel } from "../components/common/Panel";
import type { PrayerItem } from "../types";

const STORAGE_KEY = "tu-espacio-prayers";

const defaultItems: PrayerItem[] = [
  { id: 1, title: "Por mi familia", description: "Salud y unidad", status: "answered" },
  { id: 2, title: "Por mi trabajo", description: "Disciplina y enfoque", status: "in_progress" }
];

export function PrayersPage() {
  const [items, setItems] = useState<PrayerItem[]>(defaultItems);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    const persisted = window.localStorage.getItem(STORAGE_KEY);
    if (persisted) {
      setItems(JSON.parse(persisted) as PrayerItem[]);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!title.trim()) {
      return;
    }

    setItems((previous) => [
      {
        id: Date.now(),
        title: title.trim(),
        description: description.trim(),
        status: "pending"
      },
      ...previous
    ]);
    setTitle("");
    setDescription("");
  }

  function cycleStatus(item: PrayerItem) {
    const nextStatus =
      item.status === "pending" ? "in_progress" : item.status === "in_progress" ? "answered" : "pending";
    setItems((previous) =>
      previous.map((entry) => (entry.id === item.id ? { ...entry, status: nextStatus } : entry))
    );
  }

  return (
    <div className="page">
      <PageHeader
        eyebrow="Registro personal"
        title="Oraciones y seguimiento"
        description="Modulo simple, local y desacoplado del backend para mostrar una frontera clara entre datos persistidos en servidor y datos personales de cliente."
      />

      <section className="two-column">
        <Panel title="Nueva entrada" subtitle="Persistencia en localStorage">
          <form className="stack-form" onSubmit={handleSubmit}>
            <input
              className="input"
              placeholder="Titulo"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
            />
            <textarea
              className="input input--textarea"
              placeholder="Descripcion"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
            <button className="button" type="submit">
              Guardar entrada
            </button>
          </form>
        </Panel>

        <Panel title="Bitacora" subtitle="Cada click rota el estado">
          {items.length === 0 ? (
            <EmptyState title="Sin registros" description="Agrega una entrada para iniciar el historial." />
          ) : (
            <div className="list">
              {items.map((item) => (
                <article key={item.id} className="list-item list-item--stack">
                  <div className="list-item__row">
                    <strong>{item.title}</strong>
                    <button className="button button--ghost" onClick={() => cycleStatus(item)}>
                      {item.status}
                    </button>
                  </div>
                  <p>{item.description || "Sin descripcion"}</p>
                </article>
              ))}
            </div>
          )}
        </Panel>
      </section>
    </div>
  );
}
