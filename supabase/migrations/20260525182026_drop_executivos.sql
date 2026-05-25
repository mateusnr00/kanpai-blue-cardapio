-- Elimina o conceito de executivo. Cada executivo_menu vira um dish na
-- mesma categoria, mantendo entradas/principais/sobremesas como seções
-- do modal "Ver itens" via long_description + dish_detail_sections.

BEGIN;

-- 1. Criar dishes a partir de cada executivo_menu.
--    slug = 'exec-' || id (estavel, evita colisao).
--    description = format (ex: "Entrada + Principal")
--    long_description = description original (texto rico)
--    position = empurrado pra fim da categoria (max(pos) + offset).
WITH max_pos AS (
  SELECT category_id, COALESCE(MAX(position), -1) AS p FROM public.dishes GROUP BY category_id
),
inserted AS (
  INSERT INTO public.dishes (
    id, slug, restaurant_id, category_id, name, price,
    description, long_description, position, badges, active, featured
  )
  SELECT
    gen_random_uuid(),
    'exec-' || em.id::text,
    em.restaurant_id,
    em.category_id,
    em.name,
    em.price,
    em.format,
    em.description,
    COALESCE((SELECT p FROM max_pos WHERE category_id = em.category_id), -1) + 1
      + ROW_NUMBER() OVER (PARTITION BY em.category_id ORDER BY em.position),
    ARRAY[]::text[],
    em.active,
    true  -- featured pra ganhar destaque visual com o modal de detalhes
  FROM public.executivo_menus em
  RETURNING id, slug
)
-- 2. Cria sections (Entradas/Principais/Sobremesas) por dish criado.
--    Cada section concatena os itens como "Nome: descricao" linha a linha.
INSERT INTO public.dish_detail_sections (dish_id, label, description, position)
SELECT
  ins.id,
  CASE ei.kind
    WHEN 'entrada' THEN 'Entradas'
    WHEN 'principal' THEN 'Principais'
    WHEN 'sobremesa' THEN 'Sobremesas'
  END AS label,
  string_agg(
    CASE
      WHEN ei.price IS NOT NULL AND ei.price <> '' THEN ei.name || ' (' || ei.price || '): ' || ei.description
      ELSE ei.name || ': ' || ei.description
    END,
    E'\n'
    ORDER BY ei.position
  ) AS description,
  CASE ei.kind WHEN 'entrada' THEN 0 WHEN 'principal' THEN 1 WHEN 'sobremesa' THEN 2 END AS position
FROM inserted ins
JOIN public.executivo_menus em ON ins.slug = 'exec-' || em.id::text
JOIN public.executivo_items ei ON ei.executivo_id = em.id
GROUP BY ins.id, ei.kind;

-- 3. Drop das tabelas e tudo dependente.
DROP TABLE IF EXISTS public.executivo_items CASCADE;
DROP TABLE IF EXISTS public.executivo_menus CASCADE;

COMMIT;
