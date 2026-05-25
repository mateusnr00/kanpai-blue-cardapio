-- =============================================================================
-- Seed: Happy Hour category + 48 dishes
--
-- Idempotente (ON CONFLICT DO NOTHING). Rode no SQL Editor do Supabase
-- (https://supabase.com/dashboard/project/_/sql) na base do Kanpai.
--
-- Estrutura:
--  - 1 categoria 'happy-hour' (subcategories: Pratos, Bebidas)
--  - 2 dishes featured (Festival Premium / Festival Premium Kanpai, R$ 179,90)
--  - 27 dishes Pratos (com preco promo + original_price)
--  - 19 dishes Bebidas
--
-- Todos os slugs com prefixo "hh-" pra evitar colisao com outras categorias.
-- =============================================================================

BEGIN;

-- 1) Categoria Happy Hour --------------------------------------------------
INSERT INTO public.categories (
  id, number, name, description, gradient, subcategories, position
)
VALUES (
  'happy-hour',
  '06',
  'Happy Hour',
  'Pratos e bebidas promocionais servidos das 17h às 20h, de domingo a quinta',
  'linear-gradient(135deg, #FFB347 0%, #FF6B35 100%)',
  ARRAY['Pratos', 'Bebidas'],
  (SELECT COALESCE(MAX(position), 0) + 1 FROM public.categories)
)
ON CONFLICT (id) DO NOTHING;

-- 2) Featured dishes (Festival Premium) ------------------------------------
INSERT INTO public.dishes (slug, category_id, name, description, price, featured, position)
VALUES
  (
    'hh-festival-premium', 'happy-hour', 'Festival Premium',
    'Bebidas inclusas: águas com e sem gás, refrigerantes, sucos de abacaxi, acerola e laranja, sodas (sabores do dia) e chopp. Servido das 17:00 às 20:00, de domingo a quinta.',
    'R$ 179,90', true, 1
  ),
  (
    'hh-festival-premium-kanpai', 'happy-hour', 'Festival Premium Kanpai',
    'Bebidas inclusas: águas com e sem gás, refrigerantes, sucos de abacaxi, acerola e laranja, sodas (sabores do dia) e chopp.',
    'R$ 179,90', true, 2
  )
ON CONFLICT (slug) DO NOTHING;

