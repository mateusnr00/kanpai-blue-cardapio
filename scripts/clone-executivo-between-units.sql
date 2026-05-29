-- ============================================================================
-- CLONAR O MENU EXECUTIVO DE UMA UNIDADE PARA OUTRA
-- ----------------------------------------------------------------------------
-- Copia o menu executivo COMPLETO de uma unidade ORIGEM para uma unidade
-- DESTINO, exatamente como está hoje — incluindo as FOTOS (image_path) de cada
-- prato e item. Use quando uma unidade (ex.: Flamboyant) ainda tem o executivo
-- certo e você quer deixar a outra idêntica.
--
-- Copia: a categoria do executivo, os pratos-menu (pais), os itens
-- (entradas/principais/sobremesas como pratos-componente) e as ligações
-- (dish_components). Mantém slugs, descrições, preços e imagens.
--
-- Idempotente: pode rodar de novo (upsert por slug). Não apaga nada.
--
-- COMO RODAR: Supabase Studio → SQL Editor → cole tudo → ajuste v_src/v_dst
-- abaixo → Run. (Veja as unidades com: SELECT id, name FROM public.restaurants;)
-- ============================================================================

DO $$
DECLARE
  -- >>> AJUSTE AQUI <<<
  v_src text := 'flamboyant';        -- ORIGEM: de onde copiar (tem o executivo certo)
  v_dst text := 'goianiashopping';   -- DESTINO: unidade que vai receber/restaurar

  v_src_cat uuid;
  v_dst_cat uuid;
  n_dishes  int;
  n_links   int;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.restaurants WHERE id = v_src) THEN
    RAISE EXCEPTION 'Unidade ORIGEM "%" nao existe. Rode: SELECT id, name FROM public.restaurants;', v_src;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.restaurants WHERE id = v_dst) THEN
    RAISE EXCEPTION 'Unidade DESTINO "%" nao existe. Rode: SELECT id, name FROM public.restaurants;', v_dst;
  END IF;
  IF v_src = v_dst THEN
    RAISE EXCEPTION 'ORIGEM e DESTINO sao iguais (%). Ajuste v_src/v_dst.', v_src;
  END IF;

  -- 1. Categoria do executivo na ORIGEM
  SELECT id INTO v_src_cat
  FROM public.categories
  WHERE restaurant_id = v_src AND (slug = 'executivo' OR name ILIKE '%executiv%')
  ORDER BY position LIMIT 1;
  IF v_src_cat IS NULL THEN
    RAISE EXCEPTION 'Nao achei a categoria do executivo na ORIGEM "%". Confira o nome/slug.', v_src;
  END IF;

  -- 2. Categoria do executivo no DESTINO (copia da origem; cria/atualiza)
  INSERT INTO public.categories
    (restaurant_id, slug, number, name, short_name, description, item_count,
     detail, gradient, featured, active, position, subcategories)
  SELECT v_dst, slug, number, name, short_name, description, item_count,
         detail, gradient, featured, active,
         COALESCE((SELECT max(position) + 1 FROM public.categories WHERE restaurant_id = v_dst), position),
         subcategories
  FROM public.categories WHERE id = v_src_cat
  ON CONFLICT (restaurant_id, slug) DO UPDATE SET
     number = EXCLUDED.number, name = EXCLUDED.name, short_name = EXCLUDED.short_name,
     description = EXCLUDED.description, item_count = EXCLUDED.item_count, detail = EXCLUDED.detail,
     gradient = EXCLUDED.gradient, subcategories = EXCLUDED.subcategories, active = true
  RETURNING id INTO v_dst_cat;

  -- 3. Conjunto de pratos envolvidos: os menus-pai (com componentes) na
  --    categoria do executivo + todos os itens-filho que eles referenciam.
  CREATE TEMP TABLE _involved ON COMMIT DROP AS
  WITH parents AS (
    SELECT d.id
    FROM public.dishes d
    WHERE d.restaurant_id = v_src AND d.category_id = v_src_cat
      AND EXISTS (SELECT 1 FROM public.dish_components dc WHERE dc.parent_dish_id = d.id)
  )
  SELECT id FROM parents
  UNION
  SELECT dc.child_dish_id
  FROM public.dish_components dc
  WHERE dc.parent_dish_id IN (SELECT id FROM parents);

  -- 4. Copia os pratos pro DESTINO (mesmo slug, novo restaurant_id; MANTÉM foto)
  INSERT INTO public.dishes
    (restaurant_id, category_id, slug, name, price, unit, description, long_description,
     subcategory, featured, featured_gradient, original_price, image_path, blur_data_url,
     active, position, badges, is_component_only)
  SELECT v_dst, v_dst_cat, d.slug, d.name, d.price, d.unit, d.description, d.long_description,
         d.subcategory, d.featured, d.featured_gradient, d.original_price, d.image_path, d.blur_data_url,
         d.active, d.position, d.badges, d.is_component_only
  FROM public.dishes d
  JOIN _involved i ON i.id = d.id
  ON CONFLICT (restaurant_id, slug) DO UPDATE SET
     category_id = EXCLUDED.category_id, name = EXCLUDED.name, price = EXCLUDED.price,
     unit = EXCLUDED.unit, description = EXCLUDED.description, long_description = EXCLUDED.long_description,
     subcategory = EXCLUDED.subcategory, featured = EXCLUDED.featured,
     featured_gradient = EXCLUDED.featured_gradient, original_price = EXCLUDED.original_price,
     image_path = EXCLUDED.image_path, blur_data_url = EXCLUDED.blur_data_url,
     active = EXCLUDED.active, is_component_only = EXCLUDED.is_component_only;
  GET DIAGNOSTICS n_dishes = ROW_COUNT;

  -- 5. Recria as ligações (entrada/principal/sobremesa) no DESTINO, casando por slug
  INSERT INTO public.dish_components (parent_dish_id, child_dish_id, kind, position)
  SELECT pdst.id, cdst.id, dc.kind, dc.position
  FROM public.dish_components dc
  JOIN public.dishes psrc ON psrc.id = dc.parent_dish_id
  JOIN public.dishes csrc ON csrc.id = dc.child_dish_id
  JOIN _involved ip       ON ip.id = dc.parent_dish_id
  JOIN public.dishes pdst ON pdst.restaurant_id = v_dst AND pdst.slug = psrc.slug
  JOIN public.dishes cdst ON cdst.restaurant_id = v_dst AND cdst.slug = csrc.slug
  ON CONFLICT (parent_dish_id, child_dish_id) DO UPDATE SET
     kind = EXCLUDED.kind, position = EXCLUDED.position;
  GET DIAGNOSTICS n_links = ROW_COUNT;

  RAISE NOTICE 'Clonado de "%" para "%": % pratos, % ligacoes.', v_src, v_dst, n_dishes, n_links;
END $$;

-- ============================================================================
-- VERIFICAÇÃO (rode depois; troque 'goianiashopping' pelo seu DESTINO)
-- ============================================================================
SELECT p.name AS menu, dc.kind, dc.position, c.name AS item, c.price,
       (c.image_path IS NOT NULL) AS item_tem_foto
FROM public.dish_components dc
JOIN public.dishes p ON p.id = dc.parent_dish_id
JOIN public.dishes c ON c.id = dc.child_dish_id
WHERE p.restaurant_id = 'goianiashopping'
  AND p.category_id IN (SELECT id FROM public.categories
                        WHERE restaurant_id = 'goianiashopping'
                          AND (slug = 'executivo' OR name ILIKE '%executiv%'))
ORDER BY p.name, dc.kind, dc.position;
