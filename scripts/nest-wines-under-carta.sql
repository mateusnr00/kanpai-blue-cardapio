-- ============================================================================
-- Reestrutura "Carta de Vinhos" em navegação aninhada — GS
-- ----------------------------------------------------------------------------
-- Antes: 1 categoria "Carta de Vinhos" com tudo dentro (subcategory = tipo).
-- Depois:
--   Carta de Vinhos (PAI, vira hub de cards)
--     ├─ Espumantes & Champagne  (subcats = país)
--     ├─ Vinhos Brancos          (subcats = país)
--     ├─ Vinhos Róses            (subcats = país)
--     ├─ Vinho Tinto             (subcats = país)
--     └─ Taça de Vinho ou Espumante (subcats = Taça/Meia Garrafa/Rolha)
--
-- PRÉ-REQUISITO: rodar antes scripts/add-category-parent-id.sql
-- ============================================================================

BEGIN;

DO $$
DECLARE
  carta_id uuid;
  base_gradient text;
  base_pos int;
  c_esp uuid; c_branco uuid; c_rose uuid; c_tinto uuid; c_taca uuid;
BEGIN
  SELECT id, gradient, position INTO carta_id, base_gradient, base_pos
  FROM public.categories
  WHERE restaurant_id = 'goianiashopping' AND slug = 'carta-de-vinhos';
  IF carta_id IS NULL THEN
    RAISE EXCEPTION 'Categoria carta-de-vinhos nao encontrada';
  END IF;

  -- Cria os 5 filhos
  INSERT INTO public.categories (restaurant_id, slug, name, number, description, gradient, position, display_mode, parent_id, active)
  VALUES ('goianiashopping','espumantes-champagne','Espumantes & Champagne','','',base_gradient, base_pos + 1,'list', carta_id, true)
  RETURNING id INTO c_esp;

  INSERT INTO public.categories (restaurant_id, slug, name, number, description, gradient, position, display_mode, parent_id, active)
  VALUES ('goianiashopping','vinhos-brancos','Vinhos Brancos','','',base_gradient, base_pos + 2,'list', carta_id, true)
  RETURNING id INTO c_branco;

  INSERT INTO public.categories (restaurant_id, slug, name, number, description, gradient, position, display_mode, parent_id, active)
  VALUES ('goianiashopping','vinhos-roses','Vinhos Róses','','',base_gradient, base_pos + 3,'list', carta_id, true)
  RETURNING id INTO c_rose;

  INSERT INTO public.categories (restaurant_id, slug, name, number, description, gradient, position, display_mode, parent_id, active)
  VALUES ('goianiashopping','vinho-tinto','Vinho Tinto','','',base_gradient, base_pos + 4,'list', carta_id, true)
  RETURNING id INTO c_tinto;

  INSERT INTO public.categories (restaurant_id, slug, name, number, description, gradient, position, display_mode, parent_id, active)
  VALUES ('goianiashopping','taca-de-vinho-ou-espumante','Taça de Vinho ou Espumante','','',base_gradient, base_pos + 5,'list', carta_id, true)
  RETURNING id INTO c_taca;

  -- Subcategorias (países em ordem alfabética) de cada filho
  UPDATE public.categories SET
    subcategories = ARRAY['Brasil','França','Itália'],
    subcategory_display_modes = '{"Brasil":"list","França":"list","Itália":"list"}'::jsonb
  WHERE id = c_esp;

  UPDATE public.categories SET
    subcategories = ARRAY['Argentina','Austrália','Brasil','Chile','Espanha','Estados Unidos','França','Hungria','Itália','Portugal','Uruguai'],
    subcategory_display_modes = '{"Argentina":"list","Austrália":"list","Brasil":"list","Chile":"list","Espanha":"list","Estados Unidos":"list","França":"list","Hungria":"list","Itália":"list","Portugal":"list","Uruguai":"list"}'::jsonb
  WHERE id = c_branco;

  UPDATE public.categories SET
    subcategories = ARRAY['Argentina','Chile','Espanha','França','Itália','Portugal','Uruguai'],
    subcategory_display_modes = '{"Argentina":"list","Chile":"list","Espanha":"list","França":"list","Itália":"list","Portugal":"list","Uruguai":"list"}'::jsonb
  WHERE id = c_rose;

  UPDATE public.categories SET
    subcategories = ARRAY['Argentina','Austrália','Brasil','Chile','Espanha','Estados Unidos','França','Itália','Portugal','Uruguai'],
    subcategory_display_modes = '{"Argentina":"list","Austrália":"list","Brasil":"list","Chile":"list","Espanha":"list","Estados Unidos":"list","França":"list","Itália":"list","Portugal":"list","Uruguai":"list"}'::jsonb
  WHERE id = c_tinto;

  UPDATE public.categories SET
    subcategories = ARRAY['Vinhos e Espumantes Taça','Vinhos Meia Garrafa','Rolha'],
    subcategory_display_modes = '{"Vinhos e Espumantes Taça":"list","Vinhos Meia Garrafa":"list","Rolha":"list"}'::jsonb
  WHERE id = c_taca;

  -- Carta de Vinhos vira hub puro (sem subcategorias, sem pratos)
  UPDATE public.categories SET
    subcategories = ARRAY[]::text[],
    subcategory_display_modes = '{}'::jsonb,
    display_mode = 'grid'
  WHERE id = carta_id;

  -- Move cada prato pro filho certo + seta subcategory = país (ou subcat taça)
  UPDATE public.dishes d SET
    category_id = CASE m.tipo
      WHEN 'esp' THEN c_esp
      WHEN 'branco' THEN c_branco
      WHEN 'rose' THEN c_rose
      WHEN 'tinto' THEN c_tinto
      WHEN 'taca' THEN c_taca
    END,
    subcategory = m.subcat
  FROM (VALUES
    -- Espumantes & Champagne
    ('vinho-001','esp','França'),('vinho-002','esp','França'),('vinho-003','esp','França'),('vinho-004','esp','França'),
    ('vinho-005','esp','Itália'),('vinho-006','esp','Itália'),('vinho-007','esp','Itália'),('vinho-008','esp','Itália'),('vinho-009','esp','Itália'),('vinho-014','esp','Itália'),
    ('vinho-010','esp','Brasil'),('vinho-011','esp','Brasil'),('vinho-012','esp','Brasil'),('vinho-013','esp','Brasil'),('vinho-015','esp','Brasil'),
    -- Vinhos Brancos
    ('vinho-016','branco','França'),('vinho-017','branco','França'),('vinho-018','branco','França'),('vinho-046','branco','França'),('vinho-047','branco','França'),
    ('vinho-019','branco','Espanha'),('vinho-020','branco','Espanha'),('vinho-021','branco','Espanha'),('vinho-022','branco','Espanha'),
    ('vinho-023','branco','Portugal'),('vinho-024','branco','Portugal'),('vinho-025','branco','Portugal'),
    ('vinho-026','branco','Itália'),('vinho-027','branco','Itália'),('vinho-028','branco','Itália'),('vinho-029','branco','Itália'),('vinho-030','branco','Itália'),('vinho-031','branco','Itália'),
    ('vinho-032','branco','Austrália'),
    ('vinho-033','branco','Estados Unidos'),
    ('vinho-034','branco','Chile'),('vinho-035','branco','Chile'),('vinho-036','branco','Chile'),('vinho-037','branco','Chile'),('vinho-049','branco','Chile'),
    ('vinho-038','branco','Argentina'),('vinho-039','branco','Argentina'),('vinho-040','branco','Argentina'),('vinho-041','branco','Argentina'),('vinho-042','branco','Argentina'),('vinho-050','branco','Argentina'),
    ('vinho-043','branco','Uruguai'),('vinho-044','branco','Uruguai'),
    ('vinho-045','branco','Brasil'),
    ('vinho-048','branco','Hungria'),
    -- Vinhos Róses
    ('vinho-051','rose','França'),
    ('vinho-052','rose','Espanha'),
    ('vinho-053','rose','Portugal'),('vinho-054','rose','Portugal'),
    ('vinho-055','rose','Itália'),
    ('vinho-056','rose','Chile'),('vinho-057','rose','Chile'),
    ('vinho-058','rose','Argentina'),('vinho-059','rose','Argentina'),
    ('vinho-060','rose','Uruguai'),('vinho-061','rose','Uruguai'),
    -- Vinho Tinto
    ('vinho-062','tinto','França'),('vinho-063','tinto','França'),('vinho-064','tinto','França'),('vinho-065','tinto','França'),('vinho-066','tinto','França'),('vinho-118','tinto','França'),('vinho-119','tinto','França'),
    ('vinho-067','tinto','Espanha'),('vinho-068','tinto','Espanha'),('vinho-069','tinto','Espanha'),('vinho-070','tinto','Espanha'),('vinho-071','tinto','Espanha'),('vinho-072','tinto','Espanha'),('vinho-073','tinto','Espanha'),
    ('vinho-074','tinto','Portugal'),('vinho-075','tinto','Portugal'),('vinho-076','tinto','Portugal'),('vinho-121','tinto','Portugal'),('vinho-122','tinto','Portugal'),('vinho-123','tinto','Portugal'),('vinho-124','tinto','Portugal'),
    ('vinho-077','tinto','Itália'),('vinho-078','tinto','Itália'),('vinho-079','tinto','Itália'),('vinho-080','tinto','Itália'),('vinho-081','tinto','Itália'),('vinho-082','tinto','Itália'),('vinho-083','tinto','Itália'),('vinho-084','tinto','Itália'),
    ('vinho-085','tinto','Austrália'),('vinho-086','tinto','Austrália'),
    ('vinho-087','tinto','Estados Unidos'),('vinho-088','tinto','Estados Unidos'),('vinho-089','tinto','Estados Unidos'),
    ('vinho-090','tinto','Chile'),('vinho-091','tinto','Chile'),('vinho-092','tinto','Chile'),('vinho-093','tinto','Chile'),('vinho-094','tinto','Chile'),('vinho-095','tinto','Chile'),('vinho-096','tinto','Chile'),('vinho-097','tinto','Chile'),
    ('vinho-098','tinto','Argentina'),('vinho-099','tinto','Argentina'),('vinho-100','tinto','Argentina'),('vinho-101','tinto','Argentina'),('vinho-102','tinto','Argentina'),('vinho-103','tinto','Argentina'),('vinho-104','tinto','Argentina'),('vinho-105','tinto','Argentina'),('vinho-106','tinto','Argentina'),('vinho-107','tinto','Argentina'),('vinho-108','tinto','Argentina'),('vinho-109','tinto','Argentina'),('vinho-110','tinto','Argentina'),('vinho-111','tinto','Argentina'),('vinho-120','tinto','Argentina'),
    ('vinho-112','tinto','Uruguai'),('vinho-113','tinto','Uruguai'),('vinho-114','tinto','Uruguai'),('vinho-115','tinto','Uruguai'),
    ('vinho-116','tinto','Brasil'),('vinho-117','tinto','Brasil'),
    -- Taça de Vinho ou Espumante
    ('taca-vinho-tinto','taca','Vinhos e Espumantes Taça'),
    ('taca-vinho-branco','taca','Vinhos e Espumantes Taça'),
    ('taca-vinho-rose','taca','Vinhos e Espumantes Taça'),
    ('taca-espumante-brut-branco','taca','Vinhos e Espumantes Taça'),
    ('taca-espumante-brut-rose','taca','Vinhos e Espumantes Taça'),
    ('meia-garrafa-love-white','taca','Vinhos Meia Garrafa'),
    ('meia-garrafa-lopez-malbec','taca','Vinhos Meia Garrafa'),
    ('meia-garrafa-faro-chardonnay','taca','Vinhos Meia Garrafa'),
    ('rolha','taca','Rolha')
  ) AS m(slug, tipo, subcat)
  WHERE d.restaurant_id = 'goianiashopping' AND d.slug = m.slug;
END $$;

-- ===== AUDITORIA =====
-- Estrutura: Carta de Vinhos (pai) + 5 filhos
SELECT c.name, c.slug,
  (SELECT name FROM public.categories p WHERE p.id = c.parent_id) AS pai
FROM public.categories c
WHERE c.restaurant_id = 'goianiashopping'
  AND (c.slug = 'carta-de-vinhos' OR c.parent_id = (SELECT id FROM public.categories WHERE restaurant_id='goianiashopping' AND slug='carta-de-vinhos'))
ORDER BY c.position;

-- Pratos por filho (deve dar 15 / 35 / 11 / 63 / 9 = 133)
SELECT c.name AS tipo, COUNT(d.id) AS qtd
FROM public.categories c
JOIN public.dishes d ON d.category_id = c.id
WHERE c.restaurant_id = 'goianiashopping'
  AND c.parent_id = (SELECT id FROM public.categories WHERE restaurant_id='goianiashopping' AND slug='carta-de-vinhos')
GROUP BY c.name
ORDER BY c.name;

COMMIT;

-- Se algo estranho: troca COMMIT por ROLLBACK
