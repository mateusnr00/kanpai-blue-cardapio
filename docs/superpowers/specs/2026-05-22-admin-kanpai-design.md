# Admin Kanpai Blue — Design

**Data:** 2026-05-22
**Status:** aprovado, aguardando acesso ao Supabase para diff de schema antes da implementação.

## Contexto

O cardápio Kanpai Blue é hoje uma app Next.js 14 estática, com todo o conteúdo em [`lib/menu-data.ts`](../../../lib/menu-data.ts). Edições exigem alterar código e fazer deploy. O cliente precisa de um painel admin para editar pratos, preços, fotos, ordem, categorias e toggles de ativação — espelhando o "Nostra Admin" usado em outro projeto, adaptado ao contexto Kanpai.

## Decisões travadas

| Decisão | Escolha |
|---|---|
| Persistência | Supabase (banco existente, será alterado) |
| Idiomas | Apenas PT |
| Auth | Email/senha via Supabase Auth, contas criadas manualmente |
| Cards (aba) | Gerencia categorias da home |
| Menu Hambúrguer | Não existe nesse sistema |
| Analytics | Placeholder "em breve", fase futura |
| Fotos | Upload direto pro Supabase Storage |
| Estruturas aninhadas (Festival/Executivo) | Editores dedicados |
| Localização do admin | Monorepo, app Next separada (`apps/admin`) |
| Variantes/Badges | Ambos incluídos |
| Identidade visual | Mesma tipografia (Inter) do site, logo Kanpai no header, sem texto "Kanpai Admin" |

## Arquitetura

### Estrutura do repositório

```
kanpai-blue-cardapio/
├── apps/
│   ├── site/             # código atual do cardápio público
│   └── admin/            # nova app Next 14 App Router
├── packages/
│   ├── db/               # Supabase client + types gerados
│   └── ui-config/        # tailwind.config base + tokens + fonts
├── supabase/
│   ├── migrations/       # SQL versionado
│   └── seed.sql          # opcional, se for repovoar
├── pnpm-workspace.yaml
└── package.json
```

### Stack

- **Next.js 14** App Router + TypeScript nas duas apps
- **Tailwind CSS** via config compartilhada
- **Supabase JS** (`@supabase/ssr` pra server components)
- **react-hook-form** + **zod** pra forms
- **@dnd-kit** pra drag-to-reorder
- **sonner** pra toasts
- **pnpm workspaces** (sem Turborepo — não compensa em 2 apps)

### Deploy

- 2 projetos Vercel apontando pro mesmo repo, Root Directory diferente
- `apps/admin` recebe `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- `apps/site` recebe apenas URL + anon key (acesso de leitura)

### Fluxo de dados

- `apps/site` lê Supabase server-side com `revalidate: 60` — mantém SSR rápido
- `apps/admin` lê/escreve via server actions, com RLS exigindo `auth.uid()` para mutações
- `packages/db` exporta `createServerClient()`, `createBrowserClient()` e o tipo `Database`

## Schema-alvo do banco

> **Importante:** já existe um banco Supabase. O schema abaixo é o **alvo** — antes de qualquer migration, fazer dump do schema atual e gerar diff. Se o banco existente cobrir parte, adaptamos nomes. Se faltar tabelas, adicionamos via migration nova sem destruir o que já existe.

```sql
-- categorias (= cards da home)
categories (
  id            text primary key,           -- slug: "festival", "pizze", etc
  number        text not null,              -- "01", "02"...
  name          text not null,
  short_name    text,
  description   text not null,
  item_count    text,                       -- display string ("2 menus")
  detail        text,
  gradient      text not null,              -- CSS linear-gradient
  featured      boolean default false,
  active        boolean default true,
  position      integer not null,
  subcategories text[],                     -- chips
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
)

