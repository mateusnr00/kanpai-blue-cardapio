-- ============================================================================
-- REPLICAR no GOIÂNIA SHOPPING as alterações da última hora do FLAMBOYANT
-- ----------------------------------------------------------------------------
-- Cobre os 3 tipos de mudança que apareceram no histórico:
--   • Pratos CRIADOS  (Hand Rolls Kanpai, Edamame trufado, Dupla de Niguiri…)
--   • Pratos EDITADOS (Shitake, Polvo fresh, Sashimi Shiromi, Teppanyaki…)
--   • REORDENAÇÃO     (copia as posições → mesma ordem da categoria)
--
-- COMO FUNCIONA: acha as categorias do Flamboyant que contêm algum dos pratos
-- alterados e espelha ESSAS categorias no Goiânia. Só INSERE/ATUALIZA, nunca
-- apaga — então vinhos e itens exclusivos do Goiânia ficam intactos.
--
-- COMO RODAR: Supabase Studio → SQL Editor.
--   1) Rode a PARTE A (preview) e confira a lista.
--   2) Rode a PARTE B (aplica). Idempotente: pode rodar de novo.
--   3) Rode a PARTE C (verificação).
-- Casamento de pratos é por SLUG; se algum prato do Goiânia tiver slug diferente
-- do Flamboyant, ele entra como novo (confira no preview da PARTE A).
-- ============================================================================


-- ============================================================================
-- PARTE A — PREVIEW (só leitura): o que será criado/atualizado no Goiânia
-- ============================================================================
WITH alvo(nome) AS (
  VALUES
    ('Hand Rolls Kanpai'),
    ('Edamame trufado com flor de sal'),
    ('Shitake'),
    ('Polvo fresh kanpai'),
    ('Dupla de Niguiri Atum com Foie Gras'),
    ('Sashimi Shiromi'),
    ('Hossomaki Filadelphia Roll'),
    ('Sashimi Salmão com Azeite Trufado na Pedra de Sal'),
    ('Teppanyaki de Robalo'),
    ('Yakissoba Vegetariano'),
    ('Tempurá de Legumes'),
    ('Grelhado de Filet Mignon com Fritas')
),
cats AS (
  SELECT DISTINCT c.slug
  FROM public.dishes d
  JOIN public.categories c ON c.id = d.category_id
  WHERE d.restaurant_id = 'flamboyant'
    AND lower(btrim(d.name)) IN (SELECT lower(btrim(nome)) FROM alvo)
)
SELECT sc.slug AS categoria, d.name AS prato, d.price, d.position,
       CASE
         WHEN EXISTS (
           SELECT 1 FROM public.dishes f
           JOIN public.categories fc ON fc.id = f.category_id
           WHERE f.restaurant_id = 'goianiashopping'
             AND fc.slug = sc.slug AND f.slug = d.slug
         ) THEN 'ATUALIZA'
         ELSE 'CRIA'
       END AS acao
FROM public.dishes d
JOIN public.categories sc ON sc.id = d.category_id
WHERE d.restaurant_id = 'flamboyant' AND sc.slug IN (SELECT slug FROM cats)
ORDER BY sc.slug, d.position;


-- ============================================================================
-- PARTE B — APLICA a replicação (Flamboyant → Goiânia Shopping)
-- ============================================================================
DO $$
DECLARE
  v_src text := 'flamboyant';
  v_dst text := 'goianiashopping';
  v_names text[] := ARRAY[
    'Hand Rolls Kanpai',
    'Edamame trufado com flor de sal',
    'Shitake',
    'Polvo fresh kanpai',
    'Dupla de Niguiri Atum com Foie Gras',
    'Sashimi Shiromi',
    'Hossomaki Filadelphia Roll',
    'Sashimi Salmão com Azeite Trufado na Pedra de Sal',
    'Teppanyaki de Robalo',
    'Yakissoba Vegetariano',
    'Tempurá de Legumes',
    'Grelhado de Filet Mignon com Fritas'
  ];
  n_cat int; n_dish int;