-- 3) Pratos ----------------------------------------------------------------
INSERT INTO public.dishes (slug, category_id, name, description, price, original_price, subcategory, position)
VALUES
  ('hh-mix-de-camarao', 'happy-hour', 'Mix de camarão', '4 variações de camarões empanados.', 'R$ 60,90', 'R$ 69,00', 'Pratos', 10),
  ('hh-hot-filadelphia', 'happy-hour', 'Hot Filadelphia', 'Empanado com alga e recheio de arroz, salmão e cream cheese levemente derretido.', 'R$ 36,90', 'R$ 42,90', 'Pratos', 11),
  ('hh-shimeji', 'happy-hour', 'Shimeji', 'Pequenos e delicados cogumelos shimeji, grelhados na manteiga e molho especial servidos sobre uma cama de abacaxi.', 'R$ 42,00', 'R$ 46,90', 'Pratos', 12),
  ('hh-pasteizinhos-queijo-brie', 'happy-hour', 'Pasteizinhos queijo brie', '8 unidades.', 'R$ 32,90', 'R$ 39,90', 'Pratos', 13),
  ('hh-pipoquinha-camarao-spicy', 'happy-hour', 'Pipoquinha Crocante de Camarão Spicy', NULL, 'R$ 42,90', 'R$ 57,90', 'Pratos', 14),
  ('hh-pasteizinhos-camarao', 'happy-hour', 'Pasteizinhos de Camarão', '8 unidades de pasteizinhos com recheio de bobó de camarão.', 'R$ 36,90', 'R$ 42,90', 'Pratos', 15),
  ('hh-poke-kanpai', 'happy-hour', 'Poke Kanpai', 'Cubos de salmão, atum, saint peter e abacate, crispy de couve, gohan e nori.', 'R$ 52,00', 'R$ 64,00', 'Pratos', 16),
  ('hh-carpaccio-salmao-ponzu', 'happy-hour', 'Carpaccio de Salmão ao Molho Ponzu', 'Fatias finas de salmão, molho ponzu e gergelim. 20 a 24 peças.', 'R$ 52,00', 'R$ 66,00', 'Pratos', 17),
  ('hh-carpaccio-barriga-salmao-trufado', 'happy-hour', 'Carpaccio de Barriga de Salmão Trufado', 'Finas fatias de barriga de salmão, azeite trufado, raspas de limão siciliano. 20 a 24 peças.', 'R$ 59,00', 'R$ 69,00', 'Pratos', 18),
  ('hh-carpaccio-tilapia', 'happy-hour', 'Carpaccio Tilápia', 'Finas fatias de tilápia acrescido de limão e sriracha. 20 a 24 peças.', 'R$ 46,00', 'R$ 55,00', 'Pratos', 19),
  ('hh-ussuzukuri-barriga-salmao', 'happy-hour', 'Ussuzukuri de Barriga de Salmão', 'Carpaccio de barriga de salmão, calda de limão siciliano, gergelim, pimenta dedo de moça, azeite trufado e cebolinha. 20 a 24 peças.', 'R$ 61,00', 'R$ 72,00', 'Pratos', 20),
  ('hh-sashimi-barriga-salmao', 'happy-hour', 'Sashimi de Barriga de Salmão', '6 unidades. Iguaria feita com corte de barriga de salmão, regada com azeite trufado, molho ponzu e finalizada com raspas de limão.', 'R$ 39,90', 'R$ 49,90', 'Pratos', 21),
  ('hh-sushi-kanpai', 'happy-hour', 'Sushi Kanpai', '19 peças variadas de sushis selecionados.', 'R$ 79,90', NULL, 'Pratos', 22),
  ('hh-dupla-niguiris', 'happy-hour', 'Dupla de Niguiris', NULL, 'R$ 12,90', 'R$ 15,90', 'Pratos', 23),
  ('hh-skin-roll', 'happy-hour', 'Skin Roll', NULL, 'R$ 25,90', 'R$ 31,00', 'Pratos', 24),
  ('hh-gunkan-ebi-furai', 'happy-hour', 'Gunkan Ebi Furai', 'Camarão empanado, envolto de peixe branco com cream cheese, finalizado com molho do chef e crispy de couve. 4 unidades.', 'R$ 31,90', 'R$ 38,90', 'Pratos', 25),
  ('hh-guiosa', 'happy-hour', 'Guiosa', 'Massa finíssima, crocante, leve e transparente, recheada com pernil, cebola, broto de alho, gengibre e repolho. Ligeiramente picante.', 'R$ 26,90', 'R$ 32,90', 'Pratos', 26),
  ('hh-temaki-ebi', 'happy-hour', 'Temaki Ebi', 'Enrolado de alga e arroz em formato de cone com recheio de camarão e cebolinha.', 'R$ 29,90', 'R$ 37,00', 'Pratos', 27),
  ('hh-temaki-ebi-empanado', 'happy-hour', 'Temaki Ebi Empanado', 'Enrolado de alga e arroz em formato de cone com recheio de camarão empanado e cebolinha.', 'R$ 31,90', 'R$ 39,00', 'Pratos', 28),
  ('hh-temaki-hot-holl', 'happy-hour', 'Temaki Hot Holl', 'Enrolado de alga e arroz empanado em formato de cone com recheio de salmão e cream cheese.', 'R$ 33,90', 'R$ 42,00', 'Pratos', 29),
  ('hh-temaki-maguro', 'happy-hour', 'Temaki Magurô', 'Enrolado de alga e arroz em formato de cone com recheio de atum e cebolinha.', 'R$ 29,00', 'R$ 37,00', 'Pratos', 30),
  ('hh-temaki-salmao-especial', 'happy-hour', 'Temaki Salmão Especial', 'Enrolado de alga e arroz em formato de cone com recheio de salmão, cream cheese e cebolinha.', 'R$ 31,90', 'R$ 38,00', 'Pratos', 31),
  ('hh-temaki-salmao-skin', 'happy-hour', 'Temaki Salmão Skin', 'Salmão skin, cubos de salmão fresco, cebolinha e molho tarê. Enrolado de alga e arroz em formato de cone. 1 unidade.', 'R$ 28,90', 'R$ 35,00', 'Pratos', 32),
  ('hh-temaki-shiromi', 'happy-hour', 'Temaki Shiromi', 'Peixe branco, cebolinha e raspas de limão siciliano. Enrolado de alga e arroz em formato de cone. 1 unidade.', 'R$ 27,90', 'R$ 35,00', 'Pratos', 33),
  ('hh-temaki-tako', 'happy-hour', 'Temaki Tako', 'Enrolado de alga e arroz em formato de cone com recheio de polvo e cebolinha.', 'R$ 35,90', 'R$ 42,00', 'Pratos', 34),
  ('hh-temarizushi-salmao', 'happy-hour', 'Temarizushi de Salmão', NULL, 'R$ 32,90', 'R$ 36,90', 'Pratos', 35),
  ('hh-rolinho-primavera', 'happy-hour', 'Rolinho Primavera', 'Rolinhos de massa harumaki recheado com vegetais e pernil.', 'R$ 29,90', 'R$ 34,90', 'Pratos', 36)
