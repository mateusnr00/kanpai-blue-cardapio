-- ============================================================================
-- RESTAURAÇÃO DO MENU EXECUTIVO  (Contemporâneo + Oriental)
-- ----------------------------------------------------------------------------
-- Recria os 2 menus executivos no formato ATUAL (dish_components):
--   * cada menu vira um PRATO em destaque (featured)
--   * cada entrada/principal/sobremesa vira um PRATO-componente (is_component_only)
--   * tudo ligado via public.dish_components, agrupado por kind
--
-- Conteúdo recuperado do histórico (apps/site/lib/menu-data.ts). Textos e
-- preços são fiéis ao original. FOTOS não estão no código — os pratos entram
-- SEM foto (image_path = NULL) e você sobe a imagem de cada um depois, no
-- admin (tela do prato → campo de imagem).
--
-- Idempotente: pode rodar várias vezes (upsert por slug, sem duplicar).
-- Não apaga nada que já exista.
--
-- COMO RODAR: Supabase Studio → SQL Editor → cole tudo → ajuste o
-- v_restaurant_id abaixo → Run. Repita pra cada unidade que precisar.
-- ============================================================================

DO $$
DECLARE
  -- >>> AJUSTE AQUI: slug da unidade. Veja as opções com:
  --     SELECT id, name FROM public.restaurants ORDER BY position;
  v_restaurant_id text := 'goianiashopping';

  v_cat_id  uuid;
  v_cont_id uuid;   -- parent: Executivo Contemporâneo
  v_ori_id  uuid;   -- parent: Executivo Oriental
  v_base    int;
  v_child   uuid;
  r RECORD;
