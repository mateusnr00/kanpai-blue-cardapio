-- ============================================================================
-- Schema align: bring DB up to target spec
-- Spec: docs/superpowers/specs/2026-05-22-admin-kanpai-design.md
-- Diff: docs/superpowers/plans/2026-05-22-fase-0-schema-diff.md
--
-- Banco atual: so dish_likes (counter), criamos do zero as 6 tabelas do alvo.
-- RLS e auto-habilitada pelo event trigger rls_auto_enable do public schema.
-- Criamos policies explicitamente.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. categories  (cards da home / categorias do cardapio)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.categories (
  id            text PRIMARY KEY,
  number        text NOT NULL,
  name          text NOT NULL,
  short_name    text,
  description   text NOT NULL,
  item_count    text,
  detail        text,
  gradient      text NOT NULL,
  featured      boolean NOT NULL DEFAULT false,
  active        boolean NOT NULL DEFAULT true,
  position      integer NOT NULL,
  subcategories text[] NOT NULL DEFAULT '{}',
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS categories_position_idx ON public.categories (position);

-- ---------------------------------------------------------------------------
-- 2. dishes  (pratos)
-- slug e text UNIQUE: serve de ID externo estavel (usado por dish_likes,
-- anchors da home, etc). id (uuid) e o PK interno.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.dishes (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id       text NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  slug              text NOT NULL UNIQUE,
  name              text NOT NULL,
  price             text,
  unit              text,
  description       text,
  long_description  text,
  subcategory       text,
  featured          boolean NOT NULL DEFAULT false,
  featured_gradient text,
  original_price    text,
  image_path        text,
  active            boolean NOT NULL DEFAULT true,
  position          integer NOT NULL,
  badges            text[] NOT NULL DEFAULT '{}',
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS dishes_category_id_idx ON public.dishes (category_id);
CREATE INDEX IF NOT EXISTS dishes_position_idx    ON public.dishes (position);

-- ---------------------------------------------------------------------------
-- 3. dish_variants  (escolha de proteina, sabor, opcao)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.dish_variants (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dish_id     uuid NOT NULL REFERENCES public.dishes(id) ON DELETE CASCADE,
  name        text NOT NULL,
  price       text NOT NULL,
  image_path  text,
  position    integer NOT NULL
);

CREATE INDEX IF NOT EXISTS dish_variants_dish_id_idx ON public.dish_variants (dish_id);

-- ---------------------------------------------------------------------------
-- 4. dish_detail_sections  (secoes do modal de detalhes do Festival)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.dish_detail_sections (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dish_id     uuid NOT NULL REFERENCES public.dishes(id) ON DELETE CASCADE,
  label       text NOT NULL,
  description text NOT NULL,
  position    integer NOT NULL
);

CREATE INDEX IF NOT EXISTS dish_detail_sections_dish_id_idx ON public.dish_detail_sections (dish_id);

-- ---------------------------------------------------------------------------
-- 5. executivo_menus  (menus executivos com estrutura aninhada)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.executivo_menus (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id text NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  name        text NOT NULL,
  price       text NOT NULL,
  format      text NOT NULL,
  description text NOT NULL,
  validity    text,
  subcategory text,
  position    integer NOT NULL,
  active      boolean NOT NULL DEFAULT true
);

CREATE INDEX IF NOT EXISTS executivo_menus_category_id_idx ON public.executivo_menus (category_id);

-- ---------------------------------------------------------------------------
-- 6. executivo_items  (entradas / principais / sobremesas de cada executivo)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.executivo_items (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  executivo_id uuid NOT NULL REFERENCES public.executivo_menus(id) ON DELETE CASCADE,
  kind         text NOT NULL CHECK (kind IN ('entrada','principal','sobremesa')),
  name         text NOT NULL,
  description  text NOT NULL,
  price        text,
  position     integer NOT NULL
);

CREATE INDEX IF NOT EXISTS executivo_items_executivo_id_idx ON public.executivo_items (executivo_id);

-- ============================================================================
-- POLICIES
-- RLS ja foi habilitada automaticamente pelo event trigger rls_auto_enable.
-- Sem policies, leitura/escrita ficam bloqueadas. Criamos as policies abaixo.
-- ============================================================================

-- categories: leitura publica (anon) para ativos; auth ve tudo; escrita so auth
CREATE POLICY "categories_select_public" ON public.categories
  FOR SELECT TO anon
  USING (active = true);

CREATE POLICY "categories_select_auth_all" ON public.categories
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "categories_insert_auth" ON public.categories
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "categories_update_auth" ON public.categories
  FOR UPDATE TO authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY "categories_delete_auth" ON public.categories
  FOR DELETE TO authenticated
  USING (true);

-- dishes
CREATE POLICY "dishes_select_public" ON public.dishes
  FOR SELECT TO anon
  USING (active = true);

CREATE POLICY "dishes_select_auth_all" ON public.dishes
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "dishes_insert_auth" ON public.dishes
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "dishes_update_auth" ON public.dishes
  FOR UPDATE TO authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY "dishes_delete_auth" ON public.dishes
  FOR DELETE TO authenticated
  USING (true);

-- dish_variants: leitura publica (relevante quando o prato pai esta visivel)
CREATE POLICY "dish_variants_select_public" ON public.dish_variants
  FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "dish_variants_insert_auth" ON public.dish_variants
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "dish_variants_update_auth" ON public.dish_variants
  FOR UPDATE TO authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY "dish_variants_delete_auth" ON public.dish_variants
  FOR DELETE TO authenticated
  USING (true);

-- dish_detail_sections
CREATE POLICY "dish_detail_sections_select_public" ON public.dish_detail_sections
  FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "dish_detail_sections_insert_auth" ON public.dish_detail_sections
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "dish_detail_sections_update_auth" ON public.dish_detail_sections
  FOR UPDATE TO authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY "dish_detail_sections_delete_auth" ON public.dish_detail_sections
  FOR DELETE TO authenticated
  USING (true);

-- executivo_menus
CREATE POLICY "executivo_menus_select_public" ON public.executivo_menus
  FOR SELECT TO anon
  USING (active = true);

CREATE POLICY "executivo_menus_select_auth_all" ON public.executivo_menus
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "executivo_menus_insert_auth" ON public.executivo_menus
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "executivo_menus_update_auth" ON public.executivo_menus
  FOR UPDATE TO authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY "executivo_menus_delete_auth" ON public.executivo_menus
  FOR DELETE TO authenticated
  USING (true);

-- executivo_items
CREATE POLICY "executivo_items_select_public" ON public.executivo_items
  FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "executivo_items_insert_auth" ON public.executivo_items
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "executivo_items_update_auth" ON public.executivo_items
  FOR UPDATE TO authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY "executivo_items_delete_auth" ON public.executivo_items
  FOR DELETE TO authenticated
  USING (true);
