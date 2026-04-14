import { type FormEvent, useDeferredValue, useState } from "react";
import { EmptyState } from "../components/common/EmptyState";
import { PageHeader } from "../components/common/PageHeader";
import { Panel } from "../components/common/Panel";
import { getErrorMessage, useAsyncList } from "../hooks/useAsyncData";
import { createContact, deleteContact, getContacts } from "../services/contactsService";

const defaultForm = {
  name: "",
  email: "",
  phone: "",
  company: "",
  notes: ""
};

export function ContactsPage() {
  const { items: contacts, loading, error, setError, reload } = useAsyncList(
    getContacts,
    "No se pudieron cargar los contactos."
  );
  const [query, setQuery] = useState("");
  const [form, setForm] = useState(defaultForm);
  const deferredQuery = useDeferredValue(query);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      await createContact(form);
      setForm(defaultForm);
      await reload();
    } catch (reason: unknown) {
      setError(getErrorMessage(reason, "No se pudo crear el contacto."));
    }
  }

  async function handleDelete(contactId: number) {
    try {
      await deleteContact(contactId);
      await reload();
    } catch (reason: unknown) {
      setError(getErrorMessage(reason, "No se pudo eliminar el contacto."));
    }
  }

  const filteredContacts = contacts.filter((contact) => {
    const haystack = `${contact.name} ${contact.email} ${contact.company}`.toLowerCase();
    return haystack.includes(deferredQuery.toLowerCase());
  });

  return (
    <div className="page">
      <PageHeader
        eyebrow="Red personal"
        title="Contactos reutilizables"
        description="Busqueda desacoplada con useDeferredValue y llamadas centralizadas en services/."
      />

      <section className="two-column">
        <Panel title="Nuevo contacto" subtitle="Formulario persistido en SQLite">
          <form className="stack-form" onSubmit={handleSubmit}>
            <input
              className="input"
              placeholder="Nombre"
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
            />
            <div className="input-row">
              <input
                className="input"
                placeholder="Email"
                value={form.email}
                onChange={(event) => setForm({ ...form, email: event.target.value })}
              />
              <input
                className="input"
                placeholder="Telefono"
                value={form.phone}
                onChange={(event) => setForm({ ...form, phone: event.target.value })}
              />
            </div>
            <input
              className="input"
              placeholder="Empresa o rol"
              value={form.company}
              onChange={(event) => setForm({ ...form, company: event.target.value })}
            />
            <button className="button" type="submit">
              Guardar contacto
            </button>
          </form>
          {error ? <p className="feedback feedback--error">{error}</p> : null}
        </Panel>

        <Panel title="Agenda" subtitle="Filtra y administra relaciones">
          <input
            className="input"
            placeholder="Buscar por nombre, email o empresa"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          {loading ? (
            <div className="loading-copy">Cargando contactos...</div>
          ) : filteredContacts.length === 0 ? (
            <EmptyState title="Sin resultados" description="Ajusta la busqueda o agrega un nuevo contacto." />
          ) : (
            <div className="list">
              {filteredContacts.map((contact) => (
                <article key={contact.id} className="list-item list-item--stack">
                  <div className="list-item__row">
                    <strong>{contact.name}</strong>
                    <button className="button button--ghost" onClick={() => void handleDelete(contact.id)}>
                      Eliminar
                    </button>
                  </div>
                  {contact.company ? <p>{contact.company}</p> : null}
                  <small>{contact.email || "Sin email"}</small>
                  <small>{contact.phone || "Sin telefono"}</small>
                </article>
              ))}
            </div>
          )}
        </Panel>
      </section>
    </div>
  );
}
