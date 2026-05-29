-- ============================================================================
-- TRANSFERIR ITENS: "Duplas Especiais" -> "Seleções Premium"
-- ----------------------------------------------------------------------------
-- Move TODOS os pratos da categoria "Duplas Especiais" para "Seleções Premium".
-- - NÃO apaga a categoria de origem (fica vazia; você decide depois no admin).
-- - Funciona para QUALQUER unidade que tenha as duas categorias (faz o de->para
--   casando origem/destino dentro do MESMO restaurante).
-- - Os itens vão pro FIM da lista de Seleções Premium (não embaralha a ordem).
--
-- Roda no Supabase Studio → SQL Editor. Rode primeiro o PASSO 1 (preview),
-- confira, e só então rode o PASSO 2 (a transferência de fato).
-- ============================================================================

-- ============================================================================
-- PASSO 1 — PREVIEW: o que vai ser movido (não altera nada)
-- ============================================================================
SELECT r.id AS unidade, s.name AS de, d.name AS para, count(di.*) AS qtd_itens
FROM public.categories s
JOIN public.categories d  ON d.restaurant_id = s.restaurant_id AND d.name ILIKE '%sele%premium%'
JOIN public.restaurants r ON r.id = s.restaurant_id
LEFT JOIN public.dishes di ON di.category_id = s.id
WHERE s.name ILIKE '%dupla%especia%'
GROUP BY r.id, s.name, d.name;


-- ============================================================================
-- PASSO 2 — TRANSFERÊNCIA (altera os dados)
-- ============================================================================
WITH pairs AS (
  SELECT s.restaurant_id, s.id AS src, d.id AS dst
  FROM public.categories s
  JOIN public.categories d
    ON d.restaurant_id = s.restaurant_id
   AND d.name ILIKE '%sele%premium%'
  WHERE s.name ILIKE '%dupla%especia%'
),
based AS (
  SELECT p.src, p.dst,
         COALESCE((SELECT max(position) FROM public.dishes WHERE category_id = p.dst), -1) AS base
  FROM pairs p
),
to_move AS (
  SELECT di.id, b.dst, b.base,
         row_number() OVER (PARTITION BY di.category_id ORDER BY di.position, di.name) AS rn
  FROM public.dishes di
  JOIN based b ON di.category_id = b.src
)
UPDATE public.dishes d
SET category_id = tm.dst,
    position    = tm.base + tm.rn
FROM to_move tm
WHERE d.id = tm.id;


-- ============================================================================
-- PASSO 3 — VERIFICAÇÃO: itens agora em Seleções Premium
-- ============================================================================
SELECT r.id AS unidade, c.name AS categoria, d.name AS item, d.position
FROM public.dishes d
JOIN public.categories c  ON c.id = d.category_id
JOIN public.restaurants r ON r.id = d.restaurant_id
WHERE c.name ILIKE '%sele%premium%'
ORDER BY r.id, d.position;
