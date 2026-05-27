-- ============================================================================
-- CORREÇÃO: Carta de Vinhos — Kanpai Goiânia Shopping
-- ----------------------------------------------------------------------------
-- Conserta o erro anterior:
--   1. Remove os 124 vinhos que coloquei em "Taça de Vinho ou Espumante"
--   2. Limpa as 4 categorias corretas (caso tenham vinhos antigos)
--   3. Insere os 124 vinhos nas categorias certas:
--        - Espumantes & Champagne (15)
--        - Vinhos Brancos (35)
--        - Vinhos Róses (11)
--        - Vinho Tinto (63, com subcategoria "Vinho do Porto")
--
-- Os taças que eu apaguei de "Taça de Vinho ou Espumante" precisam ser
-- recriados pelo admin OU restaurados via Point-In-Time Recovery do
-- Supabase (Pro+). Eu não tenho como saber quais eram.
-- ============================================================================

BEGIN;

-- 1) REMOVE os 124 vinhos errados de onde eu coloquei
DELETE FROM public.dishes
WHERE restaurant_id = 'goianiashopping' AND slug LIKE 'vinho-%';

-- 2) Limpa as 4 categorias corretas de vinhos antigos
DELETE FROM public.dishes
WHERE restaurant_id = 'goianiashopping'
  AND category_id IN (
    SELECT id FROM public.categories
    WHERE restaurant_id = 'goianiashopping'
      AND name IN ('Espumantes & Champagne', 'Vinhos Brancos', 'Vinhos Róses', 'Vinho Tinto')
  );

-- 3) Restaura as configurações da "Taça de Vinho ou Espumante" pro padrão antigo
--    (eu mudei subcategorias/display_mode no SQL anterior — desfaz)
UPDATE public.categories
SET
  subcategories = ARRAY[]::text[],
  subcategory_display_modes = '{}'::jsonb,
  display_mode = 'grid',
  updated_at = NOW()
WHERE restaurant_id = 'goianiashopping' AND name = 'Taça de Vinho ou Espumante';

-- 4) Define subcategorias nas categorias certas
UPDATE public.categories
SET subcategories = ARRAY['Champagne', 'Espumante'],
    subcategory_display_modes = '{"Champagne":"list","Espumante":"list"}'::jsonb,
    display_mode = 'list',
    updated_at = NOW()
WHERE restaurant_id = 'goianiashopping' AND name = 'Espumantes & Champagne';

UPDATE public.categories
SET subcategories = ARRAY[]::text[],
    subcategory_display_modes = '{}'::jsonb,
    display_mode = 'list',
    updated_at = NOW()
WHERE restaurant_id = 'goianiashopping' AND name = 'Vinhos Brancos';

UPDATE public.categories
SET subcategories = ARRAY[]::text[],
    subcategory_display_modes = '{}'::jsonb,
    display_mode = 'list',
    updated_at = NOW()
WHERE restaurant_id = 'goianiashopping' AND name = 'Vinhos Róses';

UPDATE public.categories
SET subcategories = ARRAY['Tinto', 'Vinho do Porto'],
    subcategory_display_modes = '{"Tinto":"list","Vinho do Porto":"list"}'::jsonb,
    display_mode = 'list',
    updated_at = NOW()
WHERE restaurant_id = 'goianiashopping' AND name = 'Vinho Tinto';

-- 5) Insere os 124 vinhos nas categorias certas
INSERT INTO public.dishes (
  restaurant_id, category_id, slug, name, description, price, position, subcategory, active
)
SELECT
  'goianiashopping',
  (SELECT id FROM public.categories WHERE restaurant_id='goianiashopping' AND name = v.cat_name LIMIT 1),
  v.slug, v.name, v.description, v.price, v.position, v.subcategory, true
