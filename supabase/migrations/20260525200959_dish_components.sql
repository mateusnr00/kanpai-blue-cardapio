-- Permite que um prato (parent) referencie outros pratos (child) como
-- "incluidos nele", agrupados por kind (entrada/principal/sobremesa).
-- Util pra menus executivos, combos, festivais etc.

CREATE TABLE IF NOT EXISTS public.dish_components (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_dish_id  uuid NOT NULL REFERENCES public.dishes(id) ON DELETE CASCADE,
  child_dish_id   uuid NOT NULL REFERENCES public.dishes(id) ON DELETE CASCADE,
  kind            text NOT NULL CHECK (kind IN ('entrada','principal','sobremesa')),
  position        integer NOT NULL DEFAULT 0,
  created_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (parent_dish_id, child_dish_id)
);

CREATE INDEX IF NOT EXISTS dish_components_parent_idx ON public.dish_components (parent_dish_id);
CREATE INDEX IF NOT EXISTS dish_components_child_idx  ON public.dish_components (child_dish_id);

CREATE POLICY "dish_components_select_public" ON public.dish_components
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "dish_components_write_auth" ON public.dish_components
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
