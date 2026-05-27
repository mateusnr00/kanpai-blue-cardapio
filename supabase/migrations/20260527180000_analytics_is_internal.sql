-- Marca eventos vindos da equipe do restaurante (testes, garcom mostrando
-- o cardapio, etc.) pra que o painel /analytics possa filtra-los.
--
-- O site marca um aparelho como interno quando alguem acessa o cardapio
-- com ?staff=1 (flag salva em localStorage). A coluna abaixo recebe esse
-- valor a cada insert.

ALTER TABLE public.analytics_events
  ADD COLUMN IF NOT EXISTS is_internal boolean NOT NULL DEFAULT false;

-- Index parcial: apenas linhas externas (a grande maioria das queries do admin).
-- Mais barato que indexar a coluna inteira.
CREATE INDEX IF NOT EXISTS analytics_events_external_created_at_idx
  ON public.analytics_events (created_at DESC)
  WHERE NOT is_internal;
