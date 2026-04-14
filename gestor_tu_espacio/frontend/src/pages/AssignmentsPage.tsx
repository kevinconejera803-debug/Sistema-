import { type FormEvent, useState } from "react";
import { EmptyState } from "../components/common/EmptyState";
import { PageHeader } from "../components/common/PageHeader";
import { Panel } from "../components/common/Panel";
import { getErrorMessage, useAsyncList } from "../hooks/useAsyncData";
import {
  createAssignment,
  deleteAssignment,
  getAssignments,
  updateAssignment
} from "../services/assignmentsService";
import type { Assignment } from "../types";

const defaultForm = {
  course: "",
  title: "",
  due_iso: "",
  status: "pendiente",
  weight: 0,
  notes: ""
};

export function AssignmentsPage() {
  const { items: assignments, loading, error, setError, reload } = useAsyncList(
    getAssignments,
    "No se pudieron cargar las tareas."
  );
  const [form, setForm] = useState(defaultForm);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      await createAssignment(form);
      setForm(defaultForm);
      await reload();
    } catch (reason: unknown) {
      setError(getErrorMessage(reason, "No se pudo crear la tarea."));
    }
  }

  async function handleStatusChange(assignment: Assignment, status: string) {
    try {
      await updateAssignment(assignment.id, { status });
      await reload();
    } catch (reason: unknown) {
      setError(getErrorMessage(reason, "No se pudo actualizar el estado."));
    }
  }

  async function handleDelete(assignmentId: number) {
    try {
      await deleteAssignment(assignmentId);
      await reload();
    } catch (reason: unknown) {
      setError(getErrorMessage(reason, "No se pudo eliminar la tarea."));
    }
  }

  const completed = assignments.filter((assignment) => assignment.status !== "pendiente").length;
  const progress = assignments.length === 0 ? 0 : Math.round((completed / assignments.length) * 100);

  return (
    <div className="page">
      <PageHeader
        eyebrow="Universidad"
        title="Tareas y entregas"
        description="La logica de datos queda separada en servicios de API y el backend conserva el dominio bien encapsulado."
      />

      <section className="two-column">
        <Panel title="Nueva tarea" subtitle="Carga academica con validacion">
          <form className="stack-form" onSubmit={handleSubmit}>
            <input
              className="input"
              placeholder="Curso"
              value={form.course}
              onChange={(event) => setForm({ ...form, course: event.target.value })}
            />
            <input
              className="input"
              placeholder="Titulo"
              value={form.title}
              onChange={(event) => setForm({ ...form, title: event.target.value })}
            />
            <div className="input-row">
              <input
                className="input"
                type="datetime-local"
                value={form.due_iso}
                onChange={(event) => setForm({ ...form, due_iso: event.target.value })}
              />
              <input
                className="input"
                type="number"
                min={0}
                max={100}
                value={form.weight}
                onChange={(event) => setForm({ ...form, weight: Number(event.target.value) })}
              />
            </div>
            <textarea
              className="input input--textarea"
              placeholder="Notas"
              value={form.notes}
              onChange={(event) => setForm({ ...form, notes: event.target.value })}
            />
            <button className="button" type="submit">
              Guardar tarea
            </button>
          </form>
          <p className="feedback">Progreso actual: {progress}%</p>
          {error ? <p className="feedback feedback--error">{error}</p> : null}
        </Panel>

        <Panel title="Backlog" subtitle="Actualiza estado o limpia items terminados">
          {loading ? (
            <div className="loading-copy">Cargando tareas...</div>
          ) : assignments.length === 0 ? (
            <EmptyState title="Sin tareas" description="Agrega una entrega para empezar a gestionar el modulo universitario." />
          ) : (
            <div className="list">
              {assignments.map((assignment) => (
                <article key={assignment.id} className="list-item list-item--stack">
                  <div className="list-item__row">
                    <strong>{assignment.title}</strong>
                    <span className={`pill pill--${assignment.status === "pendiente" ? "warning" : "success"}`}>
                      {assignment.status}
                    </span>
                  </div>
                  <p>{assignment.course}</p>
                  <small>Entrega: {assignment.due_iso.replace("T", " ").slice(0, 16)}</small>
                  <div className="list-item__row">
                    <select
                      className="input"
                      value={assignment.status}
                      onChange={(event) => void handleStatusChange(assignment, event.target.value)}
                    >
                      <option value="pendiente">Pendiente</option>
                      <option value="completado">Completado</option>
                      <option value="entregado">Entregado</option>
                      <option value="calificado">Calificado</option>
                    </select>
                    <button className="button button--ghost" onClick={() => void handleDelete(assignment.id)}>
                      Eliminar
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </Panel>
      </section>
    </div>
  );
}
