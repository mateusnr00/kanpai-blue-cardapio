-- ============================================================================
-- Coluna cover_aspect na tabela categories
-- ----------------------------------------------------------------------------
-- Permite escolher a proporcao da imagem de capa do card por categoria:
--   - 'wide'   → 1920×1080 (16:9) — destaque, ocupa fileira inteira
--   - 'square' → 1200×1200 (1:1) — formato normal
-- ============================================================================

ALTER TABLE public.categories
  ADD COLUMN IF NOT EXISTS cover_aspect text NOT NULL DEFAULT 'wide'
    CHECK (cover_aspect IN ('wide', 'square'));

NOTIFY pgrst, 'reload schema';
