-- ============================================================================
-- Reorganiza subcategorias dos vinhos por PAÍS — Goiânia Shopping
-- ----------------------------------------------------------------------------
-- Em vez de "Tinto / Vinho do Porto" (que não fazia sentido), agrupa por
-- país de origem. Mesma ordem em todas as categorias: França, Itália,
-- Espanha, Portugal, Hungria, Estados Unidos, Austrália, Chile, Argentina,
-- Uruguai, Brasil (só inclui os países que têm vinho na categoria).
--
-- Atualiza subcategoria de cada um dos 124 vinhos + array de subcategorias
-- em cada uma das 4 categorias.
-- ============================================================================

BEGIN;

-- 1) Subcategorias por categoria (ordem: tradição vinícola)
UPDATE public.categories
SET subcategories = ARRAY['França', 'Itália', 'Brasil'],
    subcategory_display_modes = '{"França":"list","Itália":"list","Brasil":"list"}'::jsonb,
    updated_at = NOW()
WHERE restaurant_id = 'goianiashopping' AND name = 'Espumantes & Champagne';

UPDATE public.categories
SET subcategories = ARRAY['França', 'Itália', 'Espanha', 'Portugal', 'Hungria', 'Estados Unidos', 'Austrália', 'Chile', 'Argentina', 'Uruguai', 'Brasil'],
    subcategory_display_modes = '{"França":"list","Itália":"list","Espanha":"list","Portugal":"list","Hungria":"list","Estados Unidos":"list","Austrália":"list","Chile":"list","Argentina":"list","Uruguai":"list","Brasil":"list"}'::jsonb,
    updated_at = NOW()
WHERE restaurant_id = 'goianiashopping' AND name = 'Vinhos Brancos';

UPDATE public.categories
SET subcategories = ARRAY['França', 'Itália', 'Espanha', 'Portugal', 'Chile', 'Argentina', 'Uruguai'],
    subcategory_display_modes = '{"França":"list","Itália":"list","Espanha":"list","Portugal":"list","Chile":"list","Argentina":"list","Uruguai":"list"}'::jsonb,
    updated_at = NOW()
WHERE restaurant_id = 'goianiashopping' AND name = 'Vinhos Róses';

UPDATE public.categories
SET subcategories = ARRAY['França', 'Itália', 'Espanha', 'Portugal', 'Estados Unidos', 'Austrália', 'Chile', 'Argentina', 'Uruguai', 'Brasil'],
    subcategory_display_modes = '{"França":"list","Itália":"list","Espanha":"list","Portugal":"list","Estados Unidos":"list","Austrália":"list","Chile":"list","Argentina":"list","Uruguai":"list","Brasil":"list"}'::jsonb,
    updated_at = NOW()
WHERE restaurant_id = 'goianiashopping' AND name = 'Vinho Tinto';

