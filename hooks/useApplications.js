"use client";
import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";

export function useApplications(enabled) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    api
      .list()
      .then((d) => !cancelled && setItems(d.items))
      .catch((e) => !cancelled && setError(e.message))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [enabled]);

  const add = useCallback(async (data) => {
    const { item } = await api.create(data);
    setItems((p) => [item, ...p]);
    return item;
  }, []);

  const update = useCallback(async (id, patch) => {
    let snapshot;
    setItems((p) => {
      snapshot = p;
      return p.map((i) =>
        i.id === id ? { ...i, ...patch, updatedAt: Date.now() } : i,
      );
    });
    try {
      await api.update(id, patch);
    } catch (e) {
      setItems(snapshot);
      throw e;
    }
  }, []);

  const remove = useCallback(async (id) => {
    let snapshot;
    setItems((p) => {
      snapshot = p;
      return p.filter((i) => i.id !== id);
    });
    try {
      await api.remove(id);
    } catch (e) {
      setItems(snapshot);
      throw e;
    }
  }, []);

  return { items, loading, error, add, update, remove };
}
