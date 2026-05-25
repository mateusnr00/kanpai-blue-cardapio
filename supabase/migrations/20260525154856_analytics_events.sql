-- Eventos de analytics do cardápio público.
-- Inserts vêm do site (anon), só admin (authenticated) lê.

CREATE TABLE IF NOT EXISTS public.analytics_events (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_id  text NOT NULL,
  session_id  text NOT NULL,
  event_type  text NOT NULL CHECK (event_type IN ('home_view','category_open','dish_view','dish_impression')),
  category_id text,
  dish_slug   text,
  pathname    text,
  referrer    text,
  user_agent  text,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS analytics_events_created_at_idx ON public.analytics_events (created_at DESC);
CREATE INDEX IF NOT EXISTS analytics_events_event_type_idx ON public.analytics_events (event_type);
CREATE INDEX IF NOT EXISTS analytics_events_category_idx ON public.analytics_events (category_id);
CREATE INDEX IF NOT EXISTS analytics_events_dish_idx ON public.analytics_events (dish_slug);
CREATE INDEX IF NOT EXISTS analytics_events_visitor_idx ON public.analytics_events (visitor_id);
CREATE INDEX IF NOT EXISTS analytics_events_session_idx ON public.analytics_events (session_id);

-- RLS é auto-habilitada pelo event trigger; só criamos as policies.
CREATE POLICY "analytics_insert_public" ON public.analytics_events
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "analytics_select_auth" ON public.analytics_events
  FOR SELECT TO authenticated
  USING (true);
