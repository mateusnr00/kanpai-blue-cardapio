-- ============================================================================
-- Coluna featured_label na tabela dishes
-- ----------------------------------------------------------------------------
-- Texto custom do badge que aparece no card de destaque (default "DESTAQUE").
-- Quando NULL ou vazio, o site usa "DESTAQUE" como fallback.
-- Exemplos: "NOVO", "MAIS PEDIDO", "PROMOÇÃO", "EXCLUSIVO", etc.
-- ============================================================================

ALTER TABLE public.dishes
  ADD COLUMN IF NOT EXISTS featured_label text;

NOTIFY pgrst, 'reload schema';
