-- QR codes rastreados + coluna `source` no analytics.
-- ----------------------------------------------------------------------------
-- Sem sistema de tracking paralelo: o scan bate em /q/<slug>, que registra UM
-- evento 'qr_scan' (source = 'qr-<slug>') no proprio analytics_events e
-- redireciona pro destino escolhido (qualquer URL/caminho — home, cardapio,
-- link externo). Assim o QR e rastreado mesmo quando NAO leva pro cardapio.

-- 1. Coluna source nos eventos existentes
ALTER TABLE public.analytics_events
  ADD COLUMN IF NOT EXISTS source text;

CREATE INDEX IF NOT EXISTS analytics_events_source_idx
  ON public.analytics_events (source)
  WHERE source IS NOT NULL;

-- 2. Permite o event_type 'qr_scan' (registrado pela rota /q no servidor)
ALTER TABLE public.analytics_events DROP CONSTRAINT IF EXISTS analytics_events_event_type_check;
ALTER TABLE public.analytics_events ADD CONSTRAINT analytics_events_event_type_check
  CHECK (event_type IN ('home_view','category_open','dish_view','dish_impression','qr_scan'));

-- 3. Tabela de configuracao dos QR codes (NAO e tabela de clicks; so o de->para
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
DROP POLICY IF EXISTS "qr_codes_select_public" ON public.qr_codes;
CREATE POLICY "qr_codes_select_public" ON public.qr_codes
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "qr_codes_write_auth" ON public.qr_codes;
CREATE POLICY "qr_codes_write_auth" ON public.qr_codes
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
