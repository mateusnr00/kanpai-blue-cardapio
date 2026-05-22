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
docs/
  superpowers/specs/  # specs de design
  superpowers/plans/  # planos de implementação
```

## Pré-requisitos

- Node 20+
- pnpm 9+
- Docker Desktop (pra comandos `supabase db dump` / `db push`)
- Supabase CLI (instalada como devDependency: `pnpm exec supabase`)

## Setup

```bash
pnpm install
cp .env.example .env
# preencher .env com credenciais reais do Supabase
```

Pra rodar o site em dev com Supabase:

```bash
cp apps/site/.env.local.example apps/site/.env.local
# preencher com URL + anon key
```

## Comandos

| Comando | O que faz |
|---|---|
| `pnpm site:dev` | sobe o cardápio em localhost:3000 |
| `pnpm site:build` | builda o cardápio |
| `pnpm admin:dev` | sobe o admin (a partir da Fase 1) |
| `pnpm db:types` | regenera `packages/db/src/database.types.ts` a partir do Supabase |
| `pnpm exec supabase db push` | aplica migrations no banco remoto |
| `pnpm exec supabase migration list` | mostra histórico de migrations local x remoto |

## Documentação

- Spec do admin: [`docs/superpowers/specs/2026-05-22-admin-kanpai-design.md`](docs/superpowers/specs/2026-05-22-admin-kanpai-design.md)
- Plano Fase 0 (este setup): [`docs/superpowers/plans/2026-05-22-fase-0-monorepo-setup.md`](docs/superpowers/plans/2026-05-22-fase-0-monorepo-setup.md)
- Diff do schema: [`docs/superpowers/plans/2026-05-22-fase-0-schema-diff.md`](docs/superpowers/plans/2026-05-22-fase-0-schema-diff.md)
- README do cardápio: [`apps/site/README.md`](apps/site/README.md)
