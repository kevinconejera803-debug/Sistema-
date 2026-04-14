import { useEffect, useEffectEvent, useState } from "react";

export function getErrorMessage(reason: unknown, fallback: string): string {
  return reason instanceof Error ? reason.message : fallback;
}

export function useAsyncValue<T>(loader: () => Promise<T>, errorMessage = "No se pudo cargar la informacion.") {
  const [value, setValue] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const reload = useEffectEvent(async () => {
    setLoading(true);
    setError("");

    try {
      setValue(await loader());
    } catch (reason: unknown) {
      setError(getErrorMessage(reason, errorMessage));
    } finally {
      setLoading(false);
    }
  });

  useEffect(() => {
    void reload();
  }, []);

  return {
    value,
    setValue,
    loading,
    error,
    setError,
    reload
  };
}

export function useAsyncList<T>(loader: () => Promise<T[]>, errorMessage = "No se pudo cargar la informacion.") {
  const state = useAsyncValue(loader, errorMessage);

  return {
    items: state.value ?? [],
    setItems: state.setValue,
    loading: state.loading,
    error: state.error,
    setError: state.setError,
    reload: state.reload
  };
}
