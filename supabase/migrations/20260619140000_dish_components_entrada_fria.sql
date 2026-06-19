-- Adiciona um 4º grupo de componentes: "entrada_fria" (ex.: entradas frias /
-- sushibar), além de entrada/principal/sobremesa. O rótulo de cada grupo
-- continua customizável por prato via dishes.component_labels.
ALTER TABLE public.dish_components DROP CONSTRAINT IF EXISTS dish_components_kind_check;
ALTER TABLE public.dish_components
  ADD CONSTRAINT dish_components_kind_check
  CHECK (kind IN ('entrada','entrada_fria','principal','sobremesa'));