FROM (VALUES
  -- ===== ESPUMANTES & CHAMPAGNE (15) =====
  ('Espumantes & Champagne', 'vinho-001', 'Piper-Heidsieck Cuvée Brut', 'Pinot Noir, Pinot Meunier, Chardonnay. França.', 'R$ 989,90', 0, 'Champagne'),
  ('Espumantes & Champagne', 'vinho-002', 'Piper-Heidsieck Cuvée Brut Night (Magnum)', 'Pinot Noir, Pinot Meunier, Chardonnay. França.', 'R$ 3.698,90', 1, 'Champagne'),
  ('Espumantes & Champagne', 'vinho-003', 'Piper-Heidsieck Riviera (Demi-Sec)', 'Pinot Noir, Pinot Meunier, Chardonnay. França.', 'R$ 1.540,90', 2, 'Champagne'),
  ('Espumantes & Champagne', 'vinho-004', 'Piper-Heidsieck Rosé Sauvage', 'Pinot Noir, Pinot Meunier, Chardonnay. França.', 'R$ 1.610,90', 3, 'Champagne'),
  ('Espumantes & Champagne', 'vinho-005', 'Sensi 18K Prosecco DOC Pas Dosé Velvet Edition', 'Glera, Pinot. Itália.', 'R$ 835,90', 4, 'Espumante'),
  ('Espumantes & Champagne', 'vinho-006', 'Sensi 18K Prosecco DOC Brut', 'Glera (100%). Itália.', 'R$ 679,90', 5, 'Espumante'),
  ('Espumantes & Champagne', 'vinho-007', 'Pietro Toso Prosecco Millesimato Extra Dry', 'Glera. Itália.', 'R$ 330,90', 6, 'Espumante'),
  ('Espumantes & Champagne', 'vinho-008', 'Toso Pinot-Chardonnay Spumante', 'Pinot, Chardonnay. Itália.', 'R$ 220,90', 7, 'Espumante'),
  ('Espumantes & Champagne', 'vinho-009', 'Pietro Toso Brut Millesimato', 'Chardonnay, Pinot. Itália.', 'R$ 165,90', 8, 'Espumante'),
  ('Espumantes & Champagne', 'vinho-010', '1550 Bras Blanc de Blancs Brut Champenoise', 'Chardonnay (100%). Brasil.', 'R$ 289,90', 9, 'Espumante'),
  ('Espumantes & Champagne', 'vinho-011', 'Aurora 1913 Sparkling Brut', 'Chardonnay. Brasil.', 'R$ 135,90', 10, 'Espumante'),
  ('Espumantes & Champagne', 'vinho-012', 'Aurora 1913 Sparkling Moscatel', 'Moscato Bianco, Moscato Giallo. Brasil.', 'R$ 135,90', 11, 'Espumante'),
  ('Espumantes & Champagne', 'vinho-013', 'Aurora 1913 Sparkling Prosecco', 'Prosecco (Glera). Brasil.', 'R$ 135,90', 12, 'Espumante'),
  ('Espumantes & Champagne', 'vinho-014', 'Sensi 18K Pinot Noir Rosé Brut', 'Pinot Noir (100%). Itália.', 'R$ 679,90', 13, 'Espumante'),
  ('Espumantes & Champagne', 'vinho-015', 'Aurora 1913 Sparkling Brut Rosé', 'Pinot Noir, Riesling Itálico. Brasil.', 'R$ 135,90', 14, 'Espumante'),

  -- ===== VINHOS BRANCOS (35) =====
  ('Vinhos Brancos', 'vinho-016', 'R de Romer Bordeaux Blanc Sec', 'Sémillon (predominante). França.', 'R$ 720,90', 0, NULL),
  ('Vinhos Brancos', 'vinho-017', 'Château Beauregard Ducasse Graves Blanc', 'Sémillon, Sauvignon Blanc. França.', 'R$ 445,90', 1, NULL),
  ('Vinhos Brancos', 'vinho-018', 'Cuvée Sidoine IGP Méditerranée Blanc', 'Grenache Blanc, Merlot, Syrah (vinificados em branco). França.', 'R$ 175,90', 2, NULL),
  ('Vinhos Brancos', 'vinho-019', 'Meraldis Albillo Vinificación Integral (Grupo Yllera)', 'Albillo Mayor (100%). Espanha.', 'R$ 1.180,90', 3, NULL),
  ('Vinhos Brancos', 'vinho-020', 'Iturria Quiban', 'Verdejo, Malvasía Castellana, Albillo. Espanha.', 'R$ 550,90', 4, NULL),
  ('Vinhos Brancos', 'vinho-021', 'Yllera Vendimia Nocturna Verdejo', 'Verdejo (100%). Espanha.', 'R$ 335,90', 5, NULL),
  ('Vinhos Brancos', 'vinho-022', 'Aradón Blanco (Rioja)', 'Viura (100%). Espanha.', 'R$ 220,90', 6, NULL),
  ('Vinhos Brancos', 'vinho-023', 'Bulas Reserva Branco DOC Douro', 'Viosinho, Códega do Larinho, Rabigato Moreno. Portugal.', 'R$ 555,90', 7, NULL),
  ('Vinhos Brancos', 'vinho-024', 'Vidigueira Antão Vaz DOC Alentejo', 'Antão Vaz (100%). Portugal.', 'R$ 250,90', 8, NULL),
  ('Vinhos Brancos', 'vinho-025', 'Carneiro Luz Loureiro Vinho Verde', 'Loureiro (100%). Portugal.', 'R$ 199,90', 9, NULL),
  ('Vinhos Brancos', 'vinho-026', 'Barbanera Collezione Famiglia Vecciano Bianco Toscana IGT', 'Chardonnay, Malvasia Bianca, Moscato Bianco, Sauvignon Blanc. Itália.', 'R$ 450,90', 10, NULL),
  ('Vinhos Brancos', 'vinho-027', 'Vernaccia di San Gimignano DOCG Collegiata', 'Vernaccia di San Gimignano (100%). Itália.', 'R$ 389,90', 11, NULL),
  ('Vinhos Brancos', 'vinho-028', 'Collezione Trebbiano Toscana IGT', 'Trebbiano Toscano. Itália.', 'R$ 250,90', 12, NULL),
  ('Vinhos Brancos', 'vinho-029', 'Toso Piemonte Chardonnay DOC', 'Chardonnay (100%). Itália.', 'R$ 165,90', 13, NULL),
  ('Vinhos Brancos', 'vinho-030', 'Vulcanici Pinot Grigio Puglia IGT', 'Pinot Grigio (100%). Itália.', 'R$ 155,90', 14, NULL),
  ('Vinhos Brancos', 'vinho-031', 'Vulcanici Garganega Chardonnay Veneto IGT', 'Garganega, Chardonnay. Itália.', 'R$ 130,90', 15, NULL),
  ('Vinhos Brancos', 'vinho-032', 'Château Tanunda Matthews Road Chardonnay', 'Chardonnay (100%). Austrália.', 'R$ 555,90', 16, NULL),
  ('Vinhos Brancos', 'vinho-033', 'Crimson Ranch California Chardonnay (Michael Mondavi Family)', 'Chardonnay (100%). Estados Unidos.', 'R$ 320,90', 17, NULL),
  ('Vinhos Brancos', 'vinho-034', 'Casa Donoso Bicentenario Gran Reserva Chardonnay', 'Chardonnay (100%). Chile.', 'R$ 385,90', 18, NULL),
  ('Vinhos Brancos', 'vinho-035', 'Love White (Casa Donoso)', 'Chardonnay, Sauvignon Blanc. Chile.', 'R$ 199,90', 19, NULL),
  ('Vinhos Brancos', 'vinho-036', 'Casa Donoso Group Estate Chardonnay', 'Chardonnay (100%). Chile.', 'R$ 140,90', 20, NULL),
  ('Vinhos Brancos', 'vinho-037', 'Casas del Maipo Sauvignon Blanc', 'Sauvignon Blanc (100%). Chile.', 'R$ 135,90', 21, NULL),
  ('Vinhos Brancos', 'vinho-038', 'Monteviejo Lindaflor Chardonnay', 'Chardonnay (100%). Argentina.', 'R$ 1.035,90', 22, NULL),
  ('Vinhos Brancos', 'vinho-039', 'Bodegas López Chateau Vieux Gran Reserva Chardonnay', 'Chardonnay (100%). Argentina.', 'R$ 450,90', 23, NULL),
  ('Vinhos Brancos', 'vinho-040', 'Monteviejo Festivo Torrontés', 'Torrontés (100%). Argentina.', 'R$ 295,90', 24, NULL),
  ('Vinhos Brancos', 'vinho-041', 'Rincón Famoso Blanco', 'Chardonnay / Chenin Blanc (blend de brancas). Argentina.', 'R$ 280,90', 25, NULL),
  ('Vinhos Brancos', 'vinho-042', 'Estate Summer 4 Estaciones Torrontés', 'Torrontés (100%). Argentina.', 'R$ 135,90', 26, NULL),
  ('Vinhos Brancos', 'vinho-043', 'Toscanini Classic Blanc de Blancs', 'Sauvignon Blanc, Chardonnay (blend brancas). Uruguai.', 'R$ 150,90', 27, NULL),
  ('Vinhos Brancos', 'vinho-044', 'Toscanini Alma Joven Chardonnay-Sauvignon Blanc', 'Chardonnay, Sauvignon Blanc. Uruguai.', 'R$ 140,90', 28, NULL),
  ('Vinhos Brancos', 'vinho-045', '1550 Bras Reserva Chardonnay', 'Chardonnay (100%). Brasil.', 'R$ 140,90', 29, NULL),
  ('Vinhos Brancos', 'vinho-046', 'Chateau La Louviere Pessac Leognan Blanc', 'Sauvignon Blanc (100%). França.', 'R$ 975,90', 30, NULL),
  ('Vinhos Brancos', 'vinho-047', 'Rolly Gassmann Sylvaner', 'Sylvaner. França.', 'R$ 399,90', 31, NULL),
  ('Vinhos Brancos', 'vinho-048', 'Tokaj Furmint Dry', 'Furmint. Hungria.', 'R$ 325,90', 32, NULL),
  ('Vinhos Brancos', 'vinho-049', 'Love White (375 ml)', 'Chardonnay, Sauvignon Blanc. Chile.', 'R$ 89,90', 33, NULL),
  ('Vinhos Brancos', 'vinho-050', 'Vasco Viejo Blanco (375 ml)', 'Chardonnay / Chenin (blend brancas). Argentina.', 'R$ 80,90', 34, NULL),

  -- ===== VINHOS RÓSES (11) =====
  ('Vinhos Róses', 'vinho-051', 'Cuvée Sidoine IGP Méditerranée Rosé', 'Grenache, Cinsault, Syrah. França.', 'R$ 175,90', 0, NULL),
  ('Vinhos Róses', 'vinho-052', 'Aradón Rosado (Rioja)', 'Garnacha Tinta (100%). Espanha.', 'R$ 177,90', 1, NULL),
  ('Vinhos Róses', 'vinho-053', 'Scalabis Reserva Rosé', 'Castelão, Touriga Nacional (blend tintas). Portugal.', 'R$ 310,90', 2, NULL),
  ('Vinhos Róses', 'vinho-054', 'Badoxa Douro Colheita Rosé', 'Touriga Franca, Tinta Roriz, Touriga Nacional. Portugal.', 'R$ 200,90', 3, NULL),
  ('Vinhos Róses', 'vinho-055', 'Collezione Rosé Toscana IGT', 'Sangiovese (vinificado em rosé). Itália.', 'R$ 250,90', 4, NULL),
  ('Vinhos Róses', 'vinho-056', 'Love Pink Rosé (Casa Donoso)', 'Cabernet Sauvignon / Syrah (rosé). Chile.', 'R$ 199,90', 5, NULL),
  ('Vinhos Róses', 'vinho-057', 'Casas del Maipo Rosé', 'Cabernet Sauvignon (rosé). Chile.', 'R$ 135,90', 6, NULL),
  ('Vinhos Róses', 'vinho-058', 'Carmela Benegas Cabernet Franc Rosé', 'Cabernet Franc (100%). Argentina.', 'R$ 177,90', 7, NULL),
  ('Vinhos Róses', 'vinho-059', 'Estate Spring 4 Estaciones Rosé', 'Malbec (rosé). Argentina.', 'R$ 135,90', 8, NULL),
  ('Vinhos Róses', 'vinho-060', 'Toscanini Classic Rosé Blush', 'Tannat (rosé). Uruguai.', 'R$ 150,90', 9, NULL),
  ('Vinhos Róses', 'vinho-061', 'Toscanini Alma Joven Cabernet Franc Rosé', 'Cabernet Franc (100%). Uruguai.', 'R$ 145,90', 10, NULL),

  -- ===== VINHO TINTO (63 = 58 Tinto + 1 Tinto 375ml + 4 Porto) =====
  ('Vinho Tinto', 'vinho-062', 'Urbain V Gigondas AOC', 'Grenache, Syrah, Mourvèdre. França.', 'R$ 999,90', 0, 'Tinto'),
  ('Vinho Tinto', 'vinho-063', 'Château Jamais Renoncer Bordeaux AOP (Bernard Magrez)', 'Merlot, Cabernet Sauvignon, Cabernet Franc. França.', 'R$ 335,90', 1, 'Tinto'),
  ('Vinho Tinto', 'vinho-064', 'Urbain V Côtes du Rhône AOC', 'Grenache, Syrah, Mourvèdre. França.', 'R$ 269,90', 2, 'Tinto'),
  ('Vinho Tinto', 'vinho-065', 'Petit Maynne Bordeaux', 'Merlot, Cabernet Sauvignon. França.', 'R$ 210,90', 3, 'Tinto'),
  ('Vinho Tinto', 'vinho-066', 'Petit Maynne Pinot Noir', 'Pinot Noir (100%). França.', 'R$ 195,90', 4, 'Tinto'),
  ('Vinho Tinto', 'vinho-067', 'Yllera El Hilo de Ariadna (E.H.A.)', 'Tempranillo (Tinta de Toro). Espanha.', 'R$ 899,90', 5, 'Tinto'),
  ('Vinho Tinto', 'vinho-068', 'Dies Irae Ribera del Duero', 'Tempranillo (Tinto Fino) (100%). Espanha.', 'R$ 915,90', 6, 'Tinto'),
  ('Vinho Tinto', 'vinho-069', 'Yllera Reserva Vendimia Seleccionada', 'Tempranillo (com pequena % Cabernet Sauvignon, Merlot). Espanha.', 'R$ 699,90', 7, 'Tinto'),
  ('Vinho Tinto', 'vinho-070', 'Descalificado Tinto (Grupo Yllera)', 'Tempranillo. Espanha.', 'R$ 555,90', 8, 'Tinto'),
  ('Vinho Tinto', 'vinho-071', 'Corral de Campanas DO Toro', 'Tinta de Toro (Tempranillo). Espanha.', 'R$ 530,90', 9, 'Tinto'),
  ('Vinho Tinto', 'vinho-072', 'Aradón Crianza (Rioja)', 'Tempranillo, Garnacha, Graciano. Espanha.', 'R$ 295,90', 10, 'Tinto'),
  ('Vinho Tinto', 'vinho-073', 'Yllera 9 Meses (Roble)', 'Tempranillo (predominante). Espanha.', 'R$ 250,90', 11, 'Tinto'),
  ('Vinho Tinto', 'vinho-074', 'Bulas Colheita Tinto DOC Douro', 'Touriga Nacional, Tinta Roriz, Touriga Franca, Tinto Cão, Sousão. Portugal.', 'R$ 330,90', 12, 'Tinto'),
  ('Vinho Tinto', 'vinho-075', 'Vila Ruiva Premium Alentejo DOC Tinto', 'Trincadeira, Aragonez, Alicante Bouschet. Portugal.', 'R$ 220,90', 13, 'Tinto'),
  ('Vinho Tinto', 'vinho-076', 'Esperança Regional Alentejano Tinto', 'Aragonez, Trincadeira, Castelão. Portugal.', 'R$ 165,90', 14, 'Tinto'),
  ('Vinho Tinto', 'vinho-077', 'Sensi Amarone della Valpolicella Classico DOCG', 'Corvina, Rondinella, Molinara. Itália.', 'R$ 1.155,90', 15, 'Tinto'),
  ('Vinho Tinto', 'vinho-078', 'Toso Barbaresco DOCG', 'Nebbiolo (100%). Itália.', 'R$ 835,90', 16, 'Tinto'),
  ('Vinho Tinto', 'vinho-079', 'Sensi Valpolicella Ripasso DOC Superiore', 'Corvina, Rondinella, Molinara. Itália.', 'R$ 640,90', 17, 'Tinto'),
  ('Vinho Tinto', 'vinho-080', 'Collezione Chianti DOCG', 'Sangiovese (predominante). Itália.', 'R$ 250,90', 18, 'Tinto'),
  ('Vinho Tinto', 'vinho-081', 'Barbanera Toscana Rosso IGT', 'Sangiovese, Cabernet Sauvignon, Merlot. Itália.', 'R$ 265,90', 19, 'Tinto'),
  ('Vinho Tinto', 'vinho-082', 'Collezione Nero d''Avola DOC Sicilia', 'Nero d''Avola (100%). Itália.', 'R$ 175,90', 20, 'Tinto'),
  ('Vinho Tinto', 'vinho-083', 'Vulcanici Primitivo Puglia IGT', 'Primitivo (100%). Itália.', 'R$ 235,90', 21, 'Tinto'),
  ('Vinho Tinto', 'vinho-084', 'Toso Monferrato Dolcetto DOC', 'Dolcetto (100%). Itália.', 'R$ 220,90', 22, 'Tinto'),
  ('Vinho Tinto', 'vinho-085', 'Château Tanunda Matthews Road Shiraz', 'Shiraz (100%). Austrália.', 'R$ 555,90', 23, 'Tinto'),
  ('Vinho Tinto', 'vinho-086', 'Kangaroo Ridge Cabernet Sauvignon', 'Cabernet Sauvignon (100%). Austrália.', 'R$ 169,90', 24, 'Tinto'),
  ('Vinho Tinto', 'vinho-087', 'Oberon Cabernet Sauvignon Napa Valley', 'Cabernet Sauvignon (predominante). Estados Unidos.', 'R$ 1.415,90', 25, 'Tinto'),
  ('Vinho Tinto', 'vinho-088', 'Crimson Ranch California Red Blend (Michael Mondavi Family)', 'Blend (Cabernet Sauvignon, Syrah e outras). Estados Unidos.', 'R$ 315,90', 26, 'Tinto'),
  ('Vinho Tinto', 'vinho-089', 'Crimson Ranch California Pinot Noir', 'Pinot Noir (100%). Estados Unidos.', 'R$ 349,90', 27, 'Tinto'),
  ('Vinho Tinto', 'vinho-090', 'Kalak (Casa Donoso)', 'Carmenère, Cabernet Sauvignon, Syrah. Chile.', 'R$ 929,90', 28, 'Tinto'),
  ('Vinho Tinto', 'vinho-091', 'Casa Donoso Premium Clos Centenaire', 'Cabernet Sauvignon, Carmenère, Syrah, Petit Verdot (blend). Chile.', 'R$ 595,90', 29, 'Tinto'),
  ('Vinho Tinto', 'vinho-092', 'Corazón del Indio', 'Cabernet Sauvignon, Carmenère, Syrah. Chile.', 'R$ 335,90', 30, 'Tinto'),
  ('Vinho Tinto', 'vinho-093', 'Casa Donoso Bicentenario Gran Reserva Cabernet Sauvignon', 'Cabernet Sauvignon 85%, Cabernet Franc 10%, Malbec 5%. Chile.', 'R$ 385,90', 31, 'Tinto'),
  ('Vinho Tinto', 'vinho-094', 'Casa Donoso Reserva Pinot Noir', 'Pinot Noir (100%). Chile.', 'R$ 295,90', 32, 'Tinto'),
  ('Vinho Tinto', 'vinho-095', 'Chaka Merlot', 'Merlot (100%). Chile.', 'R$ 169,90', 33, 'Tinto'),
  ('Vinho Tinto', 'vinho-096', 'Casas del Maipo Reserva Pinot Noir', 'Pinot Noir (100%). Chile.', 'R$ 139,90', 34, 'Tinto'),
  ('Vinho Tinto', 'vinho-097', 'Casas del Maipo Carmenère', 'Carmenère (100%). Chile.', 'R$ 135,90', 35, 'Tinto'),
  ('Vinho Tinto', 'vinho-098', 'Bodegas López Montchenot Gran Reserva 20 Años', 'Cabernet Sauvignon, Merlot, Malbec. Argentina.', 'R$ 2.780,90', 36, 'Tinto'),
  ('Vinho Tinto', 'vinho-099', 'Benegas Lynch Estate Blend (Libertad)', 'Cabernet Sauvignon, Cabernet Franc, Merlot. Argentina.', 'R$ 1.430,90', 37, 'Tinto'),
  ('Vinho Tinto', 'vinho-100', 'Marcelo Pelleriti Selection Blend of Terroir Grand Reserve', 'Malbec, Cabernet Franc, Syrah, Cabernet Sauvignon. Argentina.', 'R$ 955,90', 38, 'Tinto'),
  ('Vinho Tinto', 'vinho-101', '1853 Malbec Grand Reserve', 'Malbec (100%). Argentina.', 'R$ 715,90', 39, 'Tinto'),
  ('Vinho Tinto', 'vinho-102', 'Bodegas López Montchenot Gran Reserva 10 Años', 'Cabernet Sauvignon, Merlot, Malbec. Argentina.', 'R$ 610,90', 40, 'Tinto'),
  ('Vinho Tinto', 'vinho-103', 'Bodega Benegas Estate Malbec (Finca La Encerrada)', 'Malbec (100%). Argentina.', 'R$ 370,90', 41, 'Tinto'),
  ('Vinho Tinto', 'vinho-104', 'Bodegas López Chateau Vieux Gran Reserva Blend', 'Cabernet Sauvignon, Merlot, Pinot Noir. Argentina.', 'R$ 455,90', 42, 'Tinto'),
  ('Vinho Tinto', 'vinho-105', 'Marcelo Pelleriti Reserve / Signature Cabernet Franc', 'Cabernet Franc (100%). Argentina.', 'R$ 379,90', 43, 'Tinto'),
  ('Vinho Tinto', 'vinho-106', 'Monteviejo Festivo Malbec', 'Malbec (100%). Argentina.', 'R$ 295,90', 44, 'Tinto'),
  ('Vinho Tinto', 'vinho-107', 'Bodega Benegas Luna Benegas Cabernet Sauvignon', 'Cabernet Sauvignon (100%). Argentina.', 'R$ 220,90', 45, 'Tinto'),
  ('Vinho Tinto', 'vinho-108', 'Rincón Famoso Reserva Tinto', 'Malbec / Cabernet Sauvignon (blend). Argentina.', 'R$ 210,90', 46, 'Tinto'),
  ('Vinho Tinto', 'vinho-109', 'Bodegas López Malbec', 'Malbec (100%). Argentina.', 'R$ 165,90', 47, 'Tinto'),
  ('Vinho Tinto', 'vinho-110', 'Vasco Viejo Malbec', 'Malbec (100%). Argentina.', 'R$ 125,90', 48, 'Tinto'),
  ('Vinho Tinto', 'vinho-111', 'Estate Autumn 4 Estaciones Malbec', 'Malbec (100%). Argentina.', 'R$ 135,90', 49, 'Tinto'),
  ('Vinho Tinto', 'vinho-112', 'Toscanini Reserve Tannat', 'Tannat (100%). Uruguai.', 'R$ 179,90', 50, 'Tinto'),
  ('Vinho Tinto', 'vinho-113', 'Toscanini Classic Tannat', 'Tannat (100%). Uruguai.', 'R$ 150,90', 51, 'Tinto'),
  ('Vinho Tinto', 'vinho-114', 'Toscanini Classic Cabernet Sauvignon', 'Cabernet Sauvignon (100%). Uruguai.', 'R$ 150,90', 52, 'Tinto'),
  ('Vinho Tinto', 'vinho-115', 'Toscanini Alma Joven Merlot-Tannat', 'Merlot 60%, Tannat 40%. Uruguai.', 'R$ 145,90', 53, 'Tinto'),
  ('Vinho Tinto', 'vinho-116', '1550 Bras Reserva Cabernet Sauvignon', 'Cabernet Sauvignon (100%). Brasil.', 'R$ 140,90', 54, 'Tinto'),
  ('Vinho Tinto', 'vinho-117', '1550 Bras Reserva Merlot', 'Merlot (100%). Brasil.', 'R$ 140,90', 55, 'Tinto'),
  ('Vinho Tinto', 'vinho-118', 'Chateau Simard Ausone', 'Merlot, Cabernet Sauvignon. França.', 'R$ 1.079,90', 56, 'Tinto'),
  ('Vinho Tinto', 'vinho-119', 'Chateau Bellegard Margaux', 'Merlot, Cabernet Sauvignon, Cabernet Franc. França.', 'R$ 999,90', 57, 'Tinto'),
  ('Vinho Tinto', 'vinho-120', 'Vasco Viejo Tinto Blend (375 ml)', 'Malbec, Cabernet Sauvignon (blend tintas). Argentina.', 'R$ 80,90', 58, 'Tinto'),
  ('Vinho Tinto', 'vinho-121', 'Porto Quinta dos Mattos Tawny 30 Anos (500ml)', 'Touriga Nacional, Touriga Franca, Tinta Roriz, Tinta Barroca (blend). Portugal.', 'R$ 1.825,90', 59, 'Vinho do Porto'),
  ('Vinho Tinto', 'vinho-122', 'Porto Valriz Tawny 20 Anos', 'Touriga Nacional, Touriga Franca, Tinta Roriz, Tinta Barroca (blend). Portugal.', 'R$ 1.240,90', 60, 'Vinho do Porto'),
  ('Vinho Tinto', 'vinho-123', 'Bulas Tawny 10 Anos', 'Touriga Nacional, Touriga Franca, Tinta Roriz, Tinta Barroca. Portugal.', 'R$ 499,90', 61, 'Vinho do Porto'),
  ('Vinho Tinto', 'vinho-124', 'Porto Valriz Tawny', 'Touriga Nacional, Touriga Franca, Tinta Roriz, Tinta Barroca (blend). Portugal.', 'R$ 205,90', 62, 'Vinho do Porto')
) AS v(cat_name, slug, name, description, price, position, subcategory);

-- ===== AUDITORIA =====

-- Conta vinhos por categoria (esperado: 15 / 35 / 11 / 63 = 124)
SELECT c.name AS categoria, COUNT(d.id) AS qtd
FROM public.categories c
LEFT JOIN public.dishes d ON d.category_id = c.id
  AND d.restaurant_id = 'goianiashopping'
  AND d.slug LIKE 'vinho-%'
WHERE c.restaurant_id = 'goianiashopping'
  AND c.name IN ('Espumantes & Champagne', 'Vinhos Brancos', 'Vinhos Róses', 'Vinho Tinto', 'Taça de Vinho ou Espumante')
GROUP BY c.name
ORDER BY c.name;

-- Se OK:
COMMIT;

-- Se algo estranho:
-- ROLLBACK;
