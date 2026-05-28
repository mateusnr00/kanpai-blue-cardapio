-- ============================================================================
-- "Saquês Garrafas e Doses": de subcategoria → categoria própria
-- ----------------------------------------------------------------------------
-- Aplica em flamboyant E goianiashopping. Para cada unidade:
--   1. Acha a categoria "Bebidas Alcoólicas" (match flexível por acento)
--   2. Acha o nome EXATO da subcategoria "Saquês Garrafas e Doses"
--   3. Abre espaço (shift) e cria a categoria nova logo depois
--   4. Move os pratos dessa subcategoria pra categoria nova (subcategory=NULL)
--   5. Remove a subcategoria do array de "Bebidas Alcoólicas"
-- ============================================================================

BEGIN;

DO $$
DECLARE
  rest text;
  rests text[] := ARRAY['flamboyant', 'goianiashopping'];
  beb_id uuid;
  beb_pos int;
  beb_grad text;
  beb_subcats text[];
  beb_modes jsonb;
  sub_name text;
  new_id uuid;
  moved int;
BEGIN
  FOREACH rest IN ARRAY rests LOOP
    -- 1. Bebidas Alcoólicas (NÃO casa com "Bebidas Não Alcoólicas")
    SELECT id, position, gradient, subcategories, subcategory_display_modes
      INTO beb_id, beb_pos, beb_grad, beb_subcats, beb_modes
    FROM public.categories
    WHERE restaurant_id = rest AND name ILIKE 'Bebidas Alc%'
    ORDER BY position
    LIMIT 1;

    IF beb_id IS NULL THEN
      RAISE NOTICE '[%] Bebidas Alcoólicas nao encontrada, pulando', rest;
      CONTINUE;
    END IF;

    -- 2. Nome exato da subcategoria (lida com acento de "Saquês")
    SELECT s INTO sub_name
    FROM unnest(beb_subcats) AS s
    WHERE s ILIKE 'Saqu%Garrafas%Doses';

    IF sub_name IS NULL THEN
      RAISE NOTICE '[%] subcategoria de saques nao encontrada em Bebidas Alcoolicas', rest;
      CONTINUE;
    END IF;

    -- 3. Abre espaço logo depois de Bebidas Alcoólicas
    UPDATE public.categories SET position = position + 1
    WHERE restaurant_id = rest AND position > beb_pos;

    -- 4. Cria a categoria nova
    INSERT INTO public.categories (restaurant_id, slug, name, number, description, gradient, position, display_mode, active)
    VALUES (rest, 'saques-garrafas-e-doses', sub_name, '', '', beb_grad, beb_pos + 1, 'list', true)
    RETURNING id INTO new_id;

    -- 5. Move os pratos
    UPDATE public.dishes SET category_id = new_id, subcategory = NULL
    WHERE restaurant_id = rest AND category_id = beb_id AND subcategory = sub_name;
    GET DIAGNOSTICS moved = ROW_COUNT;

    -- 6. Remove a subcategoria do array + display_modes de Bebidas Alcoólicas
    UPDATE public.categories SET
      subcategories = array_remove(beb_subcats, sub_name),
      subcategory_display_modes = (beb_modes - sub_name)
    WHERE id = beb_id;

    RAISE NOTICE '[%] OK: % pratos movidos pra categoria "%"', rest, moved, sub_name;
  END LOOP;
END $$;

-- ===== AUDITORIA =====
SELECT c.restaurant_id, c.name, c.slug, c.position, COUNT(d.id) AS pratos
FROM public.categories c
LEFT JOIN public.dishes d ON d.category_id = c.id
WHERE c.slug = 'saques-garrafas-e-doses'
GROUP BY c.restaurant_id, c.name, c.slug, c.position
ORDER BY c.restaurant_id;

COMMIT;

-- Se algo estranho: troca COMMIT por ROLLBACK
