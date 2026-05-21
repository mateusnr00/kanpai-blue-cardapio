"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { decrementLike, fetchAllLikes, incrementLike } from "@/lib/supabase";

type LikesContextValue = {
  counts: Record<string, number>;
  liked: Record<string, boolean>;
  toggle: (dishId: string) => Promise<void>;
  isReady: boolean;
};

const LikesContext = createContext<LikesContextValue | undefined>(undefined);

const LIKED_KEY = "kanpai-liked-dishes";

function readLikedSet(): Record<string, boolean> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(LIKED_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return typeof parsed === "object" && parsed ? parsed : {};
  } catch {
    return {};
  }
}

function writeLikedSet(set: Record<string, boolean>) {
  try {
    localStorage.setItem(LIKED_KEY, JSON.stringify(set));
  } catch {}
}

export function LikesProvider({ children }: { children: ReactNode }) {
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [liked, setLiked] = useState<Record<string, boolean>>({});
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setLiked(readLikedSet());
    fetchAllLikes()
      .then((c) => {
        setCounts(c);
      })
      .finally(() => setIsReady(true));
  }, []);

  const toggle = useCallback(
    async (dishId: string) => {
      const wasLiked = !!liked[dishId];
      // Optimistic update
      setLiked((prev) => {
        const next = { ...prev };
        if (wasLiked) delete next[dishId];
        else next[dishId] = true;
        writeLikedSet(next);
        return next;
      });
      setCounts((prev) => {
        const current = prev[dishId] ?? 0;
        return { ...prev, [dishId]: Math.max(0, current + (wasLiked ? -1 : 1)) };
      });

      // Fire and forget — reconcilia se vier resposta do servidor
      const result = wasLiked
        ? await decrementLike(dishId)
        : await incrementLike(dishId);
      if (typeof result === "number") {
        setCounts((prev) => ({ ...prev, [dishId]: result }));
      }
    },
    [liked],
  );

  return (
    <LikesContext.Provider value={{ counts, liked, toggle, isReady }}>
      {children}
    </LikesContext.Provider>
  );
}

export function useLikes() {
  const ctx = useContext(LikesContext);
  if (!ctx) {
    // Fallback gracioso pra casos onde o provider não está montado
    return {
      counts: {} as Record<string, number>,
      liked: {} as Record<string, boolean>,
      toggle: async () => {},
      isReady: false,
    } as LikesContextValue;
  }
  return ctx;
}