BEGIN
  -- Sanidade: a unidade existe?
  IF NOT EXISTS (SELECT 1 FROM public.restaurants WHERE id = v_restaurant_id) THEN
    RAISE EXCEPTION 'Restaurante "%" nao existe. Rode: SELECT id, name FROM public.restaurants;', v_restaurant_id;
  END IF;

  ---------------------------------------------------------------------------
  -- 1. Categoria "Menu Executivo" (acha por slug/nome; cria se nao existir)
  ---------------------------------------------------------------------------
  SELECT id INTO v_cat_id
  FROM public.categories
  WHERE restaurant_id = v_restaurant_id
    AND (slug = 'executivo' OR name ILIKE '%executiv%')
  ORDER BY position
  LIMIT 1;

  IF v_cat_id IS NULL THEN
    INSERT INTO public.categories
      (restaurant_id, slug, number, name, description, gradient, position, subcategories, active, featured)
    VALUES
      (v_restaurant_id, 'executivo', '03', 'Menu Executivo',
       'Almoço · 2 menus disponíveis',
       'linear-gradient(135deg, #E5DEC8 0%, #D2C7AA 100%)',
       COALESCE((SELECT max(position) + 1 FROM public.categories WHERE restaurant_id = v_restaurant_id), 0),
       ARRAY['Todos', 'Contemporâneo', 'Oriental'], true, false)
    RETURNING id INTO v_cat_id;
    RAISE NOTICE 'Categoria "Menu Executivo" criada (%).', v_cat_id;
  ELSE
    RAISE NOTICE 'Categoria do executivo encontrada (%).', v_cat_id;
  END IF;

  v_base := COALESCE((SELECT max(position) FROM public.dishes WHERE category_id = v_cat_id), -1);

  ---------------------------------------------------------------------------
  -- 2. Pratos-pai (os 2 menus). featured=true, is_component_only=false.
  --    description = formato (subtitulo do card); long_description = texto rico.
  ---------------------------------------------------------------------------
  INSERT INTO public.dishes
    (restaurant_id, category_id, slug, name, price, description, long_description,
     subcategory, featured, is_component_only, active, position, badges)
  VALUES
    (v_restaurant_id, v_cat_id, 'exec-contemporaneo', 'Executivo Contemporâneo', 'R$ 79,90',
     'Entrada + Prato Principal',
     E'Menu elaborado pelo renomado Chef Lucas Santos, fundador do Restaurante Lote 17. Massas, proteínas e risotos para o almoço executivo do Kanpai.\n\nSegunda a sexta, 11h30 às 15h.',
     'Contemporâneo', true, false, true, v_base + 1, ARRAY[]::text[])
  ON CONFLICT (restaurant_id, slug) DO UPDATE SET
    category_id = EXCLUDED.category_id, name = EXCLUDED.name, price = EXCLUDED.price,
    description = EXCLUDED.description, long_description = EXCLUDED.long_description,
    subcategory = EXCLUDED.subcategory, featured = true, is_component_only = false, active = true
  RETURNING id INTO v_cont_id;

  INSERT INTO public.dishes
    (restaurant_id, category_id, slug, name, price, description, long_description,
     subcategory, featured, is_component_only, active, position, badges)
  VALUES
    (v_restaurant_id, v_cat_id, 'exec-oriental', 'Executivo Oriental', 'R$ 89,90',
     'Entrada + Prato Principal',
     E'Servido todos os dias, das 11h30 às 15h.',
     'Oriental', true, false, true, v_base + 2, ARRAY[]::text[])
  ON CONFLICT (restaurant_id, slug) DO UPDATE SET
    category_id = EXCLUDED.category_id, name = EXCLUDED.name, price = EXCLUDED.price,
    description = EXCLUDED.description, long_description = EXCLUDED.long_description,
    subcategory = EXCLUDED.subcategory, featured = true, is_component_only = false, active = true
  RETURNING id INTO v_ori_id;

  ---------------------------------------------------------------------------
  -- 3. Itens (pratos-componente) + ligacao em dish_components.
  --    Cada linha: (pai, kind, posicao_na_etapa, slug, nome, preco, descricao)
  ---------------------------------------------------------------------------
  FOR r IN
    SELECT * FROM (VALUES
      -- ===== CONTEMPORÂNEO — Entradas =====
      (v_cont_id, 'entrada',   0, 'exec-cont-salada-caesar',        'Salada Caesar',                  NULL::text, 'Acelga, molho caesar, croutons e lascas de parmesão.'),
      (v_cont_id, 'entrada',   1, 'exec-cont-croquete-costela',     'Croquete de Costela',            NULL,       'Croquete de costela com maionese de pimenta.'),
      (v_cont_id, 'entrada',   2, 'exec-cont-mini-burger-fraldinha','Mini Burger de Fraldinha',       NULL,       'Burger de fraldinha, cebola caramelizada, pesto de rúcula e passata de tomate.'),
      -- ===== CONTEMPORÂNEO — Principais =====
      (v_cont_id, 'principal', 0, 'exec-cont-robalo',               'Robalo',                         NULL,       'Purê de abóbora, vagem tostada e molho cítrico.'),
      (v_cont_id, 'principal', 1, 'exec-cont-espaguete-camaroes',   'Espaguete com Camarões',         NULL,       'Massa cremosa de camarão finalizada com camarão empanado.'),
      (v_cont_id, 'principal', 2, 'exec-cont-file-mignon',          'Filé Mignon',                    NULL,       'Crispy de batata-doce, risoto de parmesão e aioli de ervas.'),
      (v_cont_id, 'principal', 3, 'exec-cont-risoto-ratatouille',   'Risoto Ratatouille',             NULL,       'Abobrinha, berinjela, tomate, pimentão, parmesão e tomilho.'),
      -- ===== CONTEMPORÂNEO — Sobremesas =====
      (v_cont_id, 'sobremesa', 0, 'exec-cont-bolo-gelado-coco',     'Bolo Gelado de Coco',            'R$ 9,90',  'Ganache de maracujá e sorvete.'),
      (v_cont_id, 'sobremesa', 1, 'exec-cont-ninho-al-crumble',     'Ninho al Crumble',               'R$ 9,90',  'Creme de leite ninho, crumble e sorbet de morango.'),
      -- ===== ORIENTAL — Entradas =====
      (v_ori_id,  'entrada',   0, 'exec-ori-ceviche-tilapia',       'Ceviche de Tilápia',             NULL,       'Uva verde, milho peruano, azeite verde e raspadinha de pimenta dedo-de-moça.'),
      (v_ori_id,  'entrada',   1, 'exec-ori-carpaccio-salmao',      'Carpaccio de Salmão',            NULL,       'Aioli de maracujá, molho ponzu, crocante de arroz e ovas de capelin.'),
      (v_ori_id,  'entrada',   2, 'exec-ori-salada-frutos-mar',     'Salada de Frutos do Mar',        NULL,       'Mix de folhas, tomate confit, carpaccio de salmão curado, camarão crocante e molho oriental.'),
      (v_ori_id,  'entrada',   3, 'exec-ori-mini-burger-suino',     'Mini Burger Suíno',              NULL,       'Passata fresca de tomate e mayo nippon (maionese japonesa da casa).'),
      -- ===== ORIENTAL — Principais =====
      (v_ori_id,  'principal', 0, 'exec-ori-tonkatsu',              'Tonkatsu',                       NULL,       'Lombo suíno empanado ao molho agridoce japonês, purê de mandioquinha com gengibre e couve crispy.'),
      (v_ori_id,  'principal', 1, 'exec-ori-file-mignon',           'Filé Mignon',                    NULL,       'Ao molho de shoyu trufado com risoto de shimeji finalizado com redução de balsâmico.'),
      (v_ori_id,  'principal', 2, 'exec-ori-risoto-nero',           'Risoto Nero',                    NULL,       'Lula empanada com risoto de tinta de lula e raspas de limão siciliano.'),
      (v_ori_id,  'principal', 3, 'exec-ori-mini-combinado-12',     'Mini Combinado 12 Peças Kanpai', NULL,       'Combinado especial selecionado pelo sushibar.')
    ) AS t(parent uuid, kind text, pos int, slug text, name text, price text, descr text)
  LOOP
    -- prato-componente (sem foto; image_path NULL -> placeholder ate voce subir)
    INSERT INTO public.dishes
      (restaurant_id, category_id, slug, name, price, description,
       featured, is_component_only, active, position, badges)
    VALUES
      (v_restaurant_id, v_cat_id, r.slug, r.name, r.price, r.descr,
       false, true, true, 0, ARRAY[]::text[])
    ON CONFLICT (restaurant_id, slug) DO UPDATE SET
      category_id = EXCLUDED.category_id, name = EXCLUDED.name, price = EXCLUDED.price,
      description = EXCLUDED.description, is_component_only = true, active = true
    RETURNING id INTO v_child;

    -- ligacao pai -> filho
    INSERT INTO public.dish_components (parent_dish_id, child_dish_id, kind, position)
    VALUES (r.parent, v_child, r.kind, r.pos)
    ON CONFLICT (parent_dish_id, child_dish_id) DO UPDATE SET
      kind = EXCLUDED.kind, position = EXCLUDED.position;
  END LOOP;

  RAISE NOTICE 'Restauracao concluida para "%": 2 menus, 17 itens.', v_restaurant_id;
END $$;

-- ============================================================================
-- VERIFICAÇÃO (rode depois pra conferir o que ficou)
-- ============================================================================
SELECT p.name AS menu, dc.kind, dc.position, c.name AS item, c.price,
       (c.image_path IS NOT NULL) AS tem_foto
FROM public.dish_components dc
JOIN public.dishes p ON p.id = dc.parent_dish_id
JOIN public.dishes c ON c.id = dc.child_dish_id
WHERE p.slug IN ('exec-contemporaneo', 'exec-oriental')
ORDER BY p.name, dc.kind, dc.position;
