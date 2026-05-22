# Schema Diff — 2026-05-22

**Snapshot inicial:** [`supabase/snapshots/2026-05-22-initial.sql`](../../../supabase/snapshots/2026-05-22-initial.sql)
**Schema-alvo:** [`docs/superpowers/specs/2026-05-22-admin-kanpai-design.md`](../specs/2026-05-22-admin-kanpai-design.md) (seção "Schema-alvo do banco")

## Resumo

O banco existente está praticamente vazio para o domínio do admin. A única tabela é `dish_likes` (contador de curtidas usado pelo cardápio público) que NÃO faz parte do schema-alvo e que deixamos intocada. Todas as 6 tabelas do schema-alvo precisam ser criadas do zero.

Há um event trigger `rls_auto_enable` que liga RLS automaticamente em qualquer tabela nova do schema `public` — por isso nossa migration não precisa de `ALTER TABLE ... ENABLE RLS`, mas ainda precisa criar policies.

## Objetos existentes no banco

### Tabelas
- `public.dish_likes` — `dish_id text PK, count int, updated_at timestamptz`. Counter denormalizado por slug do prato. RLS habilitada, policy `dish_likes_read_public` (SELECT pra anon/authenticated).

### Funções
- `public.increment_dish_like(p_dish_id text) → integer` — upsert + +1.
- `public.decrement_dish_like(p_dish_id text) → integer` — -1 com floor em 0.
- `public.rls_auto_enable() → event_trigger` — DDL event trigger; auto-habilita RLS em CREATE TABLE.

### Sequences, views, enums
Nenhuma.

## Diff por tabela do schema-alvo

| Tabela | Status | Ação |
|---|---|---|
| `categories` | falta | CREATE |
| `dishes` | falta | CREATE |
| `dish_variants` | falta | CREATE |
| `dish_detail_sections` | falta | CREATE |
| `executivo_menus` | falta | CREATE |
| `executivo_items` | falta | CREATE |

## Conflitos / pontos de atenção

1. **`dish_likes.dish_id` é text (slug), `dishes.id` no schema-alvo é uuid.**
   Hoje o cardápio público referencia pratos por slug (`festival`, `pizze-margherita`, etc) e o counter usa essa mesma string. No schema-alvo, `dishes.id` é uuid gerado, mas há uma coluna `slug`-like? — NÃO. O schema-alvo não tem coluna explícita de slug.
   **Decisão:** adicionar `dishes.slug text UNIQUE` no schema-alvo (extensão menor da spec) para preservar a integração com `dish_likes`. O slug fica o "ID externo" estável usado pelo cardápio público; `id` (uuid) é o PK interno usado pelo admin.
   Não vamos FK `dish_likes.dish_id → dishes.slug` ainda — `dish_likes` continua independente para não vazar acoplamento entre features. A FK pode vir na Fase 3 (migração do site público pra Supabase).

2. **`categories.id` é text (slug), não uuid.** Já estava na spec, alinhado.

3. **Event trigger `rls_auto_enable`.** Cuidado: ele tenta `EXECUTE format('alter table if exists %s enable row level security', cmd.object_identity)` em CREATE TABLE. Para nossas 6 tabelas novas, RLS vira automática — não precisamos `ALTER TABLE ... ENABLE RLS`. Mas precisamos CREATE POLICY (caso contrário, com RLS ligada e sem policy, ninguém lê nada).

4. **Slug coercion / migration de dados.** Não há dados de pratos hoje. Todo o conteúdo vive em `apps/site/lib/menu-data.ts`. A migração de seed do menu-data → tabelas será separada (Fase 1 task de seed, ou rodada manualmente uma vez).

## Plano de migration

Uma única migration nesta fase: `<timestamp>_schema_align_target.sql`.

Conteúdo ordenado:

1. **Tabela `categories`** (id text PK)
2. **Tabela `dishes`** (id uuid PK, slug text UNIQUE, FK category_id → categories.id)
3. **Tabela `dish_variants`** (FK dish_id → dishes.id)
4. **Tabela `dish_detail_sections`** (FK dish_id → dishes.id)
5. **Tabela `executivo_menus`** (FK category_id → categories.id)
6. **Tabela `executivo_items`** (FK executivo_id → executivo_menus.id)
7. **Policies SELECT públicas** (anon + authenticated, condição `active = true` quando aplicável)
8. **Policies INSERT/UPDATE/DELETE pra `authenticated`**

> RLS já é habilitada automaticamente pelo `rls_auto_enable`. Migration NÃO inclui `ALTER TABLE ... ENABLE RLS`.

## Riscos identificados

- **Nenhum risco de perda de dados.** As tabelas que vamos criar não existem; `dish_likes` fica intocada.
- **`rls_auto_enable` pode logar warnings**, mas é benigno — o trigger captura `EXCEPTION WHEN OTHERS` internamente.
- **Slug uniqueness em `dishes.slug`** precisa ser respeitada pelo admin — UI deve gerar/validar slug ao criar prato. Tratamento UX é decisão da Fase 1.
