# Fase 0 — Setup do Monorepo + Schema Diff — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reestruturar o repositório atual em monorepo pnpm com `apps/site` (cardápio público existente, sem mudança de comportamento) e preparar o terreno para `apps/admin` na Fase 1, conectando ao Supabase existente e produzindo migration(s) que levem o banco ao schema-alvo.

**Architecture:** pnpm workspaces (sem Turborepo). Movemos o código atual para `apps/site/` mantendo o build idêntico. Criamos `packages/db` com cliente Supabase + types gerados. Criamos `supabase/` com migrations versionadas. A app `admin` ainda não existe nessa fase — só preparamos o esqueleto.

**Tech Stack:** pnpm 9+, Next.js 14.2.15 (mantido), TypeScript 5.6, Supabase CLI, `@supabase/ssr` (instalado mas usado só na Fase 1).

**Pré-requisito:** acesso ao projeto Supabase existente (URL + anon key + service role key + project ref).

---

## File Structure

**Novos:**
- `pnpm-workspace.yaml` — declara workspaces.
- `package.json` (root) — só metadados + scripts top-level, sem dependências.
- `apps/site/` — recebe TODO o conteúdo atual da raiz (app/, components/, lib/, public/, configs, package.json).
- `packages/db/package.json` — pacote interno `@kanpai/db`.
- `packages/db/src/index.ts` — exporta `createBrowserClient`, `createServerClient`, type `Database`.
- `packages/db/src/database.types.ts` — gerado por `supabase gen types`.
- `packages/db/tsconfig.json`.
- `supabase/config.toml` — configuração local da Supabase CLI.
- `supabase/migrations/` — diretório vazio inicialmente; preenchido após diff.
- `.env.example` (root) — placeholders das vars do Supabase.
- `.gitignore` (root) — ajustado para monorepo.
- `docs/superpowers/plans/2026-05-22-fase-0-schema-diff.md` — anotações do diff (artefato dessa fase).

**Movidos (sem mudança de conteúdo):**
- `app/`, `components/`, `lib/`, `public/` → `apps/site/`
- `package.json`, `package-lock.json`, `tsconfig.json`, `tailwind.config.ts`, `postcss.config.js`, `next.config.js`, `README.md`, `.eslintrc*` → `apps/site/`

**Removidos:**
- `package-lock.json` da raiz após migração (substituído por `pnpm-lock.yaml`).
- `skills-lock.json` permanece onde está.

---

## Task 1: Branch de trabalho

**Files:** nenhum

- [ ] **Step 1: Criar branch dedicada**

```bash
git checkout -b feat/monorepo-fase-0
```

- [ ] **Step 2: Confirmar working tree limpa**

Run: `git status`
Expected: `nothing to commit, working tree clean`

---

## Task 2: Mover código atual para apps/site

**Files:**
- Move: raiz → `apps/site/`

- [ ] **Step 1: Criar diretório apps/site**

```bash
mkdir -p apps/site
```

- [ ] **Step 2: Mover diretórios de código com git mv**

```bash
git mv app apps/site/app
git mv components apps/site/components
git mv lib apps/site/lib
```

- [ ] **Step 3: Mover public se existir, ou criar vazio**

```bash
if [ -d public ]; then git mv public apps/site/public; else mkdir -p apps/site/public; fi
```

- [ ] **Step 4: Mover arquivos de configuração da app**

```bash
git mv package.json apps/site/package.json
git mv tsconfig.json apps/site/tsconfig.json
git mv tailwind.config.ts apps/site/tailwind.config.ts
git mv postcss.config.js apps/site/postcss.config.js
git mv next.config.js apps/site/next.config.js
git mv package-lock.json apps/site/package-lock.json
```

- [ ] **Step 5: Verificar estrutura**

Run: `ls apps/site && ls`
Expected em `apps/site`: `app components lib next.config.js package.json package-lock.json postcss.config.js public tailwind.config.ts tsconfig.json`
Expected na raiz: `apps docs README.md skills-lock.json` (e possivelmente arquivos ocultos)

- [ ] **Step 6: Confirmar que apps/site builda como antes**

