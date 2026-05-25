-- Marca pratos que existem apenas como componentes de outros pratos (menus executivos, combos).
-- Eles nao aparecem na listagem da categoria no cardapio publico nem em /dishes por padrao,
-- mas continuam sendo carregados quando referenciados em dish_components.

ALTER TABLE public.dishes
  ADD COLUMN is_component_only boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_dishes_component_only
  ON public.dishes (restaurant_id, is_component_only)
  WHERE is_component_only = true;
