-- ============================================================================
-- Coluna parent_id em categories (aninhamento de categorias)
-- ----------------------------------------------------------------------------
-- Permite categoria-dentro-de-categoria. Categoria com parent_id != null
-- nao aparece na home; aparece como card dentro da pagina do pai.
-- ON DELETE SET NULL: apagar o pai nao apaga as filhas (viram topo).
-- ============================================================================

ALTER TABLE public.categories
  ADD COLUMN IF NOT EXISTS parent_id uuid REFERENCES public.categories(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON public.categories(parent_id);

NOTIFY pgrst, 'reload schema';
