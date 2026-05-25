-- Multi-tenant: cada unidade do Kanpai vira uma row em restaurants.
-- Slug do restaurante = id (usado nas rotas /[restaurant]/...).

CREATE TABLE IF NOT EXISTS public.restaurants (
  id          text PRIMARY KEY,
  name        text NOT NULL,
  short_name  text NOT NULL,
  active      boolean NOT NULL DEFAULT true,
  position    integer NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

INSERT INTO public.restaurants (id, name, short_name, position) VALUES
  ('flamboyant',      'Kanpai Blue Flamboyant',       'Flamboyant',       0),
  ('goianiashopping', 'Kanpai Blue Goiânia Shopping', 'Goiânia Shopping', 1)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "restaurants_select_public" ON public.restaurants
  FOR SELECT TO anon, authenticated USING (active = true);

CREATE POLICY "restaurants_select_auth_all" ON public.restaurants
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "restaurants_write_auth" ON public.restaurants
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
