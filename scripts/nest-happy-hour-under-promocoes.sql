-- ============================================================================
-- ANINHAR "Happy Hour" DENTRO de "Promoções"  (mesmo esquema dos vinhos)
-- ----------------------------------------------------------------------------
-- Antes: "Happy Hour" é uma categoria de topo (aparece na home).
-- Depois: "Happy Hour" vira FILHA de "Promoções" (parent_id).
--   → Promoções vira um "hub": ao clicar nela aparecem os cards das filhas.
--   → Ao clicar em "Happy Hour", abre a página dela com os itens, valores e
--     fotos (continua sendo uma categoria normal — nada dos itens muda).
--
-- É só dado (não muda código) e é reversível (basta zerar o parent_id).
-- Funciona pra qualquer unidade que tenha as duas categorias.
--
-- ⚠️ IMPORTANTE: quando uma categoria ganha FILHAS, ela vira hub e passa a
--    mostrar SÓ os cards das filhas — os pratos próprios dela (se houver)
--    deixam de aparecer. Por isso rode o PASSO 1 antes: se
--    "dishes_proprios_em_promocoes" for > 0, me avise (a gente decide o que
--    fazer com esses itens) ANTES de rodar o PASSO 2.
--
-- PRÉ-REQUISITO: scripts/add-category-parent-id.sql já rodado (coluna parent_id).
-- ============================================================================

-- ============================================================================
-- PASSO 1 — PREVIEW (não altera nada)
-- ============================================================================
SELECT
  r.id  AS unidade,
  hh.name AS happy_hour,
  (SELECT count(*) FROM public.dishes d WHERE d.category_id = hh.id) AS itens_happy_hour,
  pr.name AS promocoes,
  (SELECT count(*) FROM public.dishes d  WHERE d.category_id = pr.id) AS dishes_proprios_em_promocoes,
  (SELECT count(*) FROM public.categories c WHERE c.parent_id = pr.id) AS filhas_atuais_de_promocoes
FROM public.categories hh
JOIN public.categories pr
  ON pr.restaurant_id = hh.restaurant_id
 AND pr.name ILIKE '%promo%'
JOIN public.restaurants r ON r.id = hh.restaurant_id
WHERE hh.name ILIKE '%happy%'
  AND hh.id <> pr.id;


-- ============================================================================
-- PASSO 2 — ANINHAR (altera os dados)
-- ============================================================================
UPDATE public.categories hh
SET parent_id = pr.id,
    position  = COALESCE((SELECT max(c.position) FROM public.categories c WHERE c.parent_id = pr.id), pr.position) + 1
FROM public.categories pr
WHERE hh.name ILIKE '%happy%'
  AND pr.restaurant_id = hh.restaurant_id
  AND pr.name ILIKE '%promo%'
  AND hh.id <> pr.id;


-- ============================================================================
-- PASSO 3 — VERIFICAÇÃO
-- ============================================================================
SELECT r.id AS unidade, pr.name AS pai_promocoes, hh.name AS filha_happy_hour, hh.position
FROM public.categories hh
JOIN public.categories pr ON pr.id = hh.parent_id
JOIN public.restaurants r ON r.id = hh.restaurant_id
WHERE hh.name ILIKE '%happy%';


-- ============================================================================
-- (REVERTER, se precisar): tira o Happy Hour de dentro de Promoções
-- ----------------------------------------------------------------------------
-- UPDATE public.categories SET parent_id = NULL WHERE name ILIKE '%happy%';
-- ============================================================================
