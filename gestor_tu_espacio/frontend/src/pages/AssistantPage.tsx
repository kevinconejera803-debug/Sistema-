import { type FormEvent, startTransition, useState } from "react";
import { PageHeader } from "../components/common/PageHeader";
import { Panel } from "../components/common/Panel";
import { getErrorMessage } from "../hooks/useAsyncData";
import { askAssistant } from "../services/assistantService";

type Message = {
  id: number;
  role: "user" | "assistant";
  content: string;
};

export function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      role: "assistant",
      content: "Hola. Este asistente responde con reglas locales del backend y el contexto que ya existe en tu sistema."
    }
  ]);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!question.trim()) {
      return;
    }

    const currentQuestion = question.trim();
    setQuestion("");
    setError("");
    startTransition(() => {
      setMessages((previous) => [
        ...previous,
        { id: Date.now(), role: "user", content: currentQuestion }
      ]);
    });

    setLoading(true);
    try {
      const response = await askAssistant(currentQuestion);
      startTransition(() => {
        setMessages((previous) => [
          ...previous,
          {
            id: Date.now() + 1,
            role: "assistant",
            content: response.sources
              ? `${response.answer}\n\nFuentes:\n${response.sources}`
              : response.answer
          }
        ]);
      });
    } catch (reason: unknown) {
      setError(getErrorMessage(reason, "No se pudo obtener respuesta."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page">
      <PageHeader
        eyebrow="Asistente"
        title="Conversacion contextual"
        description="La UI queda separada del motor de respuestas y el backend usa contexto local, memoria y datos del sistema."
      />

      <Panel title="Chat" subtitle="Envios via /api/research/ask">
        <div className="chat">
          <div className="chat__messages">
            {messages.map((message) => (
              <article
                key={message.id}
                className={`chat__message${message.role === "assistant" ? "" : " chat__message--user"}`}
              >
                <div className="chat__bubble">{message.content}</div>
              </article>
            ))}
          </div>

          <form className="chat__composer" onSubmit={handleSubmit}>
            <textarea
              className="input input--textarea"
              placeholder="Pregunta algo sobre tu agenda, tareas o contexto actual..."
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
            />
            <button className="button" type="submit" disabled={loading}>
              {loading ? "Consultando..." : "Enviar"}
            </button>
          </form>
          {error ? <p className="feedback feedback--error">{error}</p> : null}
        </div>
      </Panel>
    </div>
  );
}
