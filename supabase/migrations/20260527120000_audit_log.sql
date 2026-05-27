-- Historico de mudancas no admin. Toda mutacao via Server Action insere uma linha.

CREATE TABLE public.admin_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  actor_email text,
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id text,
  entity_label text,
  restaurant_id text REFERENCES public.restaurants(id) ON DELETE SET NULL,
  details jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_log_created_at ON public.admin_audit_log (created_at DESC);
CREATE INDEX idx_audit_log_actor ON public.admin_audit_log (actor_id, created_at DESC);
CREATE INDEX idx_audit_log_entity ON public.admin_audit_log (entity_type, entity_id);
CREATE INDEX idx_audit_log_restaurant ON public.admin_audit_log (restaurant_id, created_at DESC);

CREATE POLICY "authenticated_read_audit"
  ON public.admin_audit_log
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "authenticated_insert_audit"
  ON public.admin_audit_log
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Sem UPDATE ou DELETE policies: o historico e append-only por design.
