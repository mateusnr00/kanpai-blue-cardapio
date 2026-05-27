-- ============================================================================
-- Carta de Vinhos — Kanpai Goiânia Shopping (substituição total)
-- ----------------------------------------------------------------------------
-- 124 vinhos da nova carta. Apaga os vinhos atuais do GS e insere os novos.
-- Categorias afetadas: a unica que matchar "vinho" no nome dentro do
-- restaurante goianiashopping. NÃO toca em outras unidades.
--
-- Como rodar:
--   1. Abre o SQL Editor do Supabase
--   2. Cola TUDO esse arquivo
--   3. Roda. Se o resultado da auditoria fizer sentido, mantem o COMMIT
--      no final. Senao, troca por ROLLBACK e nada é gravado.
--
-- Pré-requisitos:
--   - O restaurante 'goianiashopping' já tem uma categoria com a palavra
--     "vinho" no nome (qualquer slug). Se não tem, crie pelo admin primeiro
--     antes de rodar esse SQL.
-- ============================================================================

BEGIN;

-- 1) Subcategorias + display mode (lista, sem foto)
UPDATE public.categories
SET
  subcategories = ARRAY[
    'Champagne',
    'Espumante',
    'Branco',
    'Branco 375ml',
    'Rosé',
    'Tinto',
    'Tinto 375ml',
    'Vinho do Porto'
  ],
  subcategory_display_modes = '{
    "Champagne": "list",
    "Espumante": "list",
    "Branco": "list",
    "Branco 375ml": "list",
    "Rosé": "list",
    "Tinto": "list",
    "Tinto 375ml": "list",
    "Vinho do Porto": "list"
  }'::jsonb,
  display_mode = 'list',
  updated_at = NOW()
WHERE restaurant_id = 'goianiashopping' AND name ILIKE '%vinho%';

-- 2) Apaga os vinhos atuais do GS
DELETE FROM public.dishes
WHERE restaurant_id = 'goianiashopping'
  AND category_id IN (
    SELECT id FROM public.categories
    WHERE restaurant_id = 'goianiashopping' AND name ILIKE '%vinho%'
  );

-- 3) Insere a nova carta (124 vinhos)
INSERT INTO public.dishes (
  restaurant_id, category_id, slug, name, description, price, position, subcategory, active
)
SELECT
  'goianiashopping',
  (SELECT id FROM public.categories WHERE restaurant_id='goianiashopping' AND name ILIKE '%vinho%' LIMIT 1),
  v.slug, v.name, v.description, v.price, v.position, v.subcategory, true
