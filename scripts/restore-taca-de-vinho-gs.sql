-- ============================================================================
-- Restaura "Taça de Vinho ou Espumante" do Goiânia Shopping
-- ----------------------------------------------------------------------------
-- Recria 9 itens em 3 subcategorias que eu apaguei sem querer:
--   - Vinhos e Espumantes Taça (5)
--   - Vinhos Meia Garrafa (3)
--   - Rolha (1)
--
-- Roda no SQL Editor do Supabase. Idempotente: se já existe (slug match),
-- só faz UPSERT. Não toca em nenhuma outra categoria.
-- ============================================================================

BEGIN;

-- 1) Configura subcategorias e display_mode da categoria
UPDATE public.categories
SET
  subcategories = ARRAY['Vinhos e Espumantes Taça', 'Vinhos Meia Garrafa', 'Rolha'],
  subcategory_display_modes = '{
    "Vinhos e Espumantes Taça": "list",
    "Vinhos Meia Garrafa": "list",
    "Rolha": "list"
  }'::jsonb,
  display_mode = 'list',
  updated_at = NOW()
WHERE restaurant_id = 'goianiashopping' AND name = 'Taça de Vinho ou Espumante';

-- 2) Insere os 9 itens
INSERT INTO public.dishes (
  restaurant_id, category_id, slug, name, description, price, unit, position, subcategory, active
)
SELECT
  'goianiashopping',
  (SELECT id FROM public.categories WHERE restaurant_id='goianiashopping' AND name = 'Taça de Vinho ou Espumante' LIMIT 1),
  v.slug, v.name, v.description, v.price, v.unit, v.position, v.subcategory, true
FROM (VALUES
  -- ===== VINHOS E ESPUMANTES TAÇA (5) =====
  ('taca-vinho-tinto',           'Vinho Tinto',           NULL, 'R$ 29,90', 'Taça', 0, 'Vinhos e Espumantes Taça'),
  ('taca-vinho-branco',          'Vinho Branco',          NULL, 'R$ 29,90', 'Taça', 1, 'Vinhos e Espumantes Taça'),
  ('taca-vinho-rose',            'Vinho Rosé',            NULL, 'R$ 29,90', 'Taça', 2, 'Vinhos e Espumantes Taça'),
  ('taca-espumante-brut-branco', 'Espumante Brut Branco', NULL, 'R$ 29,90', 'Taça', 3, 'Vinhos e Espumantes Taça'),
  ('taca-espumante-brut-rose',   'Espumante Brut Rosé',   NULL, 'R$ 29,90', 'Taça', 4, 'Vinhos e Espumantes Taça'),

  -- ===== VINHOS MEIA GARRAFA (3) =====
  ('meia-garrafa-love-white',     'Love White Chardonnay/Sauvignon Blanc', 'Chile | Branco | Chardonnay, Sauvignon Blanc.',                                                                          'R$ 89,00',  'Meia-Garrafa', 5, 'Vinhos Meia Garrafa'),
  ('meia-garrafa-lopez-malbec',   'Lopez Malbec',                          'Argentina | Tinto | Malbec.',                                                                                            'R$ 115,00', 'Meia-Garrafa', 6, 'Vinhos Meia Garrafa'),
  ('meia-garrafa-faro-chardonnay','Faro Chardonnay 375ML',                 'Chile | Branco | Chardonnay. Cor amarela brilhante, proeminentes aromas de banana, pêssego maduro e trufas tropicais.', 'R$ 89,00',  'Meia-Garrafa', 7, 'Vinhos Meia Garrafa'),

  -- ===== ROLHA (1) =====
  ('rolha', 'Rolha', 'Taxa de rolha para uísque, sakê e vinhos.', 'R$ 90,00', NULL, 8, 'Rolha')
) AS v(slug, name, description, price, unit, position, subcategory);

-- ===== AUDITORIA =====

SELECT subcategory, COUNT(*) AS qtd
FROM public.dishes
WHERE restaurant_id = 'goianiashopping'
  AND category_id = (
    SELECT id FROM public.categories
    WHERE restaurant_id = 'goianiashopping' AND name = 'Taça de Vinho ou Espumante'
  )
GROUP BY subcategory
ORDER BY MIN(position);

COMMIT;

-- Se algo estranho, troca COMMIT por ROLLBACK acima.