-- 2) Atualiza subcategory de cada vinho conforme país
UPDATE public.dishes d
SET subcategory = v.subcategory
FROM (VALUES
  -- Espumantes & Champagne
  ('vinho-001', 'França'),  ('vinho-002', 'França'),  ('vinho-003', 'França'),  ('vinho-004', 'França'),
  ('vinho-005', 'Itália'),  ('vinho-006', 'Itália'),  ('vinho-007', 'Itália'),  ('vinho-008', 'Itália'),
  ('vinho-009', 'Itália'),  ('vinho-014', 'Itália'),
  ('vinho-010', 'Brasil'),  ('vinho-011', 'Brasil'),  ('vinho-012', 'Brasil'),  ('vinho-013', 'Brasil'),
  ('vinho-015', 'Brasil'),

  -- Vinhos Brancos
  ('vinho-016', 'França'),  ('vinho-017', 'França'),  ('vinho-018', 'França'),
  ('vinho-046', 'França'),  ('vinho-047', 'França'),
  ('vinho-019', 'Espanha'), ('vinho-020', 'Espanha'), ('vinho-021', 'Espanha'), ('vinho-022', 'Espanha'),
  ('vinho-023', 'Portugal'),('vinho-024', 'Portugal'),('vinho-025', 'Portugal'),
  ('vinho-026', 'Itália'),  ('vinho-027', 'Itália'),  ('vinho-028', 'Itália'),  ('vinho-029', 'Itália'),
  ('vinho-030', 'Itália'),  ('vinho-031', 'Itália'),
  ('vinho-032', 'Austrália'),
  ('vinho-033', 'Estados Unidos'),
  ('vinho-034', 'Chile'),   ('vinho-035', 'Chile'),   ('vinho-036', 'Chile'),   ('vinho-037', 'Chile'),
  ('vinho-049', 'Chile'),
  ('vinho-038', 'Argentina'),('vinho-039', 'Argentina'),('vinho-040', 'Argentina'),('vinho-041', 'Argentina'),
  ('vinho-042', 'Argentina'),('vinho-050', 'Argentina'),
  ('vinho-043', 'Uruguai'), ('vinho-044', 'Uruguai'),
  ('vinho-045', 'Brasil'),
  ('vinho-048', 'Hungria'),

  -- Vinhos Róses
  ('vinho-051', 'França'),
  ('vinho-052', 'Espanha'),
  ('vinho-053', 'Portugal'),('vinho-054', 'Portugal'),
  ('vinho-055', 'Itália'),
  ('vinho-056', 'Chile'),   ('vinho-057', 'Chile'),
  ('vinho-058', 'Argentina'),('vinho-059', 'Argentina'),
  ('vinho-060', 'Uruguai'), ('vinho-061', 'Uruguai'),

  -- Vinho Tinto
  ('vinho-062', 'França'),  ('vinho-063', 'França'),  ('vinho-064', 'França'),  ('vinho-065', 'França'),
  ('vinho-066', 'França'),  ('vinho-118', 'França'),  ('vinho-119', 'França'),
  ('vinho-067', 'Espanha'), ('vinho-068', 'Espanha'), ('vinho-069', 'Espanha'), ('vinho-070', 'Espanha'),
  ('vinho-071', 'Espanha'), ('vinho-072', 'Espanha'), ('vinho-073', 'Espanha'),
  ('vinho-074', 'Portugal'),('vinho-075', 'Portugal'),('vinho-076', 'Portugal'),
  ('vinho-121', 'Portugal'),('vinho-122', 'Portugal'),('vinho-123', 'Portugal'),('vinho-124', 'Portugal'),
  ('vinho-077', 'Itália'),  ('vinho-078', 'Itália'),  ('vinho-079', 'Itália'),  ('vinho-080', 'Itália'),
  ('vinho-081', 'Itália'),  ('vinho-082', 'Itália'),  ('vinho-083', 'Itália'),  ('vinho-084', 'Itália'),
  ('vinho-085', 'Austrália'),('vinho-086', 'Austrália'),
  ('vinho-087', 'Estados Unidos'),('vinho-088', 'Estados Unidos'),('vinho-089', 'Estados Unidos'),
  ('vinho-090', 'Chile'),   ('vinho-091', 'Chile'),   ('vinho-092', 'Chile'),   ('vinho-093', 'Chile'),
  ('vinho-094', 'Chile'),   ('vinho-095', 'Chile'),   ('vinho-096', 'Chile'),   ('vinho-097', 'Chile'),
  ('vinho-098', 'Argentina'),('vinho-099', 'Argentina'),('vinho-100', 'Argentina'),('vinho-101', 'Argentina'),
  ('vinho-102', 'Argentina'),('vinho-103', 'Argentina'),('vinho-104', 'Argentina'),('vinho-105', 'Argentina'),
  ('vinho-106', 'Argentina'),('vinho-107', 'Argentina'),('vinho-108', 'Argentina'),('vinho-109', 'Argentina'),
  ('vinho-110', 'Argentina'),('vinho-111', 'Argentina'),('vinho-120', 'Argentina'),
  ('vinho-112', 'Uruguai'), ('vinho-113', 'Uruguai'), ('vinho-114', 'Uruguai'), ('vinho-115', 'Uruguai'),
  ('vinho-116', 'Brasil'),  ('vinho-117', 'Brasil')
) AS v(slug, subcategory)
WHERE d.restaurant_id = 'goianiashopping' AND d.slug = v.slug;

-- ===== AUDITORIA =====

-- Contagem por categoria + subcategoria. Esperado:
--   Espumantes & Champagne: França 4, Itália 6, Brasil 5 = 15
--   Vinhos Brancos:         França 5, Itália 6, Espanha 4, Portugal 3, Hungria 1,
--                           EUA 1, Austrália 1, Chile 5, Argentina 6, Uruguai 2, Brasil 1 = 35
--   Vinhos Róses:           França 1, Itália 1, Espanha 1, Portugal 2,
--                           Chile 2, Argentina 2, Uruguai 2 = 11
--   Vinho Tinto:            França 7, Itália 8, Espanha 7, Portugal 7,
--                           EUA 3, Austrália 2, Chile 8, Argentina 15, Uruguai 4, Brasil 2 = 63
--   TOTAL = 124
SELECT c.name AS categoria, d.subcategory AS pais, COUNT(*) AS qtd
FROM public.dishes d
JOIN public.categories c ON c.id = d.category_id
WHERE d.restaurant_id = 'goianiashopping'
  AND d.slug LIKE 'vinho-%'
GROUP BY c.name, d.subcategory
ORDER BY c.name, d.subcategory;

COMMIT;

-- Se algo errado: troca COMMIT acima por ROLLBACK