```bash
cd apps/site && npm install && npm run build
```
Expected: build conclui sem erros.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "refactor: mover codigo atual para apps/site (sem mudancas funcionais)"
```

---

## Task 3: Renomear package da site

**Files:**
- Modify: `apps/site/package.json`

- [ ] **Step 1: Renomear o package**

Editar `apps/site/package.json` mudando apenas o campo `name`:

```json
{
  "name": "@kanpai/site",
  "version": "0.1.0",
  "private": true,
  ...
}
```

(Manter scripts e dependências como estão.)

- [ ] **Step 2: Commit**

```bash
git add apps/site/package.json
git commit -m "refactor: renomear package para @kanpai/site"
```

---

## Task 4: Configurar pnpm workspaces na raiz

**Files:**
- Create: `pnpm-workspace.yaml`
- Create: `package.json` (raiz)
- Modify: `.gitignore` (raiz)

- [ ] **Step 1: Criar pnpm-workspace.yaml**

Conteúdo de `pnpm-workspace.yaml`:

```yaml
packages:
  - "apps/*"
  - "packages/*"
```

- [ ] **Step 2: Criar package.json da raiz**

Conteúdo de `package.json` (raiz):

```json
{
  "name": "kanpai-blue-monorepo",
  "version": "0.1.0",
  "private": true,
  "packageManager": "pnpm@9.12.0",
  "scripts": {
    "site:dev": "pnpm --filter @kanpai/site dev",
    "site:build": "pnpm --filter @kanpai/site build",
    "admin:dev": "pnpm --filter @kanpai/admin dev",
    "admin:build": "pnpm --filter @kanpai/admin build",
    "db:types": "supabase gen types typescript --project-id $SUPABASE_PROJECT_REF --schema public > packages/db/src/database.types.ts"
  },
  "devDependencies": {
    "typescript": "^5.6.3"
  }
}
```

- [ ] **Step 3: Atualizar .gitignore da raiz**

Garantir que `.gitignore` contém (sobrescreva se necessário, mantendo entradas existentes do projeto):

```
node_modules/
.next/
.env
.env.local
.vercel
.DS_Store
*.log
pnpm-debug.log*
```

- [ ] **Step 4: Remover package-lock.json antigo de apps/site**

```bash
rm apps/site/package-lock.json
```

- [ ] **Step 5: Instalar com pnpm a partir da raiz**

```bash
pnpm install
```
Expected: cria `pnpm-lock.yaml` na raiz e symlinks em `apps/site/node_modules`.

- [ ] **Step 6: Verificar que site ainda builda via pnpm**

```bash
pnpm site:build
```
Expected: `apps/site` builda sem erros (next build conclui).

- [ ] **Step 7: Commit**

```bash
git add pnpm-workspace.yaml package.json .gitignore pnpm-lock.yaml
git commit -m "chore: ativar pnpm workspaces (root + site)"
```

---

## Task 5: Criar packages/db (esqueleto)

**Files:**
- Create: `packages/db/package.json`
- Create: `packages/db/tsconfig.json`
- Create: `packages/db/src/index.ts`
- Create: `packages/db/src/database.types.ts` (placeholder)

- [ ] **Step 1: Criar estrutura**

```bash
mkdir -p packages/db/src
```

- [ ] **Step 2: Criar packages/db/package.json**

```json
{
  "name": "@kanpai/db",
  "version": "0.0.1",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "dependencies": {
    "@supabase/ssr": "^0.5.1",
    "@supabase/supabase-js": "^2.45.4"
  },
  "devDependencies": {
    "typescript": "^5.6.3"
  }
}
```

- [ ] **Step 3: Criar packages/db/tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "declaration": true,
    "jsx": "preserve",
    "lib": ["ES2020", "DOM"]
  },
  "include": ["src/**/*.ts"]
}
```

- [ ] **Step 4: Criar placeholder de tipos**

Conteúdo de `packages/db/src/database.types.ts`:

```ts
export type Database = {
  public: {
    Tables: Record<string, never>;
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
};
```

> Esse arquivo será sobrescrito pela CLI da Supabase na Task 9.

