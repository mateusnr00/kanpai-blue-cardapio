-- categories.id era text (slug global). Vira uuid pra permitir slugs iguais
-- entre restaurantes (UNIQUE(restaurant_id, slug)).
--
-- Procedimento:
-- 1. Adiciona id_new uuid + slug text (copia o id atual)
-- 2. Adiciona category_id_new uuid em dishes/executivo_menus
-- 3. Popula category_id_new via JOIN
-- 4. Dropa FKs antigas, dropa colunas antigas, renomeia novas
-- 5. Re-cria FK + constraints

BEGIN;

-- ---------------------------------------------------------------------------
-- 1. categories: adiciona colunas novas
-- ---------------------------------------------------------------------------
ALTER TABLE public.categories
  ADD COLUMN IF NOT EXISTS id_new uuid DEFAULT gen_random_uuid(),
  ADD COLUMN IF NOT EXISTS slug   text;

UPDATE public.categories
  SET slug = id
  WHERE slug IS NULL;

ALTER TABLE public.categories ALTER COLUMN id_new SET NOT NULL;
ALTER TABLE public.categories ALTER COLUMN slug   SET NOT NULL;

-- ---------------------------------------------------------------------------
-- 2. dishes: adiciona category_id_new uuid e popula via JOIN
-- ---------------------------------------------------------------------------
ALTER TABLE public.dishes
  ADD COLUMN IF NOT EXISTS category_id_new uuid;

UPDATE public.dishes d
  SET category_id_new = c.id_new
  FROM public.categories c
  WHERE d.category_id = c.id;

ALTER TABLE public.dishes ALTER COLUMN category_id_new SET NOT NULL;

ALTER TABLE public.dishes DROP CONSTRAINT IF EXISTS dishes_category_id_fkey;
ALTER TABLE public.dishes DROP COLUMN category_id;
ALTER TABLE public.dishes RENAME COLUMN category_id_new TO category_id;

CREATE INDEX IF NOT EXISTS dishes_category_id_idx ON public.dishes (category_id);

-- ---------------------------------------------------------------------------
-- 3. executivo_menus: mesma logica
-- ---------------------------------------------------------------------------
ALTER TABLE public.executivo_menus
  ADD COLUMN IF NOT EXISTS category_id_new uuid;

UPDATE public.executivo_menus em
  SET category_id_new = c.id_new
  FROM public.categories c
  WHERE em.category_id = c.id;

ALTER TABLE public.executivo_menus ALTER COLUMN category_id_new SET NOT NULL;

ALTER TABLE public.executivo_menus DROP CONSTRAINT IF EXISTS executivo_menus_category_id_fkey;
ALTER TABLE public.executivo_menus DROP COLUMN category_id;
ALTER TABLE public.executivo_menus RENAME COLUMN category_id_new TO category_id;

CREATE INDEX IF NOT EXISTS executivo_menus_category_id_idx ON public.executivo_menus (category_id);

-- ---------------------------------------------------------------------------
-- 4. categories: troca PK pra id_new (uuid)
-- ---------------------------------------------------------------------------
ALTER TABLE public.categories DROP CONSTRAINT IF EXISTS categories_pkey;
ALTER TABLE public.categories DROP COLUMN id;
ALTER TABLE public.categories RENAME COLUMN id_new TO id;
ALTER TABLE public.categories ADD PRIMARY KEY (id);

-- ---------------------------------------------------------------------------
-- 5. Re-cria FKs + uniqueness por (restaurant_id, slug)
-- ---------------------------------------------------------------------------
ALTER TABLE public.dishes
  ADD CONSTRAINT dishes_category_id_fkey
  FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE CASCADE;

ALTER TABLE public.executivo_menus
  ADD CONSTRAINT executivo_menus_category_id_fkey
  FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE CASCADE;

ALTER TABLE public.categories
  ADD CONSTRAINT categories_restaurant_slug_uk UNIQUE (restaurant_id, slug);

COMMIT;
