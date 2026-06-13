-- ============================================================================
-- Avisos programáveis (lista) — substitui o aviso único em restaurants.*
-- ============================================================================
-- Vários avisos por unidade, cada um com programação própria (data+hora de
-- início/fim no fuso de São Paulo, dias da semana off), ordenáveis. O site
-- mostra o primeiro ativo+visível pela ordem (sort_order).
-- Mantém restaurant_id (multi-unidade). RLS: leitura pública (site usa anon),
-- escrita autenticada (admin) — mesmo padrão de dishes/categories.

CREATE TABLE IF NOT EXISTS public.announcements (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id     text NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  name              text NOT NULL DEFAULT 'Aviso',
  is_active         boolean NOT NULL DEFAULT true,
  image_url         text,
  aspect            text NOT NULL DEFAULT 'portrait' CHECK (aspect IN ('portrait','square')),
  dim               integer NOT NULL DEFAULT 0 CHECK (dim BETWEEN 0 AND 90),
  schedule_start    text,
  schedule_end      text,
  schedule_days_off integer[] NOT NULL DEFAULT '{}',
  sort_order        integer NOT NULL DEFAULT 0,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS announcements_restaurant_idx
  ON public.announcements (restaurant_id, sort_order);

ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "announcements_select_public" ON public.announcements
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "announcements_write_auth" ON public.announcements
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Migra o aviso único existente (por unidade) como primeira linha da lista.
INSERT INTO public.announcements (restaurant_id, name, is_active, image_url, aspect, sort_order)
SELECT r.id, 'Aviso', COALESCE(r.announcement_active, false),
  'https://rxzohyrttklxevegdijm.supabase.co/storage/v1/object/public/dish-images/' || r.announcement_image_path,
  'portrait', 0
FROM public.restaurants r
WHERE r.announcement_image_path IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM public.announcements a WHERE a.restaurant_id = r.id
  );

-- Obs.: as colunas restaurants.announcement_active / announcement_image_path
-- ficam por enquanto (não dropar até o código novo estar em produção).
