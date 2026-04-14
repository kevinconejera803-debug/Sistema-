import { type FormEvent, useState } from "react";
import { EmptyState } from "../components/common/EmptyState";
import { PageHeader } from "../components/common/PageHeader";
import { Panel } from "../components/common/Panel";
import { getErrorMessage, useAsyncList } from "../hooks/useAsyncData";
import { createEvent, deleteEvent, getEvents } from "../services/calendarService";

const defaultForm = {
  title: "",
  date: "",
  time: "09:00",
  color: "teal",
  notes: ""
};

export function CalendarPage() {
  const { items: events, loading, error, setError, reload } = useAsyncList(
    getEvents,
    "No se pudieron cargar los eventos."
  );
  const [form, setForm] = useState(defaultForm);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.title || !form.date) {
      setError("Completa titulo y fecha para crear el evento.");
      return;
    }

    try {
      await createEvent({
        title: form.title,
        start_iso: `${form.date}T${form.time}:00`,
        end_iso: null,
        all_day: 0,
        color: form.color,
        notes: form.notes
      });
      setForm(defaultForm);
      await reload();
    } catch (reason: unknown) {
      setError(getErrorMessage(reason, "No se pudo crear el evento."));
    }
  }

  async function handleDelete(eventId: number) {
    try {
      await deleteEvent(eventId);
      await reload();
    } catch (reason: unknown) {
      setError(getErrorMessage(reason, "No se pudo eliminar el evento."));
    }
  }

  const sortedEvents = [...events].sort((left, right) => left.start_iso.localeCompare(right.start_iso));

  return (
    <div className="page">
      <PageHeader
        eyebrow="Agenda"
        title="Calendario operativo"
        description="Gestiona tus eventos desde una UI ligera conectada al backend Flask."
      />

      <section className="two-column">
        <Panel title="Nuevo evento" subtitle="Los datos se validan en frontend y backend">
          <form className="stack-form" onSubmit={handleSubmit}>
            <input
              className="input"
              placeholder="Titulo"
              value={form.title}
              onChange={(event) => setForm({ ...form, title: event.target.value })}
            />
            <div className="input-row">
              <input
                className="input"
                type="date"
                value={form.date}
                onChange={(event) => setForm({ ...form, date: event.target.value })}
              />
              <input
                className="input"
                type="time"
                value={form.time}
                onChange={(event) => setForm({ ...form, time: event.target.value })}
              />
            </div>
            <div className="input-row">
              <select
                className="input"
                value={form.color}
                onChange={(event) => setForm({ ...form, color: event.target.value })}
              >
                <option value="teal">Teal</option>
                <option value="yellow">Yellow</option>
                <option value="purple">Purple</option>
                <option value="red">Red</option>
              </select>
              <input
                className="input"
                placeholder="Notas"
                value={form.notes}
                onChange={(event) => setForm({ ...form, notes: event.target.value })}
              />
            </div>
            <button className="button" type="submit">
              Guardar evento
            </button>
          </form>
          {error ? <p className="feedback feedback--error">{error}</p> : null}
        </Panel>

        <Panel title="Proximos eventos" subtitle="Lista ordenada por fecha">
          {loading ? (
            <div className="loading-copy">Cargando eventos...</div>
          ) : sortedEvents.length === 0 ? (
            <EmptyState title="Sin eventos" description="Crea tu primer evento para empezar a poblar el calendario." />
          ) : (
            <div className="list">
              {sortedEvents.map((item) => (
                <article key={item.id} className="list-item">
                  <div>
                    <strong>{item.title}</strong>
                    <p>{item.start_iso.replace("T", " ").slice(0, 16)}</p>
                    {item.notes ? <small>{item.notes}</small> : null}
                  </div>
                  <button className="button button--ghost" onClick={() => void handleDelete(item.id)}>
                    Eliminar
                  </button>
                </article>
              ))}
            </div>
          )}
        </Panel>
      </section>
    </div>
  );
}