ON CONFLICT (slug) DO NOTHING;

-- 4) Bebidas ---------------------------------------------------------------
INSERT INTO public.dishes (slug, category_id, name, description, price, original_price, subcategory, position)
VALUES
  ('hh-chopp', 'happy-hour', 'Chopp', 'Consumo apenas no restaurante.', 'R$ 7,90', 'R$ 14,90', 'Bebidas', 40),
  ('hh-spaten', 'happy-hour', 'Spaten Long Neck', 'Consumo apenas no restaurante.', 'R$ 9,90', 'R$ 12,90', 'Bebidas', 41),
  ('hh-budweiser', 'happy-hour', 'Budweiser', NULL, 'R$ 9,90', 'R$ 12,90', 'Bebidas', 42),
  ('hh-tropical-gin', 'happy-hour', 'Tropical Gin', 'Red Bull tropical, gin tanqueray e rodela de laranja.', 'R$ 33,00', 'R$ 39,90', 'Bebidas', 43),
  ('hh-mandarim-sake', 'happy-hour', 'Mandarim Sake', 'Saquê, xarope de tangerina e limão.', 'R$ 30,00', 'R$ 35,90', 'Bebidas', 44),
  ('hh-fitzgerald', 'happy-hour', 'Fitzgerald', 'Gin tanqueray, limão, xarope simples e angostura (cítrico e aromático).', 'R$ 33,00', 'R$ 39,90', 'Bebidas', 45),
  ('hh-imperador', 'happy-hour', 'Imperador', 'Sakê, xarope de gengibre, limão e vinho tinto (cítrico e picante).', 'R$ 30,00', 'R$ 35,90', 'Bebidas', 46),
  ('hh-siciliano', 'happy-hour', 'Siciliano', 'Sakê, limão siciliano e uva niagra.', 'R$ 30,00', 'R$ 35,90', 'Bebidas', 47),
  ('hh-exotic-tangerine', 'happy-hour', 'Exotic Tangerine', 'Sakê, morango, tangerina e gengibre.', 'R$ 30,00', 'R$ 35,90', 'Bebidas', 48),
  ('hh-gin-tonic', 'happy-hour', 'Gin Tonic', 'Gin tanqueray, tônica, limão siciliano, finalizado com especiarias.', 'R$ 30,00', 'R$ 35,90', 'Bebidas', 49),
  ('hh-tantas-gin', 'happy-hour', 'Tantas Gin', 'Preparo de frutas vermelhas com maçã verde, maracujá, gin tanqueray e bacardi de maçã verde.', 'R$ 33,00', 'R$ 39,90', 'Bebidas', 50),
  ('hh-moscow-blue', 'happy-hour', 'Moscow Blue', 'Vodka ketel one, mix cítrico e espuma de gengibre.', 'R$ 33,00', 'R$ 39,90', 'Bebidas', 51),
  ('hh-batida-frutas-sake', 'happy-hour', 'Batida de Frutas (Sakê)', 'Consumo apenas no restaurante.', 'R$ 28,90', 'R$ 33,90', 'Bebidas', 52),
  ('hh-batida-frutas-vodka', 'happy-hour', 'Batida de Frutas (Vodka)', 'Consumo apenas no restaurante.', 'R$ 26,90', 'R$ 31,90', 'Bebidas', 53),
  ('hh-taca-vinho-tinto', 'happy-hour', 'Taça de Vinho Tinto', 'Consumo apenas no restaurante.', 'R$ 23,90', 'R$ 29,90', 'Bebidas', 54),
  ('hh-taca-vinho-branco', 'happy-hour', 'Taça de Vinho Branco', NULL, 'R$ 23,90', 'R$ 29,90', 'Bebidas', 55),
  ('hh-taca-vinho-rose', 'happy-hour', 'Taça de Vinho Rosé', 'Consumo apenas no restaurante.', 'R$ 23,90', 'R$ 29,90', 'Bebidas', 56),
  ('hh-taca-espumante-brut', 'happy-hour', 'Taça de Espumante Brut', 'Consumo apenas no restaurante.', 'R$ 23,90', 'R$ 29,90', 'Bebidas', 57),
  ('hh-taca-espumante-brut-rose', 'happy-hour', 'Taça de Espumante Brut Rosé', 'Consumo apenas no restaurante.', 'R$ 23,90', 'R$ 29,90', 'Bebidas', 58)
ON CONFLICT (slug) DO NOTHING;

COMMIT;

-- Verificacao rapida (rode separado se quiser):
-- SELECT count(*) FROM public.dishes WHERE category_id = 'happy-hour';
-- Deve retornar 48.
