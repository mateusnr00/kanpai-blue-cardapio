-- ============================================================================
-- Sincronização de cardápio: Goiânia Shopping -> Flamboyant (2026-06-10)
-- ============================================================================
-- Objetivo: deixar os itens de COMIDA do Flamboyant iguais aos do Goiânia
-- (preencher fotos faltantes, sincronizar descrições, trazer itens que faltam),
-- PRESERVANDO a carta de vinhos do Flamboyant. As categorias de vinho têm slugs
-- próprios no Flamboyant, então o casamento por slug nunca as toca.
--
-- Casamento: categoria por SLUG + nome do prato normalizado (lower+trim).
-- Antes de rodar em massa, foi feito backup: bkp_20260610_flamboyant_* .
--
-- IMPORTANTE: a inclusão de itens faltantes exige revisão manual de duplicatas
-- (grafias diferentes, ex.: "Ceviche de Tilápia" vs "Ceviche Tilápia",
-- "Sake ... (720ml)"). Faça via preview antes de inserir.
-- ============================================================================

-- Categorias de comida compartilhadas (vinhos ficam de fora por terem slug próprio)
-- bebidasalcoolicas, bebidasnaoalcoolicas, combinados, entradas, executivo,
-- festival, happy-hour, pratos-quentes, promocoes, saques-garrafas-e-doses,
-- selecoes-premium, sobremesas, variados, menu-kids

-- 1) Preenche fotos faltantes (Flamboyant sem foto, Goiânia com foto) -------------
update public.dishes f
set image_path = g.image_path, blur_data_url = g.blur_data_url, updated_at = now()
from public.dishes g, public.categories gc, public.categories fc
where g.restaurant_id='goianiashopping' and gc.id=g.category_id
  and f.restaurant_id='flamboyant' and fc.id=f.category_id
  and fc.slug = gc.slug
  and lower(btrim(f.name)) = lower(btrim(g.name))
  and f.image_path is null and g.image_path is not null;

-- 2) Sincroniza descrições (só quando a do Goiânia não é vazia) -------------------
update public.dishes f
set description = g.description, updated_at = now()
from public.dishes g, public.categories gc, public.categories fc
where g.restaurant_id='goianiashopping' and gc.id=g.category_id
  and f.restaurant_id='flamboyant' and fc.id=f.category_id
  and fc.slug = gc.slug
  and lower(btrim(f.name)) = lower(btrim(g.name))
  and coalesce(btrim(g.description),'') <> ''
  and coalesce(btrim(f.description),'') <> coalesce(btrim(g.description),'');

-- 3) Itens faltantes: PREVIEW (não insere). Reveja duplicatas por grafia antes. ---
-- select gc.slug, g.name, g.price, (g.image_path is not null) as tem_foto
-- from public.dishes g join public.categories gc on gc.id=g.category_id
-- where g.restaurant_id='goianiashopping'
--   and gc.slug in (/* food slugs acima */)
--   and not exists (
--     select 1 from public.dishes f join public.categories fc on fc.id=f.category_id
--     where f.restaurant_id='flamboyant' and fc.slug=gc.slug
--       and lower(btrim(f.name))=lower(btrim(g.name)))
-- order by gc.slug, g.name;
