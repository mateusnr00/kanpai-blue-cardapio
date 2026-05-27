-- Avaliacoes deixadas pelos clientes via site publico.
-- INSERT permitido pra anon, SELECT/UPDATE/DELETE so pra authenticated (admin).

CREATE TABLE public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id text NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  overall smallint NOT NULL CHECK (overall BETWEEN 1 AND 5),
  food smallint CHECK (food BETWEEN 1 AND 5),
  ambience smallint CHECK (ambience BETWEEN 1 AND 5),
  service smallint CHECK (service BETWEEN 1 AND 5),
  waiter_name text,
  comment text,
  contact_name text,
  contact_email text,
  contact_phone text,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_reviews_restaurant_created
  ON public.reviews (restaurant_id, created_at DESC);

CREATE INDEX idx_reviews_unread
  ON public.reviews (restaurant_id, created_at DESC)
  WHERE read_at IS NULL;

-- RLS auto-habilitado pelo event trigger do projeto; criamos as policies:

CREATE POLICY "anon_insert_reviews"
  ON public.reviews
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "authenticated_read_reviews"
  ON public.reviews
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "authenticated_update_reviews"
  ON public.reviews
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "authenticated_delete_reviews"
  ON public.reviews
  FOR DELETE
  TO authenticated
  USING (true);