BEGIN
  -- Categorias do Flamboyant que contêm algum prato alterado
  CREATE TEMP TABLE _cats ON COMMIT DROP AS
  SELECT DISTINCT c.slug
  FROM public.dishes d
  JOIN public.categories c ON c.id = d.category_id
  WHERE d.restaurant_id = v_src
    AND lower(btrim(d.name)) IN (SELECT lower(btrim(x)) FROM unnest(v_names) AS x);

  -- 1) Garante que essas categorias existam no Goiânia (não sobrescreve as que já têm)
  INSERT INTO public.categories
    (restaurant_id, slug, number, name, short_name, description, item_count,
     detail, gradient, featured, active, position, subcategories)
  SELECT v_dst, c.slug, c.number, c.name, c.short_name, c.description, c.item_count,
         c.detail, c.gradient, c.featured, c.active,
         COALESCE((SELECT max(position) + 1 FROM public.categories WHERE restaurant_id = v_dst), c.position),
         c.subcategories
  FROM public.categories c
  WHERE c.restaurant_id = v_src AND c.slug IN (SELECT slug FROM _cats)
  ON CONFLICT (restaurant_id, slug) DO NOTHING;
  GET DIAGNOSTICS n_cat = ROW_COUNT;

  -- 2) Espelha os pratos dessas categorias (campos + POSIÇÃO → cobre a reordenação)
  INSERT INTO public.dishes
    (restaurant_id, category_id, slug, name, price, unit, description, long_description,
     subcategory, featured, featured_gradient, original_price, image_path, blur_data_url,
     active, position, badges, is_component_only)
  SELECT v_dst, dc.id, d.slug, d.name, d.price, d.unit, d.description, d.long_description,
         d.subcategory, d.featured, d.featured_gradient, d.original_price, d.image_path, d.blur_data_url,
         d.active, d.position, d.badges, d.is_component_only
  FROM public.dishes d
  JOIN public.categories sc ON sc.id = d.category_id
  JOIN public.categories dc ON dc.restaurant_id = v_dst AND dc.slug = sc.slug
  WHERE d.restaurant_id = v_src AND sc.slug IN (SELECT slug FROM _cats)
  ON CONFLICT (restaurant_id, slug) DO UPDATE SET
     category_id = EXCLUDED.category_id, name = EXCLUDED.name, price = EXCLUDED.price,
     unit = EXCLUDED.unit, description = EXCLUDED.description, long_description = EXCLUDED.long_description,
     subcategory = EXCLUDED.subcategory, featured = EXCLUDED.featured,
     featured_gradient = EXCLUDED.featured_gradient, original_price = EXCLUDED.original_price,
     image_path = EXCLUDED.image_path, blur_data_url = EXCLUDED.blur_data_url,
     active = EXCLUDED.active, position = EXCLUDED.position, badges = EXCLUDED.badges,
     is_component_only = EXCLUDED.is_component_only, updated_at = now();
  GET DIAGNOSTICS n_dish = ROW_COUNT;

  RAISE NOTICE 'Replicado p/ %: % categorias garantidas, % pratos inseridos/atualizados.',
    v_dst, n_cat, n_dish;
END $$;


-- ============================================================================
-- PARTE C — VERIFICAÇÃO (confira os pratos no Goiânia depois de aplicar)
-- ============================================================================
SELECT c.slug AS categoria, d.name AS prato, d.price, d.original_price,
       d.position, (d.image_path IS NOT NULL) AS tem_foto, d.active
FROM public.dishes d
JOIN public.categories c ON c.id = d.category_id
WHERE d.restaurant_id = 'goianiashopping'
  AND lower(btrim(d.name)) IN (
    'hand rolls kanpai','edamame trufado com flor de sal','shitake',
    'polvo fresh kanpai','dupla de niguiri atum com foie gras','sashimi shiromi',
    'hossomaki filadelphia roll','sashimi salmão com azeite trufado na pedra de sal',
    'teppanyaki de robalo','yakissoba vegetariano','tempurá de legumes',
    'grelhado de filet mignon com fritas'
  )
ORDER BY c.slug, d.position;