FROM (VALUES
  -- ===== CHAMPAGNE =====
  ('vinho-001', 'Piper-Heidsieck Cuvée Brut', 'Pinot Noir, Pinot Meunier, Chardonnay. França.', 'R$ 989,90', 0, 'Champagne'),
  ('vinho-002', 'Piper-Heidsieck Cuvée Brut Night (Magnum)', 'Pinot Noir, Pinot Meunier, Chardonnay. França.', 'R$ 3.698,90', 1, 'Champagne'),
  ('vinho-003', 'Piper-Heidsieck Riviera (Demi-Sec)', 'Pinot Noir, Pinot Meunier, Chardonnay. França.', 'R$ 1.540,90', 2, 'Champagne'),
  ('vinho-004', 'Piper-Heidsieck Rosé Sauvage', 'Pinot Noir, Pinot Meunier, Chardonnay. França.', 'R$ 1.610,90', 3, 'Champagne'),

  -- ===== ESPUMANTE =====
  ('vinho-005', 'Sensi 18K Prosecco DOC Pas Dosé Velvet Edition', 'Glera, Pinot. Itália.', 'R$ 835,90', 4, 'Espumante'),
  ('vinho-006', 'Sensi 18K Prosecco DOC Brut', 'Glera (100%). Itália.', 'R$ 679,90', 5, 'Espumante'),
  ('vinho-007', 'Pietro Toso Prosecco Millesimato Extra Dry', 'Glera. Itália.', 'R$ 330,90', 6, 'Espumante'),
  ('vinho-008', 'Toso Pinot-Chardonnay Spumante', 'Pinot, Chardonnay. Itália.', 'R$ 220,90', 7, 'Espumante'),
  ('vinho-009', 'Pietro Toso Brut Millesimato', 'Chardonnay, Pinot. Itália.', 'R$ 165,90', 8, 'Espumante'),
  ('vinho-010', '1550 Bras Blanc de Blancs Brut Champenoise', 'Chardonnay (100%). Brasil.', 'R$ 289,90', 9, 'Espumante'),
  ('vinho-011', 'Aurora 1913 Sparkling Brut', 'Chardonnay. Brasil.', 'R$ 135,90', 10, 'Espumante'),
  ('vinho-012', 'Aurora 1913 Sparkling Moscatel', 'Moscato Bianco, Moscato Giallo. Brasil.', 'R$ 135,90', 11, 'Espumante'),
  ('vinho-013', 'Aurora 1913 Sparkling Prosecco', 'Prosecco (Glera). Brasil.', 'R$ 135,90', 12, 'Espumante'),
  ('vinho-014', 'Sensi 18K Pinot Noir Rosé Brut', 'Pinot Noir (100%). Itália.', 'R$ 679,90', 13, 'Espumante'),
  ('vinho-015', 'Aurora 1913 Sparkling Brut Rosé', 'Pinot Noir, Riesling Itálico. Brasil.', 'R$ 135,90', 14, 'Espumante'),

  -- ===== BRANCO =====
  ('vinho-016', 'R de Romer Bordeaux Blanc Sec', 'Sémillon (predominante). França.', 'R$ 720,90', 15, 'Branco'),
  ('vinho-017', 'Château Beauregard Ducasse Graves Blanc', 'Sémillon, Sauvignon Blanc. França.', 'R$ 445,90', 16, 'Branco'),
  ('vinho-018', 'Cuvée Sidoine IGP Méditerranée Blanc', 'Grenache Blanc, Merlot, Syrah (vinificados em branco). França.', 'R$ 175,90', 17, 'Branco'),
  ('vinho-019', 'Meraldis Albillo Vinificación Integral (Grupo Yllera)', 'Albillo Mayor (100%). Espanha.', 'R$ 1.180,90', 18, 'Branco'),
  ('vinho-020', 'Iturria Quiban', 'Verdejo, Malvasía Castellana, Albillo. Espanha.', 'R$ 550,90', 19, 'Branco'),
  ('vinho-021', 'Yllera Vendimia Nocturna Verdejo', 'Verdejo (100%). Espanha.', 'R$ 335,90', 20, 'Branco'),
  ('vinho-022', 'Aradón Blanco (Rioja)', 'Viura (100%). Espanha.', 'R$ 220,90', 21, 'Branco'),
  ('vinho-023', 'Bulas Reserva Branco DOC Douro', 'Viosinho, Códega do Larinho, Rabigato Moreno. Portugal.', 'R$ 555,90', 22, 'Branco'),
  ('vinho-024', 'Vidigueira Antão Vaz DOC Alentejo', 'Antão Vaz (100%). Portugal.', 'R$ 250,90', 23, 'Branco'),
  ('vinho-025', 'Carneiro Luz Loureiro Vinho Verde', 'Loureiro (100%). Portugal.', 'R$ 199,90', 24, 'Branco'),
  ('vinho-026', 'Barbanera Collezione Famiglia Vecciano Bianco Toscana IGT', 'Chardonnay, Malvasia Bianca, Moscato Bianco, Sauvignon Blanc. Itália.', 'R$ 450,90', 25, 'Branco'),
  ('vinho-027', 'Vernaccia di San Gimignano DOCG Collegiata', 'Vernaccia di San Gimignano (100%). Itália.', 'R$ 389,90', 26, 'Branco'),
  ('vinho-028', 'Collezione Trebbiano Toscana IGT', 'Trebbiano Toscano. Itália.', 'R$ 250,90', 27, 'Branco'),
  ('vinho-029', 'Toso Piemonte Chardonnay DOC', 'Chardonnay (100%). Itália.', 'R$ 165,90', 28, 'Branco'),
  ('vinho-030', 'Vulcanici Pinot Grigio Puglia IGT', 'Pinot Grigio (100%). Itália.', 'R$ 155,90', 29, 'Branco'),
  ('vinho-031', 'Vulcanici Garganega Chardonnay Veneto IGT', 'Garganega, Chardonnay. Itália.', 'R$ 130,90', 30, 'Branco'),
  ('vinho-032', 'Château Tanunda Matthews Road Chardonnay', 'Chardonnay (100%). Austrália.', 'R$ 555,90', 31, 'Branco'),
  ('vinho-033', 'Crimson Ranch California Chardonnay (Michael Mondavi Family)', 'Chardonnay (100%). Estados Unidos.', 'R$ 320,90', 32, 'Branco'),
  ('vinho-034', 'Casa Donoso Bicentenario Gran Reserva Chardonnay', 'Chardonnay (100%). Chile.', 'R$ 385,90', 33, 'Branco'),
  ('vinho-035', 'Love White (Casa Donoso)', 'Chardonnay, Sauvignon Blanc. Chile.', 'R$ 199,90', 34, 'Branco'),
  ('vinho-036', 'Casa Donoso Group Estate Chardonnay', 'Chardonnay (100%). Chile.', 'R$ 140,90', 35, 'Branco'),
  ('vinho-037', 'Casas del Maipo Sauvignon Blanc', 'Sauvignon Blanc (100%). Chile.', 'R$ 135,90', 36, 'Branco'),
  ('vinho-038', 'Monteviejo Lindaflor Chardonnay', 'Chardonnay (100%). Argentina.', 'R$ 1.035,90', 37, 'Branco'),
  ('vinho-039', 'Bodegas López Chateau Vieux Gran Reserva Chardonnay', 'Chardonnay (100%). Argentina.', 'R$ 450,90', 38, 'Branco'),
  ('vinho-040', 'Monteviejo Festivo Torrontés', 'Torrontés (100%). Argentina.', 'R$ 295,90', 39, 'Branco'),
  ('vinho-041', 'Rincón Famoso Blanco', 'Chardonnay / Chenin Blanc (blend de brancas). Argentina.', 'R$ 280,90', 40, 'Branco'),
  ('vinho-042', 'Estate Summer 4 Estaciones Torrontés', 'Torrontés (100%). Argentina.', 'R$ 135,90', 41, 'Branco'),
  ('vinho-043', 'Toscanini Classic Blanc de Blancs', 'Sauvignon Blanc, Chardonnay (blend brancas). Uruguai.', 'R$ 150,90', 42, 'Branco'),
  ('vinho-044', 'Toscanini Alma Joven Chardonnay-Sauvignon Blanc', 'Chardonnay, Sauvignon Blanc. Uruguai.', 'R$ 140,90', 43, 'Branco'),
  ('vinho-045', '1550 Bras Reserva Chardonnay', 'Chardonnay (100%). Brasil.', 'R$ 140,90', 44, 'Branco'),
  ('vinho-046', 'Chateau La Louviere Pessac Leognan Blanc', 'Sauvignon Blanc (100%). França.', 'R$ 975,90', 45, 'Branco'),
  ('vinho-047', 'Rolly Gassmann Sylvaner', 'Sylvaner. França.', 'R$ 399,90', 46, 'Branco'),
  ('vinho-048', 'Tokaj Furmint Dry', 'Furmint. Hungria.', 'R$ 325,90', 47, 'Branco'),

  -- ===== BRANCO 375ml =====
  ('vinho-049', 'Love White (375 ml)', 'Chardonnay, Sauvignon Blanc. Chile.', 'R$ 89,90', 48, 'Branco 375ml'),
  ('vinho-050', 'Vasco Viejo Blanco (375 ml)', 'Chardonnay / Chenin (blend brancas). Argentina.', 'R$ 80,90', 49, 'Branco 375ml'),

  -- ===== ROSÉ =====
  ('vinho-051', 'Cuvée Sidoine IGP Méditerranée Rosé', 'Grenache, Cinsault, Syrah. França.', 'R$ 175,90', 50, 'Rosé'),
  ('vinho-052', 'Aradón Rosado (Rioja)', 'Garnacha Tinta (100%). Espanha.', 'R$ 177,90', 51, 'Rosé'),
  ('vinho-053', 'Scalabis Reserva Rosé', 'Castelão, Touriga Nacional (blend tintas). Portugal.', 'R$ 310,90', 52, 'Rosé'),
  ('vinho-054', 'Badoxa Douro Colheita Rosé', 'Touriga Franca, Tinta Roriz, Touriga Nacional. Portugal.', 'R$ 200,90', 53, 'Rosé'),
  ('vinho-055', 'Collezione Rosé Toscana IGT', 'Sangiovese (vinificado em rosé). Itália.', 'R$ 250,90', 54, 'Rosé'),
  ('vinho-056', 'Love Pink Rosé (Casa Donoso)', 'Cabernet Sauvignon / Syrah (rosé). Chile.', 'R$ 199,90', 55, 'Rosé'),
  ('vinho-057', 'Casas del Maipo Rosé', 'Cabernet Sauvignon (rosé). Chile.', 'R$ 135,90', 56, 'Rosé'),
  ('vinho-058', 'Carmela Benegas Cabernet Franc Rosé', 'Cabernet Franc (100%). Argentina.', 'R$ 177,90', 57, 'Rosé'),
  ('vinho-059', 'Estate Spring 4 Estaciones Rosé', 'Malbec (rosé). Argentina.', 'R$ 135,90', 58, 'Rosé'),
  ('vinho-060', 'Toscanini Classic Rosé Blush', 'Tannat (rosé). Uruguai.', 'R$ 150,90', 59, 'Rosé'),
  ('vinho-061', 'Toscanini Alma Joven Cabernet Franc Rosé', 'Cabernet Franc (100%). Uruguai.', 'R$ 145,90', 60, 'Rosé'),

  -- ===== TINTO =====
  ('vinho-062', 'Urbain V Gigondas AOC', 'Grenache, Syrah, Mourvèdre. França.', 'R$ 999,90', 61, 'Tinto'),
  ('vinho-063', 'Château Jamais Renoncer Bordeaux AOP (Bernard Magrez)', 'Merlot, Cabernet Sauvignon, Cabernet Franc. França.', 'R$ 335,90', 62, 'Tinto'),
  ('vinho-064', 'Urbain V Côtes du Rhône AOC', 'Grenache, Syrah, Mourvèdre. França.', 'R$ 269,90', 63, 'Tinto'),
  ('vinho-065', 'Petit Maynne Bordeaux', 'Merlot, Cabernet Sauvignon. França.', 'R$ 210,90', 64, 'Tinto'),
  ('vinho-066', 'Petit Maynne Pinot Noir', 'Pinot Noir (100%). França.', 'R$ 195,90', 65, 'Tinto'),
  ('vinho-067', 'Yllera El Hilo de Ariadna (E.H.A.)', 'Tempranillo (Tinta de Toro). Espanha.', 'R$ 899,90', 66, 'Tinto'),
  ('vinho-068', 'Dies Irae Ribera del Duero', 'Tempranillo (Tinto Fino) (100%). Espanha.', 'R$ 915,90', 67, 'Tinto'),
  ('vinho-069', 'Yllera Reserva Vendimia Seleccionada', 'Tempranillo (com pequena % Cabernet Sauvignon, Merlot). Espanha.', 'R$ 699,90', 68, 'Tinto'),
  ('vinho-070', 'Descalificado Tinto (Grupo Yllera)', 'Tempranillo. Espanha.', 'R$ 555,90', 69, 'Tinto'),
  ('vinho-071', 'Corral de Campanas DO Toro', 'Tinta de Toro (Tempranillo). Espanha.', 'R$ 530,90', 70, 'Tinto'),
  ('vinho-072', 'Aradón Crianza (Rioja)', 'Tempranillo, Garnacha, Graciano. Espanha.', 'R$ 295,90', 71, 'Tinto'),
  ('vinho-073', 'Yllera 9 Meses (Roble)', 'Tempranillo (predominante). Espanha.', 'R$ 250,90', 72, 'Tinto'),
  ('vinho-074', 'Bulas Colheita Tinto DOC Douro', 'Touriga Nacional, Tinta Roriz, Touriga Franca, Tinto Cão, Sousão. Portugal.', 'R$ 330,90', 73, 'Tinto'),
  ('vinho-075', 'Vila Ruiva Premium Alentejo DOC Tinto', 'Trincadeira, Aragonez, Alicante Bouschet. Portugal.', 'R$ 220,90', 74, 'Tinto'),
  ('vinho-076', 'Esperança Regional Alentejano Tinto', 'Aragonez, Trincadeira, Castelão. Portugal.', 'R$ 165,90', 75, 'Tinto'),
  ('vinho-077', 'Sensi Amarone della Valpolicella Classico DOCG', 'Corvina, Rondinella, Molinara. Itália.', 'R$ 1.155,90', 76, 'Tinto'),
  ('vinho-078', 'Toso Barbaresco DOCG', 'Nebbiolo (100%). Itália.', 'R$ 835,90', 77, 'Tinto'),
  ('vinho-079', 'Sensi Valpolicella Ripasso DOC Superiore', 'Corvina, Rondinella, Molinara. Itália.', 'R$ 640,90', 78, 'Tinto'),
  ('vinho-080', 'Collezione Chianti DOCG', 'Sangiovese (predominante). Itália.', 'R$ 250,90', 79, 'Tinto'),
  ('vinho-081', 'Barbanera Toscana Rosso IGT', 'Sangiovese, Cabernet Sauvignon, Merlot. Itália.', 'R$ 265,90', 80, 'Tinto'),
  ('vinho-082', 'Collezione Nero d''Avola DOC Sicilia', 'Nero d''Avola (100%). Itália.', 'R$ 175,90', 81, 'Tinto'),
  ('vinho-083', 'Vulcanici Primitivo Puglia IGT', 'Primitivo (100%). Itália.', 'R$ 235,90', 82, 'Tinto'),
  ('vinho-084', 'Toso Monferrato Dolcetto DOC', 'Dolcetto (100%). Itália.', 'R$ 220,90', 83, 'Tinto'),
  ('vinho-085', 'Château Tanunda Matthews Road Shiraz', 'Shiraz (100%). Austrália.', 'R$ 555,90', 84, 'Tinto'),
  ('vinho-086', 'Kangaroo Ridge Cabernet Sauvignon', 'Cabernet Sauvignon (100%). Austrália.', 'R$ 169,90', 85, 'Tinto'),
  ('vinho-087', 'Oberon Cabernet Sauvignon Napa Valley', 'Cabernet Sauvignon (predominante). Estados Unidos.', 'R$ 1.415,90', 86, 'Tinto'),
  ('vinho-088', 'Crimson Ranch California Red Blend (Michael Mondavi Family)', 'Blend (Cabernet Sauvignon, Syrah e outras). Estados Unidos.', 'R$ 315,90', 87, 'Tinto'),
  ('vinho-089', 'Crimson Ranch California Pinot Noir', 'Pinot Noir (100%). Estados Unidos.', 'R$ 349,90', 88, 'Tinto'),
  ('vinho-090', 'Kalak (Casa Donoso)', 'Carmenère, Cabernet Sauvignon, Syrah. Chile.', 'R$ 929,90', 89, 'Tinto'),
  ('vinho-091', 'Casa Donoso Premium Clos Centenaire', 'Cabernet Sauvignon, Carmenère, Syrah, Petit Verdot (blend). Chile.', 'R$ 595,90', 90, 'Tinto'),
  ('vinho-092', 'Corazón del Indio', 'Cabernet Sauvignon, Carmenère, Syrah. Chile.', 'R$ 335,90', 91, 'Tinto'),
  ('vinho-093', 'Casa Donoso Bicentenario Gran Reserva Cabernet Sauvignon', 'Cabernet Sauvignon 85%, Cabernet Franc 10%, Malbec 5%. Chile.', 'R$ 385,90', 92, 'Tinto'),
  ('vinho-094', 'Casa Donoso Reserva Pinot Noir', 'Pinot Noir (100%). Chile.', 'R$ 295,90', 93, 'Tinto'),
  ('vinho-095', 'Chaka Merlot', 'Merlot (100%). Chile.', 'R$ 169,90', 94, 'Tinto'),
  ('vinho-096', 'Casas del Maipo Reserva Pinot Noir', 'Pinot Noir (100%). Chile.', 'R$ 139,90', 95, 'Tinto'),
  ('vinho-097', 'Casas del Maipo Carmenère', 'Carmenère (100%). Chile.', 'R$ 135,90', 96, 'Tinto'),
  ('vinho-098', 'Bodegas López Montchenot Gran Reserva 20 Años', 'Cabernet Sauvignon, Merlot, Malbec. Argentina.', 'R$ 2.780,90', 97, 'Tinto'),
  ('vinho-099', 'Benegas Lynch Estate Blend (Libertad)', 'Cabernet Sauvignon, Cabernet Franc, Merlot. Argentina.', 'R$ 1.430,90', 98, 'Tinto'),
  ('vinho-100', 'Marcelo Pelleriti Selection Blend of Terroir Grand Reserve', 'Malbec, Cabernet Franc, Syrah, Cabernet Sauvignon. Argentina.', 'R$ 955,90', 99, 'Tinto'),
  ('vinho-101', '1853 Malbec Grand Reserve', 'Malbec (100%). Argentina.', 'R$ 715,90', 100, 'Tinto'),
  ('vinho-102', 'Bodegas López Montchenot Gran Reserva 10 Años', 'Cabernet Sauvignon, Merlot, Malbec. Argentina.', 'R$ 610,90', 101, 'Tinto'),
  ('vinho-103', 'Bodega Benegas Estate Malbec (Finca La Encerrada)', 'Malbec (100%). Argentina.', 'R$ 370,90', 102, 'Tinto'),
  ('vinho-104', 'Bodegas López Chateau Vieux Gran Reserva Blend', 'Cabernet Sauvignon, Merlot, Pinot Noir. Argentina.', 'R$ 455,90', 103, 'Tinto'),
  ('vinho-105', 'Marcelo Pelleriti Reserve / Signature Cabernet Franc', 'Cabernet Franc (100%). Argentina.', 'R$ 379,90', 104, 'Tinto'),
  ('vinho-106', 'Monteviejo Festivo Malbec', 'Malbec (100%). Argentina.', 'R$ 295,90', 105, 'Tinto'),
  ('vinho-107', 'Bodega Benegas Luna Benegas Cabernet Sauvignon', 'Cabernet Sauvignon (100%). Argentina.', 'R$ 220,90', 106, 'Tinto'),
  ('vinho-108', 'Rincón Famoso Reserva Tinto', 'Malbec / Cabernet Sauvignon (blend). Argentina.', 'R$ 210,90', 107, 'Tinto'),
  ('vinho-109', 'Bodegas López Malbec', 'Malbec (100%). Argentina.', 'R$ 165,90', 108, 'Tinto'),
  ('vinho-110', 'Vasco Viejo Malbec', 'Malbec (100%). Argentina.', 'R$ 125,90', 109, 'Tinto'),
  ('vinho-111', 'Estate Autumn 4 Estaciones Malbec', 'Malbec (100%). Argentina.', 'R$ 135,90', 110, 'Tinto'),
  ('vinho-112', 'Toscanini Reserve Tannat', 'Tannat (100%). Uruguai.', 'R$ 179,90', 111, 'Tinto'),
  ('vinho-113', 'Toscanini Classic Tannat', 'Tannat (100%). Uruguai.', 'R$ 150,90', 112, 'Tinto'),
  ('vinho-114', 'Toscanini Classic Cabernet Sauvignon', 'Cabernet Sauvignon (100%). Uruguai.', 'R$ 150,90', 113, 'Tinto'),
  ('vinho-115', 'Toscanini Alma Joven Merlot-Tannat', 'Merlot 60%, Tannat 40%. Uruguai.', 'R$ 145,90', 114, 'Tinto'),
  ('vinho-116', '1550 Bras Reserva Cabernet Sauvignon', 'Cabernet Sauvignon (100%). Brasil.', 'R$ 140,90', 115, 'Tinto'),
  ('vinho-117', '1550 Bras Reserva Merlot', 'Merlot (100%). Brasil.', 'R$ 140,90', 116, 'Tinto'),
  ('vinho-118', 'Chateau Simard Ausone', 'Merlot, Cabernet Sauvignon. França.', 'R$ 1.079,90', 117, 'Tinto'),
  ('vinho-119', 'Chateau Bellegard Margaux', 'Merlot, Cabernet Sauvignon, Cabernet Franc. França.', 'R$ 999,90', 118, 'Tinto'),

  -- ===== TINTO 375ml =====
  ('vinho-120', 'Vasco Viejo Tinto Blend (375 ml)', 'Malbec, Cabernet Sauvignon (blend tintas). Argentina.', 'R$ 80,90', 119, 'Tinto 375ml'),

  -- ===== VINHO DO PORTO =====
  ('vinho-121', 'Porto Quinta dos Mattos Tawny 30 Anos (500ml)', 'Touriga Nacional, Touriga Franca, Tinta Roriz, Tinta Barroca (blend). Portugal.', 'R$ 1.825,90', 120, 'Vinho do Porto'),
  ('vinho-122', 'Porto Valriz Tawny 20 Anos', 'Touriga Nacional, Touriga Franca, Tinta Roriz, Tinta Barroca (blend). Portugal.', 'R$ 1.240,90', 121, 'Vinho do Porto'),
  ('vinho-123', 'Bulas Tawny 10 Anos', 'Touriga Nacional, Touriga Franca, Tinta Roriz, Tinta Barroca. Portugal.', 'R$ 499,90', 122, 'Vinho do Porto'),
  ('vinho-124', 'Porto Valriz Tawny', 'Touriga Nacional, Touriga Franca, Tinta Roriz, Tinta Barroca (blend). Portugal.', 'R$ 205,90', 123, 'Vinho do Porto')
) AS v(slug, name, description, price, position, subcategory);

-- ===== AUDITORIA =====

-- 1) Mostra categoria afetada
SELECT id, slug, name, array_length(subcategories, 1) AS qtd_subcats
FROM public.categories
WHERE restaurant_id = 'goianiashopping' AND name ILIKE '%vinho%';

-- 2) Conta vinhos por subcategoria (deve dar 4/11/33/2/11/58/1/4 = 124 total)
SELECT subcategory, COUNT(*) AS qtd
FROM public.dishes
WHERE restaurant_id = 'goianiashopping'
  AND category_id IN (
    SELECT id FROM public.categories
    WHERE restaurant_id = 'goianiashopping' AND name ILIKE '%vinho%'
  )
GROUP BY subcategory
ORDER BY MIN(position);

-- Se OK, mantem:
COMMIT;

-- Se algo estranho, troca o COMMIT acima por:
-- ROLLBACK;