-- pratos
dishes (
  id                uuid primary key default gen_random_uuid(),
  category_id       text references categories(id) on delete cascade,
  name              text not null,
  price             text,                   -- preserva formato "R$ 82,90"
  unit              text,                   -- "8 unidades"
  description       text,
  long_description  text,
  subcategory       text,
  featured          boolean default false,
  featured_gradient text,                   -- "blue" | "beige"
  original_price    text,                   -- promo riscada
  image_path        text,                   -- caminho no Storage
  active            boolean default true,
  position          integer not null,
  badges            text[] default '{}',
  created_at        timestamptz default now(),
  updated_at        timestamptz default now()
)

-- variantes (1 prato → N variantes com preço próprio)
dish_variants (
  id          uuid primary key default gen_random_uuid(),
  dish_id     uuid references dishes(id) on delete cascade,
  name        text not null,
  price       text not null,
  image_path  text,
  position    integer not null
)

-- seções do modal de detalhes (Festival Premium)
dish_detail_sections (
  id          uuid primary key default gen_random_uuid(),
  dish_id     uuid references dishes(id) on delete cascade,
  label       text not null,
  description text not null,
  position    integer not null
)

-- executivos (estrutura aninhada própria)
executivo_menus (
  id          uuid primary key default gen_random_uuid(),
  category_id text references categories(id) on delete cascade,
  name        text not null,
  price       text not null,
  format      text not null,
  description text not null,
  validity    text,
  subcategory text,
  position    integer not null,
  active      boolean default true
)

executivo_items (
  id           uuid primary key default gen_random_uuid(),
  executivo_id uuid references executivo_menus(id) on delete cascade,
  kind         text not null check (kind in ('entrada','principal','sobremesa')),
  name         text not null,
  description  text not null,
  price        text,                          -- só sobremesas usam
  position     integer not null
)
```

### Decisões de schema

- `price` como `text`, não `numeric`. Preserva formato visual ("R$ 82,90", "—", "" para sem preço). O admin valida no front e formata antes de salvar.
- `image_path` guarda o caminho no bucket (`dishes/abc-123.jpg`), não URL completa. Facilita migrar bucket no futuro.
- `position` em todas as tabelas ordenáveis (categories, dishes, dish_variants, dish_detail_sections, executivo_items).
- `badges text[]` unifica o que no Nostra Admin é "badges" e no menu-data atual é `tags`.
- Sem tabela `users` separada — Supabase Auth já gerencia.

### Storage

- Bucket `dish-images`, leitura pública, escrita só autenticado.
- Caminhos: `dishes/{dish_id}.{ext}` para fotos principais, `dishes/{dish_id}/variant-{variant_id}.{ext}` para variantes.

### RLS

- `select` público liberado para `active = true`.
- `insert`, `update`, `delete` exigem `auth.uid() is not null`.

## Telas do admin

### Layout global

- Header fixo: **logo Kanpai** (esquerda) · nav: **Cardápio · Cards · Analytics · Ver site →** · email do usuário · **Sair**.
- Inter (mesma fonte do site), paleta Kanpai (azul `#1A0E6E` + bege quente), mais densa/funcional que o site público.
- Mobile: nav colapsa em menu ou select.

### `/admin/login`

Email + senha. Erro inline. Redirect para `/admin` após login.

### `/admin` — Cardápio (default)

Réplica funcional da primeira print do Nostra Admin:

- **Chips de categoria** no topo: `Festival 2/2` `Pizze 16/17`... (formato `ativos/total`). Click filtra a lista. Scroll horizontal no mobile.
- **Header da categoria**: nome grande + `X itens · Y ativos` à esquerda, botão `+ Novo item` à direita.
- **Tabela de pratos**: drag-handle · foto (thumb 48px) · nome+descrição (descrição em cinza, truncada) · preço · toggle ativo · `Editar` · `Excluir` (vermelho).
- Drag-to-reorder persiste em `position`.

### `/admin/dishes/new` e `/admin/dishes/[id]`

Espelha a segunda print, simplificada para PT:

