-- ============================================================================
-- 1) VER O QUE MUDOU NA ÚLTIMA HORA (Flamboyant)  +  2) CARD FESTIVAL PREMIUM
-- ----------------------------------------------------------------------------
-- COMO RODAR: Supabase Studio → SQL Editor → cole o bloco que quiser → Run.
-- As 3 partes são independentes; rode uma de cada vez.
-- ============================================================================


-- ============================================================================
-- PARTE A — Ver as alterações da ÚLTIMA HORA no Flamboyant (só leitura)
-- ----------------------------------------------------------------------------
-- Use isto pra decidir o que replicar no Goiânia. Mostra ação, o que mudou,
-- quem fez e os detalhes (preço novo, etc.).
-- ============================================================================
SELECT created_at AT TIME ZONE 'America/Sao_Paulo' AS quando,
       action       AS acao,
       entity_type  AS tipo,
       entity_label AS item,
       actor_email  AS quem,
       details
FROM public.admin_audit_log
WHERE restaurant_id = 'flamboyant'
  AND created_at >= now() - interval '1 hour'
ORDER BY created_at DESC;


-- ============================================================================
-- PARTE B — Conferir como está o "festival" hoje nas duas unidades (só leitura)
-- ----------------------------------------------------------------------------
-- Confirme o slug da categoria e se já existe algum card de almoço antes de
-- inserir (evita duplicar com grafia diferente).
-- ============================================================================
SELECT d.restaurant_id, c.slug AS categoria, d.slug AS prato_slug,
       d.name, d.price, d.original_price, d.active
FROM public.dishes d
JOIN public.categories c ON c.id = d.category_id
WHERE c.slug = 'festival' OR d.name ILIKE '%festival premium%'
ORDER BY d.restaurant_id, d.name;


-- ============================================================================
-- PARTE C — CRIAR/ATUALIZAR o card "Festival Premium - Almoço" (de 174,90 por 139,90)
-- ----------------------------------------------------------------------------
-- Insere nas DUAS unidades (flamboyant + goianiashopping) dentro da categoria
-- de slug 'festival'. Idempotente: roda de novo sem duplicar (upsert por slug).
-- >>> Se PARTE B mostrar outro slug de categoria, ajuste v_cat_slug abaixo. <<<
-- ============================================================================
DO $$
DECLARE
  v_cat_slug text := 'festival';                 -- categoria onde o card aparece
  v_slug     text := 'festival-premium-almoco';  -- slug do prato (chave do upsert)
  v_name     text := 'Festival Premium - Almoço';
  v_desc     text := 'Festival Premium no almoço.';  -- AJUSTE a descrição se quiser
  v_price          numeric := 139.90;            -- preço atual (o "por")
  v_original_price numeric := 174.90;            -- preço riscado (o "de")
  v_unit text;
  v_cat  uuid;
  v_pos  int;
BEGIN
  FOREACH v_unit IN ARRAY ARRAY['flamboyant','goianiashopping'] LOOP
    SELECT id INTO v_cat
    FROM public.categories
    WHERE restaurant_id = v_unit AND slug = v_cat_slug
    LIMIT 1;

    IF v_cat IS NULL THEN
      RAISE NOTICE 'Unidade %: categoria "%" nao existe — pulando.', v_unit, v_cat_slug;
      CONTINUE;
    END IF;

    SELECT COALESCE(max(position) + 1, 0) INTO v_pos
    FROM public.dishes WHERE restaurant_id = v_unit AND category_id = v_cat;

    INSERT INTO public.dishes
      (restaurant_id, category_id, slug, name, price, original_price,
       description, active, position)
    VALUES
      (v_unit, v_cat, v_slug, v_name, v_price, v_original_price,
       v_desc, true, v_pos)
    ON CONFLICT (restaurant_id, slug) DO UPDATE SET
       category_id    = EXCLUDED.category_id,
       name           = EXCLUDED.name,
       price          = EXCLUDED.price,
       original_price = EXCLUDED.original_price,
       description    = EXCLUDED.description,
       active         = true,
       updated_at     = now();

    RAISE NOTICE 'Unidade %: card "%" pronto (de % por %).',
      v_unit, v_name, v_original_price, v_price;
  END LOOP;
END $$;
