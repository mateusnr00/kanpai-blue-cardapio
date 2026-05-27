-- Linktree configuravel via admin.
-- Hierarquia simples: botoes podem ter parent_id (sub-linktree).
-- Cada botao tem 3 modos:
--   1. href definido         -> link direto (interno ou externo)
--   2. child_slug definido   -> abre sub-linktree em /l/{slug}
--   3. nenhum dos dois       -> placeholder desabilitado ("em breve")

CREATE TABLE public.linktree_buttons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id uuid REFERENCES public.linktree_buttons(id) ON DELETE CASCADE,
  label text NOT NULL,
  href text,
  child_slug text,
  position int NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (href IS NULL OR child_slug IS NULL)
);

CREATE INDEX idx_linktree_parent_position
  ON public.linktree_buttons (parent_id, position);

-- child_slug deve ser unico (so funciona em botoes de root, mas restringir
-- globalmente evita confusao)
CREATE UNIQUE INDEX idx_linktree_child_slug
  ON public.linktree_buttons (child_slug)
  WHERE child_slug IS NOT NULL;

-- updated_at automatico
CREATE OR REPLACE FUNCTION public.linktree_touch_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER linktree_buttons_updated_at
  BEFORE UPDATE ON public.linktree_buttons
  FOR EACH ROW
  EXECUTE FUNCTION public.linktree_touch_updated_at();

-- RLS: leitura publica (site precisa), escrita so admin autenticado
CREATE POLICY "public_read_linktree"
  ON public.linktree_buttons
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "authenticated_insert_linktree"
  ON public.linktree_buttons
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "authenticated_update_linktree"
  ON public.linktree_buttons
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "authenticated_delete_linktree"
  ON public.linktree_buttons
  FOR DELETE
  TO authenticated
  USING (true);

-- Seed com a estrutura atual (hardcoded em /, /reservas, /localizacao)
WITH
  root_cardapio_flam AS (
    INSERT INTO public.linktree_buttons (label, href, position)
    VALUES ('Cardápio · Flamboyant', '/flamboyant', 0)
    RETURNING id
  ),
  root_cardapio_gs AS (
    INSERT INTO public.linktree_buttons (label, href, position)
    VALUES ('Cardápio · Goiânia Shopping', '/goianiashopping', 1)
    RETURNING id
  ),
  root_reservas AS (
    INSERT INTO public.linktree_buttons (label, child_slug, position)
    VALUES ('Reservas', 'reservas', 2)
    RETURNING id
  ),
  root_fale AS (
    INSERT INTO public.linktree_buttons (label, position, active)
    VALUES ('Fale conosco', 3, true)
    RETURNING id
  ),
  root_loc AS (
    INSERT INTO public.linktree_buttons (label, child_slug, position)
    VALUES ('Localização', 'localizacao', 4)
    RETURNING id
  ),
  root_aval AS (
    INSERT INTO public.linktree_buttons (label, href, position)
    VALUES ('Avalie-nos', '/avaliacao', 5)
    RETURNING id
  )
INSERT INTO public.linktree_buttons (parent_id, label, href, position, active)
SELECT id, 'Reservar · Flamboyant',
       'https://reservation-widget.tagme.com.br/smartlink/6476426688f854004fe61654',
       0, true
FROM root_reservas
UNION ALL
SELECT id, 'Reservar · Goiânia Shopping', NULL, 1, true
FROM root_reservas
UNION ALL
SELECT id, 'Kanpai Blue · Flamboyant',
       'https://www.google.com/maps/place/kanpai+blue/data=!4m2!3m1!1s0x935ef05314772ca9:0xecc60aa28b103ac0?sa=X&ved=1t:242&ictx=111',
       0, true
FROM root_loc
UNION ALL
SELECT id, 'Kanpai Blue · Goiânia Shopping', NULL, 1, true
FROM root_loc;
