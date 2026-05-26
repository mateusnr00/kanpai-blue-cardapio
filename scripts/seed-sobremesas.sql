-- =============================================================================
-- Seed: 5 dishes na categoria Sobremesas existente
--
-- Categoria 'Sobremesas' ja existe no banco com id (uuid):
--   b1ab7760-7c20-4ad4-90e9-39a95d16bc80
--
-- Idempotente: ON CONFLICT (slug) DO NOTHING.
-- Rode no SQL Editor do Supabase.
-- =============================================================================

BEGIN;

INSERT INTO public.dishes (slug, category_id, name, description, price, position)
VALUES
  (
    'tempura-de-sorvete',
    'b1ab7760-7c20-4ad4-90e9-39a95d16bc80'::uuid,
    'Tempura de Sorvete',
    'Sorvete com crosta crocante. Caldas de caramelo, chocolate e goiabada.',
    'R$ 22,90', 1
  ),
  (
    'mini-tempura-de-sorvete',
    'b1ab7760-7c20-4ad4-90e9-39a95d16bc80'::uuid,
    'Mini Tempura de Sorvete',
    'Sorvete com crosta crocante. Caldas de caramelo, chocolate e goiabada.',
    'R$ 12,90', 2
  ),
  (
    'dupla-de-brigadeiro',
    'b1ab7760-7c20-4ad4-90e9-39a95d16bc80'::uuid,
    'Dupla de Brigadeiro',
    '2 unidades de chocolate brigadeiro.',
    'R$ 12,90', 3
  ),
  (
    'brigadeiro-colher-frutas',
    'b1ab7760-7c20-4ad4-90e9-39a95d16bc80'::uuid,
    'Brigadeiro de Colher com Frutas',
    'Brigadeiro caseiro servido com morangos frescos e farofa de castanhas.',
    'R$ 22,90', 4
  ),
  (
    'brownie-chocolate-sorbet',
    'b1ab7760-7c20-4ad4-90e9-39a95d16bc80'::uuid,
    'Brownie com Calda de Chocolate e Sorbet de Morango',
    'Brownie coberto por calda de chocolate e sorbet de amoras frescas preparado especialmente em nossa casa.',
    'R$ 28,90', 5
  )
ON CONFLICT (slug) DO NOTHING;

COMMIT;

-- Verificacao:
-- SELECT count(*) FROM public.dishes WHERE category_id = 'b1ab7760-7c20-4ad4-90e9-39a95d16bc80';
-- Deve retornar 5 (ou mais, se ja existirem outras sobremesas na categoria).