- [ ] **Step 5: Criar packages/db/src/index.ts**

```ts
import { createBrowserClient as createBrowser, createServerClient as createServer, type CookieOptions } from "@supabase/ssr";
import type { Database } from "./database.types";

export type { Database };

export function createBrowserClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY sao obrigatorios");
  }
  return createBrowser<Database>(url, anonKey);
}

export function createServerClient(cookies: {
  get: (name: string) => string | undefined;
  set: (name: string, value: string, options: CookieOptions) => void;
  remove: (name: string, options: CookieOptions) => void;
}) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY sao obrigatorios");
  }
  return createServer<Database>(url, anonKey, { cookies });
}
```

- [ ] **Step 6: Instalar dependências**

```bash
pnpm install
```
Expected: pnpm baixa `@supabase/ssr` e `@supabase/supabase-js` para `packages/db`.

- [ ] **Step 7: Verificar que types compilam**

```bash
pnpm --filter @kanpai/db exec tsc --noEmit
```
Expected: zero erros.

- [ ] **Step 8: Commit**

```bash
git add packages/db pnpm-lock.yaml
git commit -m "feat(db): criar pacote @kanpai/db com cliente Supabase tipado"
```

---

## Task 6: Variáveis de ambiente (.env.example)

**Files:**
- Create: `.env.example` (raiz)
- Create: `apps/site/.env.local.example`

- [ ] **Step 1: Criar .env.example na raiz**

Conteúdo de `.env.example`:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
SUPABASE_PROJECT_REF=<project-ref>
```

- [ ] **Step 2: Criar exemplo específico do site**

Conteúdo de `apps/site/.env.local.example`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
```

- [ ] **Step 3: Confirmar que .env / .env.local estão no .gitignore**

Run: `grep -E "^\.env" .gitignore`
Expected: pelo menos `.env` e `.env.local` listados.

- [ ] **Step 4: Commit**

```bash
git add .env.example apps/site/.env.local.example
git commit -m "chore: exemplos de variaveis de ambiente do Supabase"
```

---

## Task 7: Instalar Supabase CLI localmente

**Files:**
- Create: `supabase/config.toml` (gerado pela CLI)

- [ ] **Step 1: Adicionar Supabase CLI como devDependency da raiz**

```bash
pnpm add -w -D supabase
```
Expected: instala o binário em `node_modules/.bin/supabase`.

