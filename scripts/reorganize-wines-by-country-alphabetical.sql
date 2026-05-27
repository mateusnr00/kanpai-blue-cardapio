-- ============================================================================
-- Subcategorias dos vinhos em ORDEM ALFABÉTICA — Goiânia Shopping
-- ----------------------------------------------------------------------------
-- Reordena o array de subcategorias de cada uma das 4 categorias de vinho
-- pra ficar em ordem alfabetica. Os dishes em si nao mudam (cada um ja
-- tem subcategory='Pais'), so a ORDEM em que os chips de pais aparecem
-- no site muda.
--
-- Rode DEPOIS do reorganize-wines-by-country.sql.
-- ============================================================================

BEGIN;

-- Espumantes & Champagne (Brasil, França, Itália)
UPDATE public.categories
SET subcategories = ARRAY['Brasil', 'França', 'Itália'],
    subcategory_display_modes = '{"Brasil":"list","França":"list","Itália":"list"}'::jsonb,
    updated_at = NOW()
WHERE restaurant_id = 'goianiashopping' AND name = 'Espumantes & Champagne';

-- Vinhos Brancos (Argentina, Austrália, Brasil, Chile, Espanha, Estados Unidos, França, Hungria, Itália, Portugal, Uruguai)
UPDATE public.categories
SET subcategories = ARRAY['Argentina', 'Austrália', 'Brasil', 'Chile', 'Espanha', 'Estados Unidos', 'França', 'Hungria', 'Itália', 'Portugal', 'Uruguai'],
    subcategory_display_modes = '{"Argentina":"list","Austrália":"list","Brasil":"list","Chile":"list","Espanha":"list","Estados Unidos":"list","França":"list","Hungria":"list","Itália":"list","Portugal":"list","Uruguai":"list"}'::jsonb,
    updated_at = NOW()
WHERE restaurant_id = 'goianiashopping' AND name = 'Vinhos Brancos';

-- Vinhos Róses (Argentina, Chile, Espanha, França, Itália, Portugal, Uruguai)
UPDATE public.categories
SET subcategories = ARRAY['Argentina', 'Chile', 'Espanha', 'França', 'Itália', 'Portugal', 'Uruguai'],
    subcategory_display_modes = '{"Argentina":"list","Chile":"list","Espanha":"list","França":"list","Itália":"list","Portugal":"list","Uruguai":"list"}'::jsonb,
    updated_at = NOW()
WHERE restaurant_id = 'goianiashopping' AND name = 'Vinhos Róses';

-- Vinho Tinto (Argentina, Austrália, Brasil, Chile, Espanha, Estados Unidos, França, Itália, Portugal, Uruguai)
UPDATE public.categories
SET subcategories = ARRAY['Argentina', 'Austrália', 'Brasil', 'Chile', 'Espanha', 'Estados Unidos', 'França', 'Itália', 'Portugal', 'Uruguai'],
    subcategory_display_modes = '{"Argentina":"list","Austrália":"list","Brasil":"list","Chile":"list","Espanha":"list","Estados Unidos":"list","França":"list","Itália":"list","Portugal":"list","Uruguai":"list"}'::jsonb,
    updated_at = NOW()
WHERE restaurant_id = 'goianiashopping' AND name = 'Vinho Tinto';

-- ===== AUDITORIA =====
SELECT name AS categoria, subcategories
FROM public.categories
WHERE restaurant_id = 'goianiashopping'
  AND name IN ('Espumantes & Champagne', 'Vinhos Brancos', 'Vinhos Róses', 'Vinho Tinto')
ORDER BY name;

COMMIT;
