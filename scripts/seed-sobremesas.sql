-- =============================================================================
-- Seed: categoria 'sobremesas' (se nao existir) + 5 dishes
--
-- Idempotente (ON CONFLICT DO NOTHING). Rode no SQL Editor do Supabase.
--
-- Se voce ja tem uma categoria "Sobremesas" com slug DIFERENTE (ex: 'doces'),
-- nao rode o INSERT da categoria — ajuste o category_id dos dishes abaixo
-- pro slug correto antes de rodar.
-- =============================================================================

BEGIN;

-- 1) Categoria Sobremesas --------------------------------------------------
INSERT INTO public.categories (
  id, number, name, description, gradient, subcategories, position
)
VALUES (
  'sobremesas',
  '07',
  'Sobremesas',
  'Doces da casa para fechar a refeição.',
  'linear-gradient(135deg, #F5C6D6 0%, #B8627D 100%)',
  ARRAY[]::text[],
  (SELECT COALESCE(MAX(position), 0) + 1 FROM public.categories)
)
ON CONFLICT (id) DO NOTHING;

-- 2) Dishes ----------------------------------------------------------------
INSERT INTO public.dishes (slug, category_id, name, description, price, position)
VALUES
  (
    'tempura-de-sorvete', 'sobremesas',
    'Tempura de Sorvete',
    'Sorvete com crosta crocante. Caldas de caramelo, chocolate e goiabada.',
    'R$ 22,90', 1
  ),
  (
    'mini-tempura-de-sorvete', 'sobremesas',
    'Mini Tempura de Sorvete',
    'Sorvete com crosta crocante. Caldas de caramelo, chocolate e goiabada.',
    'R$ 12,90', 2
  ),
  (
    'dupla-de-brigadeiro', 'sobremesas',
    'Dupla de Brigadeiro',
    '2 unidades de chocolate brigadeiro.',
    'R$ 12,90', 3
  ),
  (
    'brigadeiro-colher-frutas', 'sobremesas',
    'Brigadeiro de Colher com Frutas',
    'Brigadeiro caseiro servido com morangos frescos e farofa de castanhas.',
    'R$ 22,90', 4
  ),
  (
    'brownie-chocolate-sorbet', 'sobremesas',
    'Brownie com Calda de Chocolate e Sorbet de Morango',
    'Brownie coberto por calda de chocolate e sorbet de amoras frescas preparado especialmente em nossa casa.',
    'R$ 28,90', 5
  )
ON CONFLICT (slug) DO NOTHING;

COMMIT;

-- Verificacao:
-- SELECT count(*) FROM public.dishes WHERE category_id = 'sobremesas';
-- Deve retornar 5.