- [ ] **Step 2: Inicializar diretório supabase/**

```bash
pnpm exec supabase init
```
Expected: cria `supabase/config.toml` e `supabase/.gitignore`.

> Quando perguntado se quer gerar workflow do VSCode, escolher **N**. Se perguntar sobre IntelliJ, **N**.

- [ ] **Step 3: Verificar versão**

Run: `pnpm exec supabase --version`
Expected: imprime versão (ex: `1.x.x`).

- [ ] **Step 4: Commit**

```bash
git add supabase package.json pnpm-lock.yaml
git commit -m "chore: inicializar Supabase CLI no monorepo"
```

---

## Task 8: Linkar projeto Supabase remoto

**Files:** nenhum (estado da CLI)

> **Bloqueio:** essa task exige `SUPABASE_PROJECT_REF` + login na CLI. Sem isso, parar aqui até o usuário fornecer.

- [ ] **Step 1: Carregar variáveis de ambiente**

Criar `.env` na raiz (NUNCA commitado) com os valores reais:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://<real-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<real-anon>
SUPABASE_SERVICE_ROLE_KEY=<real-service-role>
SUPABASE_PROJECT_REF=<real-ref>
```

- [ ] **Step 2: Login na CLI**

```bash
pnpm exec supabase login
```
Expected: abre browser pra autenticar. Após confirmar, terminal mostra `You are now logged in`.

- [ ] **Step 3: Linkar ao projeto remoto**

```bash
set -a; source .env; set +a
pnpm exec supabase link --project-ref "$SUPABASE_PROJECT_REF"
```
Expected: `Finished supabase link.`

- [ ] **Step 4: Verificar link**

Run: `pnpm exec supabase projects list`
Expected: o projeto linkado aparece marcado com asterisco.

> Sem commit aqui — apenas estado local da CLI.

---

## Task 9: Dump do schema atual

**Files:**
- Create: `docs/superpowers/plans/2026-05-22-fase-0-schema-diff.md`
- Create: `packages/db/src/database.types.ts` (sobrescrito)
- Create: `supabase/snapshots/2026-05-22-initial.sql`

- [ ] **Step 1: Criar diretório de snapshots**

```bash
mkdir -p supabase/snapshots
```

- [ ] **Step 2: Dump do schema atual**

```bash
pnpm exec supabase db dump --schema public --file supabase/snapshots/2026-05-22-initial.sql
```
Expected: arquivo SQL com `CREATE TABLE`, índices, RLS e policies do projeto.

- [ ] **Step 3: Gerar types TypeScript do banco atual**

```bash
set -a; source .env; set +a
pnpm db:types
```
Expected: `packages/db/src/database.types.ts` é sobrescrito com tipos reais.

- [ ] **Step 4: Verificar compilação de @kanpai/db com tipos reais**

```bash
pnpm --filter @kanpai/db exec tsc --noEmit
```
Expected: zero erros.

- [ ] **Step 5: Criar documento de diff**

Conteúdo de `docs/superpowers/plans/2026-05-22-fase-0-schema-diff.md` (preencher após análise — passos a executar):

```markdown
# Schema Diff — 2026-05-22

Snapshot inicial: `supabase/snapshots/2026-05-22-initial.sql`
Schema-alvo: spec `docs/superpowers/specs/2026-05-22-admin-kanpai-design.md` (seção "Schema-alvo do banco")

## Tabelas existentes no banco

(listar a partir do dump)

## Tabelas do schema-alvo

- categories
- dishes
- dish_variants
- dish_detail_sections
- executivo_menus
- executivo_items

## Diff por tabela

### categories
- Status: [existe / falta / parcial]
- Colunas presentes: ...
- Colunas faltando: ...
- Colunas extras (manter, não usaremos): ...

### dishes
- Status: ...
- ...

(repetir para cada tabela)

## Plano de migration

Lista ordenada de DDL necessária:
1. `CREATE TABLE ...` (para tabelas faltando)
2. `ALTER TABLE ... ADD COLUMN ...` (para colunas faltando)
3. `CREATE POLICY ...` (para RLS faltando)

## Riscos identificados

(qualquer conflito de nomes, FK incompatível, dados existentes que precisem migrar)
```

> Esse documento é **artefato**: você (engenheiro) lê o dump, compara com a seção "Schema-alvo do banco" da spec, e preenche cada subseção.

- [ ] **Step 6: Commit do snapshot, types e documento**

```bash
git add supabase/snapshots packages/db/src/database.types.ts docs/superpowers/plans/2026-05-22-fase-0-schema-diff.md
git commit -m "chore(db): snapshot inicial do schema + types gerados + skeleton do diff"
```

---

## Task 10: Preencher o documento de diff

**Files:**
- Modify: `docs/superpowers/plans/2026-05-22-fase-0-schema-diff.md`

- [ ] **Step 1: Abrir snapshot e spec lado a lado**

Run: `cat supabase/snapshots/2026-05-22-initial.sql | head -200`
E ter aberto: `docs/superpowers/specs/2026-05-22-admin-kanpai-design.md` (seção "Schema-alvo do banco").

- [ ] **Step 2: Listar tabelas existentes**

```bash
pnpm exec supabase db dump --schema public --data-only=false | grep -E "^CREATE TABLE"
```
Copiar a saída para a seção "Tabelas existentes no banco" do documento.

- [ ] **Step 3: Preencher cada subseção de tabela**

Para CADA tabela do schema-alvo (categories, dishes, dish_variants, dish_detail_sections, executivo_menus, executivo_items):

1. Buscar no snapshot se existe (`grep -A 30 "CREATE TABLE.*\\.<nome>" supabase/snapshots/2026-05-22-initial.sql`).
2. Se existe, listar colunas e comparar com schema-alvo.
3. Marcar status: `existe-igual` / `existe-parcial` / `falta`.
4. Listar colunas faltando.
5. Listar colunas extras (não usaremos, mas não removeremos).

- [ ] **Step 4: Escrever lista ordenada de DDL**

Na seção "Plano de migration", escrever as instruções SQL exatas necessárias:

```sql
-- Exemplo:
-- CREATE TABLE IF NOT EXISTS public.dish_detail_sections (
--   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
--   dish_id uuid REFERENCES public.dishes(id) ON DELETE CASCADE,
--   label text NOT NULL,
--   description text NOT NULL,
--   position integer NOT NULL
-- );
```

- [ ] **Step 5: Identificar riscos**

Preencher a seção "Riscos identificados" com qualquer:
- Conflito de nome de coluna (ex: já existe `dishes.image_url` em vez de `image_path`).
- FK aponta para tabela com tipo de ID diferente (ex: `categories.id` é uuid no banco mas text no schema-alvo).
- Dados existentes que precisariam ser migrados.

> Se houver riscos sérios, parar e discutir com o usuário antes de prosseguir.

- [ ] **Step 6: Commit do diff completo**

```bash
git add docs/superpowers/plans/2026-05-22-fase-0-schema-diff.md
git commit -m "docs(db): completar diff do schema atual vs alvo"
```

---

## Task 11: Escrever migration de gap

**Files:**
- Create: `supabase/migrations/<timestamp>_schema_align_target.sql`

- [ ] **Step 1: Gerar arquivo de migration com timestamp**

```bash
pnpm exec supabase migration new schema_align_target
```
Expected: cria `supabase/migrations/<YYYYMMDDHHMMSS>_schema_align_target.sql` vazio.

- [ ] **Step 2: Preencher migration com DDL do diff**

Abrir o arquivo gerado e colar a lista ordenada de DDL da Task 10 Step 4. Estrutura recomendada:

```sql
-- ============================================================================
-- Schema align: bring existing DB up to target spec
-- Spec: docs/superpowers/specs/2026-05-22-admin-kanpai-design.md
-- Diff:  docs/superpowers/plans/2026-05-22-fase-0-schema-diff.md
-- ============================================================================

-- 1. Tabelas novas
CREATE TABLE IF NOT EXISTS public.dish_variants (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dish_id     uuid NOT NULL REFERENCES public.dishes(id) ON DELETE CASCADE,
  name        text NOT NULL,
  price       text NOT NULL,
  image_path  text,
  position    integer NOT NULL
);

CREATE TABLE IF NOT EXISTS public.dish_detail_sections (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dish_id     uuid NOT NULL REFERENCES public.dishes(id) ON DELETE CASCADE,
  label       text NOT NULL,
  description text NOT NULL,
  position    integer NOT NULL
);

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

CREATE TABLE IF NOT EXISTS public.executivo_items (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  executivo_id uuid NOT NULL REFERENCES public.executivo_menus(id) ON DELETE CASCADE,
  kind         text NOT NULL CHECK (kind IN ('entrada','principal','sobremesa')),
  name         text NOT NULL,
  description  text NOT NULL,
  price        text,
  position     integer NOT NULL
);

-- 2. Colunas faltando em tabelas existentes
-- (substituir pelos ALTERs reais que vieram do diff — exemplos)
-- ALTER TABLE public.dishes ADD COLUMN IF NOT EXISTS image_path text;
-- ALTER TABLE public.dishes ADD COLUMN IF NOT EXISTS badges text[] DEFAULT '{}';
-- ALTER TABLE public.dishes ADD COLUMN IF NOT EXISTS long_description text;

-- 3. RLS nas tabelas novas
ALTER TABLE public.dish_variants         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dish_detail_sections  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.executivo_menus       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.executivo_items       ENABLE ROW LEVEL SECURITY;

-- 4. Policies: leitura pública, escrita autenticada
CREATE POLICY "public read"  ON public.dish_variants
  FOR SELECT USING (true);
CREATE POLICY "auth write"   ON public.dish_variants
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "public read"  ON public.dish_detail_sections
  FOR SELECT USING (true);
CREATE POLICY "auth write"   ON public.dish_detail_sections
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "public read"  ON public.executivo_menus
  FOR SELECT USING (active = true);
CREATE POLICY "auth write"   ON public.executivo_menus
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "public read"  ON public.executivo_items
  FOR SELECT USING (true);
CREATE POLICY "auth write"   ON public.executivo_items
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
```

> **Importante:** mantenha `IF NOT EXISTS` em tudo. A migration deve ser idempotente. Não apague nem renomeie nada existente — só adicione.

- [ ] **Step 3: Dry-run da migration**

```bash
pnpm exec supabase db diff --linked --schema public
```
Expected: imprime o diff entre migrations locais e estado remoto. Se imprimir mais DDL do que está na sua migration, revisar.

- [ ] **Step 4: Commit da migration (ainda não aplicada)**

```bash
git add supabase/migrations
git commit -m "feat(db): migration de alinhamento ao schema-alvo (tabelas + RLS)"
```

---

## Task 12: Aplicar migration no banco remoto

**Files:** nenhum (efeito remoto)

> **Ponto de não-retorno.** Confirmar com o usuário antes desta task se houver dados de produção.

- [ ] **Step 1: Backup explícito (snapshot adicional)**

```bash
pnpm exec supabase db dump --file supabase/snapshots/2026-05-22-pre-migration.sql
```

- [ ] **Step 2: Aplicar migration no remoto**

```bash
pnpm exec supabase db push
```
Expected: CLI imprime `Applying migration <timestamp>_schema_align_target.sql...` e finaliza com `Finished supabase db push.`

- [ ] **Step 3: Regenerar types**

```bash
set -a; source .env; set +a
pnpm db:types
```

- [ ] **Step 4: Verificar que types contêm as novas tabelas**

```bash
grep -E "dish_variants|dish_detail_sections|executivo_menus|executivo_items" packages/db/src/database.types.ts
```
Expected: cada nome aparece pelo menos uma vez.

- [ ] **Step 5: Commit dos types atualizados + snapshot pré-migração**

```bash
git add packages/db/src/database.types.ts supabase/snapshots/2026-05-22-pre-migration.sql
git commit -m "chore(db): aplicar migration no remoto e regenerar types"
```

---

## Task 13: Bucket de imagens no Storage

**Files:** nenhum (configuração no painel ou via SQL migration)

- [ ] **Step 1: Criar nova migration pro bucket**

```bash
pnpm exec supabase migration new storage_bucket_dish_images
```

- [ ] **Step 2: Preencher migration**

Conteúdo do arquivo gerado:

```sql
-- Bucket público de imagens de pratos
INSERT INTO storage.buckets (id, name, public)
VALUES ('dish-images', 'dish-images', true)
ON CONFLICT (id) DO NOTHING;

-- Policy: qualquer um lê
CREATE POLICY "public read dish-images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'dish-images');

-- Policy: só autenticado escreve
CREATE POLICY "auth write dish-images"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'dish-images');

CREATE POLICY "auth update dish-images"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'dish-images')
  WITH CHECK (bucket_id = 'dish-images');

CREATE POLICY "auth delete dish-images"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'dish-images');
```

- [ ] **Step 3: Aplicar**

```bash
pnpm exec supabase db push
```

- [ ] **Step 4: Verificar bucket via CLI**

```bash
pnpm exec supabase storage ls
```
Expected: lista contém `dish-images`.

- [ ] **Step 5: Commit**

```bash
git add supabase/migrations
git commit -m "feat(db): bucket dish-images com policies de leitura publica e escrita autenticada"
```

---

## Task 14: Smoke test do site com Supabase configurado

**Files:**
- Modify: `apps/site/package.json` (adicionar dep @kanpai/db)

- [ ] **Step 1: Adicionar @kanpai/db como dependência da site**

Editar `apps/site/package.json`, no objeto `dependencies` adicionar:

```json
"@kanpai/db": "workspace:*"
```

- [ ] **Step 2: Reinstalar**

```bash
pnpm install
```

- [ ] **Step 3: Criar .env.local da site (não-commitado)**

`apps/site/.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://<real-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<real-anon>
```

- [ ] **Step 4: Smoke test do build**

```bash
pnpm site:build
```
Expected: build conclui sem erros. (A site não usa Supabase ainda; só verifica que a dep resolve.)

- [ ] **Step 5: Smoke test do dev**

```bash
pnpm site:dev
```
Expected: dev server sobe em `http://localhost:3000` e a home renderiza idêntica ao antes.

- [ ] **Step 6: Parar o dev server (Ctrl+C) e commitar**

```bash
git add apps/site/package.json pnpm-lock.yaml
git commit -m "chore(site): vincular @kanpai/db (uso real vira na Fase 3)"
```

---

## Task 15: README do monorepo

**Files:**
- Modify: `README.md` (raiz)

- [ ] **Step 1: Reescrever README.md da raiz**

Conteúdo:

````markdown
# Kanpai Blue · Monorepo

Monorepo pnpm com a aplicação pública do cardápio e o admin (em construção).

## Estrutura

```
apps/
  site/      # cardápio público (kanpai-blue.com)
  admin/     # painel admin (a partir da Fase 1)
packages/
  db/        # cliente Supabase tipado, compartilhado
supabase/
  migrations/  # SQL versionado
  snapshots/   # dumps pontuais do schema
```

## Pré-requisitos

- Node 20+
- pnpm 9+
- Supabase CLI (instalada como devDependency: `pnpm exec supabase`)

## Setup

```bash
pnpm install
cp .env.example .env
# preencher .env com credenciais reais
```

## Comandos

| Comando | O que faz |
|---|---|
| `pnpm site:dev` | sobe o cardápio em localhost:3000 |
| `pnpm site:build` | builda o cardápio |
| `pnpm admin:dev` | sobe o admin (a partir da Fase 1) |
| `pnpm db:types` | regenera `packages/db/src/database.types.ts` a partir do Supabase |
| `pnpm exec supabase db push` | aplica migrations no banco remoto |

## Documentação

- Spec do admin: [`docs/superpowers/specs/2026-05-22-admin-kanpai-design.md`](docs/superpowers/specs/2026-05-22-admin-kanpai-design.md)
- Fase 0 (este setup): [`docs/superpowers/plans/2026-05-22-fase-0-monorepo-setup.md`](docs/superpowers/plans/2026-05-22-fase-0-monorepo-setup.md)
- README específico do cardápio: [`apps/site/README.md`](apps/site/README.md)
````

- [ ] **Step 2: Commit**

```bash
git add README.md
git commit -m "docs: README do monorepo"
```

---

## Task 16: Push da branch e PR

**Files:** nenhum

- [ ] **Step 1: Push da branch**

```bash
git push -u origin feat/monorepo-fase-0
```

- [ ] **Step 2: Confirmar com o usuário antes de abrir PR**

> Pause aqui. Pergunte ao usuário se quer abrir PR agora ou merge direto. **Não** abrir PR sem confirmação explícita.

---

## Critério de pronto (Fase 0)

A fase está completa quando TODAS as condições abaixo são verdadeiras:

- [ ] `pnpm site:dev` sobe o cardápio em localhost:3000 idêntico ao anterior.
- [ ] `pnpm site:build` conclui sem erros.
- [ ] `packages/db/src/database.types.ts` contém os tipos das 6 tabelas do schema-alvo.
- [ ] `supabase/snapshots/2026-05-22-initial.sql` está commitado.
- [ ] `supabase/snapshots/2026-05-22-pre-migration.sql` está commitado.
- [ ] `docs/superpowers/plans/2026-05-22-fase-0-schema-diff.md` está preenchido (não apenas template).
- [ ] Bucket `dish-images` existe no Supabase remoto.
- [ ] Branch `feat/monorepo-fase-0` está pushed.

---

## Próximos passos (fora desse plano)

A Fase 1 (Admin MVP) terá seu próprio plano em `docs/superpowers/plans/2026-XX-XX-fase-1-admin-mvp.md`, escrito após esta fase completar.
