-- ============================================================================
-- Consolida as 5 categorias de vinho numa única "Carta de Vinhos" — GS
-- ----------------------------------------------------------------------------
-- Antes (5 categorias separadas):
--   Taça de Vinho ou Espumante / Espumantes & Champagne / Vinhos Brancos /
--   Vinhos Róses / Vinho Tinto
-- Depois (1 categoria, 5 subcategorias):
--   Carta de Vinhos
--     ├─ Taça de Vinho ou Espumante
--     ├─ Espumantes & Champagne
--     ├─ Vinhos Brancos
--     ├─ Vinhos Róses
--     └─ Vinho Tinto
--
-- Reaproveita a categoria de menor `position` entre as 5 (vira "Carta de
-- Vinhos") e move os pratos das outras 4 pra dentro dela. O agrupamento
-- por país é substituido pelo tipo (país continua na descrição).
--
-- Idempotente o suficiente: roda dentro de transação, audita no fim.
-- ============================================================================

BEGIN;

DO $$
DECLARE
  carta_id uuid;
  wine_names text[] := ARRAY[
    'Taça de Vinho ou Espumante',
    'Espumantes & Champagne',
    'Vinhos Brancos',
    'Vinhos Róses',
    'Vinho Tinto'
  ];
BEGIN
  -- Escolhe a categoria de vinho com menor position pra virar "Carta de Vinhos"
  SELECT id INTO carta_id
  FROM public.categories
  WHERE restaurant_id = 'goianiashopping' AND name = ANY(wine_names)
  ORDER BY position
  LIMIT 1;

  IF carta_id IS NULL THEN
    RAISE EXCEPTION 'Nenhuma categoria de vinho encontrada em goianiashopping';
  END IF;

  -- 1. Seta subcategory = nome da categoria atual em TODOS os pratos das 5
  --    (substitui o agrupamento por país pelo tipo)
  UPDATE public.dishes d
  SET subcategory = c.name
  FROM public.categories c
  WHERE d.category_id = c.id
    AND c.restaurant_id = 'goianiashopping'
    AND c.name = ANY(wine_names);

  -- 2. Move todos os pratos das 5 categorias pra carta_id
  UPDATE public.dishes
  SET category_id = carta_id
  WHERE restaurant_id = 'goianiashopping'
    AND category_id IN (
      SELECT id FROM public.categories
      WHERE restaurant_id = 'goianiashopping' AND name = ANY(wine_names)
    );

  -- 3. Transforma a categoria escolhida em "Carta de Vinhos"
  UPDATE public.categories
  SET
    name = 'Carta de Vinhos',
    slug = 'carta-de-vinhos',
    display_mode = 'list',
    subcategories = ARRAY[
      'Taça de Vinho ou Espumante',
      'Espumantes & Champagne',
      'Vinhos Brancos',
      'Vinhos Róses',
      'Vinho Tinto'
    ],
    subcategory_display_modes = '{
      "Taça de Vinho ou Espumante": "list",
      "Espumantes & Champagne": "list",
      "Vinhos Brancos": "list",
      "Vinhos Róses": "list",
      "Vinho Tinto": "list"
    }'::jsonb,
    updated_at = NOW()
  WHERE id = carta_id;

  -- 4. Deleta as 4 categorias antigas restantes (a renomeada nao bate mais)
  DELETE FROM public.categories
  WHERE restaurant_id = 'goianiashopping' AND name = ANY(wine_names);
END $$;

-- ===== AUDITORIA =====
-- Esperado: 1 linha "Carta de Vinhos" com 5 subcategorias
SELECT name, slug, subcategories
FROM public.categories
WHERE restaurant_id = 'goianiashopping' AND slug = 'carta-de-vinhos';

-- Contagem de pratos por subcategoria (deve somar 124 + os 9 taças = 133)
SELECT d.subcategory, COUNT(*) AS qtd
FROM public.dishes d
JOIN public.categories c ON c.id = d.category_id
WHERE c.restaurant_id = 'goianiashopping' AND c.slug = 'carta-de-vinhos'
GROUP BY d.subcategory
ORDER BY MIN(d.position);

COMMIT;

-- Se algo estranho: troca COMMIT por ROLLBACK