- **Nome** (input) · **Categoria** (select).
- **Descrição** (textarea única, sem abas de idioma).
- **Preço individual** (R$, validação numérica → string formatada no save).
- **Preço família / promocional** (opcional, vira `original_price`).
- **Variantes** (collapsible · "Adicionar variante" → nome, preço, upload foto opcional).
- **Foto do prato** (upload pro Supabase Storage, preview imediato, "Trocar/Remover").
- **Badges** (checkboxes: Vegetariano, Frutos do mar, Contém leite, Contém glúten, Uva, Picante, Com álcool, Sem álcool — lista editável depois).
- **Ordem** (input numérico, com microcopy "também dá pra arrastar").
- **Item ativo no cardápio** (toggle).
- **Subcategoria** (select dos chips da categoria, opcional).

Botões: `Criar item` / `Salvar` · `Cancelar`. Link "Voltar pra lista" no topo.

### `/admin/dishes/[id]/details`

Editor para pratos com `long_description` + seções (Festival Premium):

- Acessado via link "Editar detalhes" na tela do prato.
- Textarea de `long_description` + lista drag-ordenável de seções `{label, description}` com `+ Adicionar seção`.

### `/admin/executivos/[id]`

Tela dedicada para a categoria Executivo:

- Campos base (name, price, format, description, validity).
- **3 listas drag-ordenáveis**: Entradas · Principais · Sobremesas (sobremesas têm campo price).
- Salva em `executivo_menus` + `executivo_items`.

### `/admin/cards`

Réplica da quarta print, adaptada:

- Lista das categorias. Mesma fonte de dados que `/admin`, visão diferente.
- Colunas: drag-handle · **Preview** (chip colorido com gradiente real) · **Nome** + microinfo · **Destino** (`#festival`, `#pizze`) · toggle ativo · `Editar` · `Excluir`.
- Editar abre página com: nome, número, descrição, item_count, detail, gradient, featured, subcategories.
- `+ Nova categoria` cria um card vazio.

> Cardápio e Cards apontam para as **mesmas categorias** no banco — duas visões da mesma entidade.

### `/admin/analytics`

Placeholder "Em breve" + 3 cards desabilitados (Views, Pratos populares, Origem). Estrutura pronta pra fase futura.

### Detalhes transversais

- Toasts (`Salvo`, `Excluído`, erros) via sonner.
- Confirmação modal antes de Excluir.
- Sem auto-save — botão explícito `Salvar` evita escrita acidental.
- Loading states minimais (skeleton da lista, spinner no botão).

## Faseamento

### Fase 0 — Setup

- Reestruturar repo para monorepo (`apps/site/` recebe código atual, criar `apps/admin/`, `packages/db/`).
- Conectar ao Supabase existente.
- **Dump do schema atual** → diff com schema-alvo → migration(s) de gap.

### Fase 1 — Admin MVP

1. Auth + layout shell (header com logo Kanpai + Inter + nav).
2. `/admin` lista de pratos por categoria + toggle ativo + drag-reorder.
3. `/admin/dishes/new` e `/edit` (form completo, sem variantes ainda).
4. Upload pro Supabase Storage.
5. Badges + variantes.
6. `/admin/cards` (gestão de categorias).

### Fase 2 — Estruturas especiais

- Editor de `dish_detail_sections` (Festival).
- Editor de `executivo_menus` + `executivo_items`.

### Fase 3 — Migração do site público

- `apps/site` para de ler `menu-data.ts`, passa a ler Supabase com cache `revalidate: 60`.
- `menu-data.ts` aposentado (mantido commitado como histórico).

### Fase 4 — Analytics (futuro)

- Definir métricas, tabela `events`, dashboard.

## Riscos e decisões adiadas

- **Schema diff:** confirmação completa só depois do acesso ao Supabase. Se o banco existente divergir muito, o schema-alvo pode mudar.
- **Auth users:** criados manualmente pelo painel Supabase, sem tela de cadastro pública.
- **Backup:** PITR de 7 dias do free tier do Supabase é suficiente pro MVP.
- **Migração de dados existentes:** se o banco já tem pratos populados de outro projeto, decidir se reaproveita ou começa do zero a partir do `menu-data.ts`.
