-- Adiciona restaurant_id nas tabelas-raiz e faz backfill pra 'flamboyant'.
-- categories -> ja pertence a um restaurante
-- dishes / executivo_menus -> derivam da sua categoria mas mantemos coluna direta
--   pra simplificar queries e RLS.
-- analytics_events -> precisa pra separar dashboard por unidade

-- ---------------------------------------------------------------------------
-- categories
-- ---------------------------------------------------------------------------
ALTER TABLE public.categories
  ADD COLUMN IF NOT EXISTS restaurant_id text REFERENCES public.restaurants(id) ON DELETE RESTRICT;

UPDATE public.categories
  SET restaurant_id = 'flamboyant'
  WHERE restaurant_id IS NULL;

ALTER TABLE public.categories
  ALTER COLUMN restaurant_id SET NOT NULL;

CREATE INDEX IF NOT EXISTS categories_restaurant_idx ON public.categories (restaurant_id);

-- ---------------------------------------------------------------------------
-- dishes
-- ---------------------------------------------------------------------------
ALTER TABLE public.dishes
  ADD COLUMN IF NOT EXISTS restaurant_id text REFERENCES public.restaurants(id) ON DELETE RESTRICT;

UPDATE public.dishes d
  SET restaurant_id = c.restaurant_id
  FROM public.categories c
  WHERE d.category_id = c.id AND d.restaurant_id IS NULL;

ALTER TABLE public.dishes
  ALTER COLUMN restaurant_id SET NOT NULL;

CREATE INDEX IF NOT EXISTS dishes_restaurant_idx ON public.dishes (restaurant_id);

-- slug agora deve ser unico POR restaurant, nao globalmente
ALTER TABLE public.dishes DROP CONSTRAINT IF EXISTS dishes_slug_key;
ALTER TABLE public.dishes
  ADD CONSTRAINT dishes_restaurant_slug_uk UNIQUE (restaurant_id, slug);

-- ---------------------------------------------------------------------------
-- executivo_menus
-- ---------------------------------------------------------------------------
ALTER TABLE public.executivo_menus
  ADD COLUMN IF NOT EXISTS restaurant_id text REFERENCES public.restaurants(id) ON DELETE RESTRICT;

UPDATE public.executivo_menus em
  SET restaurant_id = c.restaurant_id
  FROM public.categories c
  WHERE em.category_id = c.id AND em.restaurant_id IS NULL;

ALTER TABLE public.executivo_menus
  ALTER COLUMN restaurant_id SET NOT NULL;

CREATE INDEX IF NOT EXISTS executivo_menus_restaurant_idx ON public.executivo_menus (restaurant_id);

-- ---------------------------------------------------------------------------
-- analytics_events
-- ---------------------------------------------------------------------------
ALTER TABLE public.analytics_events
  ADD COLUMN IF NOT EXISTS restaurant_id text REFERENCES public.restaurants(id) ON DELETE RESTRICT;

-- eventos antigos: vao todos pro Flamboyant
UPDATE public.analytics_events
  SET restaurant_id = 'flamboyant'
  WHERE restaurant_id IS NULL;

ALTER TABLE public.analytics_events
  ALTER COLUMN restaurant_id SET NOT NULL;

CREATE INDEX IF NOT EXISTS analytics_events_restaurant_idx ON public.analytics_events (restaurant_id);
