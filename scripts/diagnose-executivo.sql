-- ============================================================================
-- DIAGNÓSTICO: o que aconteceu com o Menu Executivo
-- ----------------------------------------------------------------------------
-- Rode cada bloco no Supabase Studio > SQL Editor (projeto de produção do
-- kanpai) e cole o resultado de volta. Nada aqui altera dados — é só leitura.
-- ============================================================================

-- 1. Categorias relacionadas a "executivo" (existe a categoria ainda?)
SELECT id, slug, name, active, restaurant_id
FROM public.categories
WHERE name ILIKE '%executiv%' OR slug ILIKE '%exec%'
ORDER BY restaurant_id, name;

-- 2. Pratos que são (ou eram) os menus executivos — o "pai"
--    slug 'exec-...' veio da migration de conversão; nome com "executiv".
SELECT id, slug, name, category_id, restaurant_id,
       featured, is_component_only, active,
       (image_path IS NOT NULL) AS tem_foto
FROM public.dishes
WHERE slug ILIKE 'exec-%' OR name ILIKE '%executiv%'
ORDER BY restaurant_id, name;

-- 3. Itens (componentes) ligados a esses menus — com foto ou não
SELECT p.name AS menu, dc.kind, dc.position,
       c.id AS item_id, c.name AS item, c.price,
       c.active, c.is_component_only,
       (c.image_path IS NOT NULL) AS item_tem_foto
FROM public.dish_components dc
JOIN public.dishes p ON p.id = dc.parent_dish_id
JOIN public.dishes c ON c.id = dc.child_dish_id
WHERE p.slug ILIKE 'exec-%' OR p.name ILIKE '%executiv%'
ORDER BY p.name, dc.kind, dc.position;

-- 4. Panorama geral (números rápidos)
SELECT
  (SELECT count(*) FROM public.dish_components)                          AS total_componentes,
  (SELECT count(*) FROM public.dishes WHERE is_component_only)           AS pratos_so_componente,
  (SELECT count(*) FROM public.dish_detail_sections)                     AS total_secoes_texto,
  (SELECT count(*) FROM public.dishes WHERE name ILIKE '%executiv%')     AS dishes_com_nome_executivo;

-- 5. AUDITORIA: o que foi APAGADO/alterado relacionado a pratos/componentes
--    (mostra quem, quando e o quê — os 100 eventos mais recentes de delete)
SELECT created_at, actor_email, action, entity_type, entity_label, entity_id, restaurant_id
FROM public.admin_audit_log
WHERE action ILIKE '%delete%'
   OR action ILIKE '%remov%'
   OR entity_label ILIKE '%executiv%'
ORDER BY created_at DESC
LIMIT 100;

-- 6. AUDITORIA: tudo que mexeu em qualquer entidade nos últimos 14 dias
--    (pra cruzar com a data em que você notou o sumiço)
SELECT created_at, actor_email, action, entity_type, entity_label, entity_id
FROM public.admin_audit_log
WHERE created_at >= now() - interval '14 days'
ORDER BY created_at DESC
LIMIT 200;
