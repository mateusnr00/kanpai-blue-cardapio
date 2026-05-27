"use client";

import { createContext, useContext, type ReactNode } from "react";

const Ctx = createContext<boolean>(true);

/**
 * Wrappa a parte do site que sabe qual restaurante esta sendo
 * visitado, pra propagar o flag likes_enabled pros LikeButton/
 * LikeCount sem prop drilling.
 */
export function LikesEnabledProvider({ enabled, children }: { enabled: boolean; children: ReactNode }) {
  return <Ctx.Provider value={enabled}>{children}</Ctx.Provider>;
}

/** Default true quando nao ha provider (paginas sem contexto de restaurante). */
export function useLikesEnabled(): boolean {
  return useContext(Ctx);
}
