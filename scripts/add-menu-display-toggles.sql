-- ============================================================================
-- Toggles de aparência do cardápio (por restaurante)
-- ----------------------------------------------------------------------------
-- 4 flags pra controlar o que aparece no site público de cada unidade.
-- Default = true (mantém aparência atual). Admin alterna em /cards.
-- ============================================================================

ALTER TABLE public.restaurants
  ADD COLUMN IF NOT EXISTS show_category_eyebrow boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS show_category_subtitle boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS show_home_footer_count boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS show_category_footer_count boolean NOT NULL DEFAULT true;

NOTIFY pgrst, 'reload schema';
