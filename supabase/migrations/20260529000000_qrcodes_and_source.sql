-- QR codes rastreados + coluna `source` no analytics.
-- ----------------------------------------------------------------------------
-- Sem sistema de tracking paralelo: a visita que chega via /q/<slug> redireciona
-- pro cardapio com ?src=qr-<slug>, e o analytics do site grava esse `source` no
-- proprio evento (home_view etc.). Assim o QR aparece junto com o resto, sem
-- duplicar cliques nem criar tabela de clicks.

-- 1. Coluna source nos eventos existentes
ALTER TABLE public.analytics_events
  ADD COLUMN IF NOT EXISTS source text;

CREATE INDEX IF NOT EXISTS analytics_events_source_idx
  ON public.analytics_events (source)
  WHERE source IS NOT NULL;

-- 2. Tabela de configuracao dos QR codes (NAO e tabela de clicks; so o de->para
--    slug -> destino. As metricas saem do analytics_events via o source).
CREATE TABLE IF NOT EXISTS public.qr_codes (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id text NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  slug          text NOT NULL UNIQUE,
  label         text NOT NULL,
  target_path   text NOT NULL,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS qr_codes_restaurant_idx ON public.qr_codes (restaurant_id);

ALTER TABLE public.qr_codes ENABLE ROW LEVEL SECURITY;

-- leitura publica (a rota /q precisa resolver o destino), escrita so admin
CREATE POLICY "qr_codes_select_public" ON public.qr_codes
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "qr_codes_write_auth" ON public.qr_codes
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
