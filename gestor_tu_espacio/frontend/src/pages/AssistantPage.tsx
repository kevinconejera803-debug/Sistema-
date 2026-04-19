import { type FormEvent, startTransition, useEffect, useState } from "react";
import { PageHeader } from "../components/common/PageHeader";
import { Panel } from "../components/common/Panel";
import { getErrorMessage } from "../hooks/useAsyncData";
import { askAssistant, getAssistantHistory } from "../services/assistantService";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

const INITIAL_ASSISTANT_MESSAGE: Message = {
  id: "assistant-welcome",
  role: "assistant",
  content: "Hola. Este asistente responde con reglas locales del backend y el contexto que ya existe en tu sistema."
};

export function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadHistory() {
      try {
        const history = await getAssistantHistory();
        if (!active) {
          return;
        }

        startTransition(() => {
          setMessages(history.messages.length > 0 ? history.messages : [INITIAL_ASSISTANT_MESSAGE]);
        });
      } catch {
        if (!active) {
          return;
        }

        startTransition(() => {
          setMessages([INITIAL_ASSISTANT_MESSAGE]);
        });
      } finally {
        if (active) {
          setLoadingHistory(false);
        }
      }
    }

    void loadHistory();

    return () => {
      active = false;
    };
  }, []);

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
        { id: `user-${Date.now()}`, role: "user", content: currentQuestion }
      ]);
    });

    setLoading(true);
    try {
      const response = await askAssistant(currentQuestion);
      startTransition(() => {
        setMessages((previous) => [
          ...previous,
          {
            id: `assistant-${Date.now()}`,
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
            {loadingHistory && messages.length === 0 ? <p className="feedback">Cargando historial...</p> : null}
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
              disabled={loadingHistory}
            />
            <button className="button" type="submit" disabled={loading || loadingHistory}>
              {loadingHistory ? "Cargando..." : loading ? "Consultando..." : "Enviar"}
            </button>
          </form>
          {error ? <p className="feedback feedback--error">{error}</p> : null}
        </div>
      </Panel>
    </div>
  );
}
