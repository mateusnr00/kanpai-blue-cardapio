-- ============================================================================
-- Sync de descrição + imagem: goianiashopping -> flamboyant
-- ----------------------------------------------------------------------------
-- O que faz:
--   - Pega categorias e pratos do goianiashopping
--   - Bate por slug com as categorias/pratos do flamboyant
--   - Sobrescreve description, long_description, image_path, blur_data_url
--     (e slideshow_image_paths nas categorias) nas linhas do flamboyant
--   - NÃO mexe em preço, posição, badges, schedule, active, name, slug
--   - NÃO cria nem deleta linhas: pratos só no goianiashopping são ignorados,
--     pratos só no flamboyant ficam intactos
--
-- Storage: o flamboyant vai apontar pros MESMOS arquivos do goianiashopping
-- (sem duplicação). Se quiser arquivos independentes, é um passo separado.
--
-- Como usar:
--   1. Abre o SQL Editor no Supabase
--   2. Cola TODO esse arquivo (BEGIN ... COMMIT)
--   3. Roda. As 3 últimas queries são SELECTs de auditoria — confere se os
--      números bateram antes de fechar.
--   4. Se algo der errado, basta NÃO fazer COMMIT (rola ROLLBACK).
-- ============================================================================

BEGIN;

-- ===== CATEGORIAS =====
UPDATE public.categories AS t
SET
  description = s.description,
  image_path = s.image_path,
  blur_data_url = s.blur_data_url,
  slideshow_image_paths = s.slideshow_image_paths,
  updated_at = NOW()
FROM public.categories AS s
WHERE t.restaurant_id = 'flamboyant'
  AND s.restaurant_id = 'goianiashopping'
  AND t.slug = s.slug;

-- ===== PRATOS =====
UPDATE public.dishes AS t
SET
  description = s.description,
  long_description = s.long_description,
  image_path = s.image_path,
  blur_data_url = s.blur_data_url,
  updated_at = NOW()
FROM public.dishes AS s
WHERE t.restaurant_id = 'flamboyant'
  AND s.restaurant_id = 'goianiashopping'
  AND t.slug = s.slug;

-- ===== AUDITORIA (rodam antes do COMMIT) =====

-- 1) Quantas linhas tocou
SELECT
  (SELECT COUNT(*) FROM public.categories t
     JOIN public.categories s ON s.slug = t.slug
     WHERE t.restaurant_id = 'flamboyant' AND s.restaurant_id = 'goianiashopping') AS categorias_sincronizadas,
  (SELECT COUNT(*) FROM public.dishes t
     JOIN public.dishes s ON s.slug = t.slug
     WHERE t.restaurant_id = 'flamboyant' AND s.restaurant_id = 'goianiashopping') AS pratos_sincronizados;

-- 2) Pratos no goianiashopping que NÃO existem no flamboyant (não foram criados)
SELECT s.slug, s.name AS no_goianiashopping_mas_nao_no_flamboyant
FROM public.dishes s
WHERE s.restaurant_id = 'goianiashopping'
  AND NOT EXISTS (
    SELECT 1 FROM public.dishes t
    WHERE t.restaurant_id = 'flamboyant' AND t.slug = s.slug
  )
ORDER BY s.name;

-- 3) Pratos no flamboyant que NÃO existem no goianiashopping (mantidos intactos)
SELECT t.slug, t.name AS no_flamboyant_mas_nao_no_goianiashopping
FROM public.dishes t
WHERE t.restaurant_id = 'flamboyant'
  AND NOT EXISTS (
    SELECT 1 FROM public.dishes s
    WHERE s.restaurant_id = 'goianiashopping' AND s.slug = t.slug
  )
ORDER BY t.name;

-- Se os números fizeram sentido, fecha:
COMMIT;

-- Se NÃO fizeram sentido, troca o COMMIT acima por:
-- ROLLBACK;
