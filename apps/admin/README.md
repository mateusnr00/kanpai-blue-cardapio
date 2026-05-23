# Kanpai · Admin

Painel administrativo do cardápio Kanpai Blue. Roda em `localhost:3001` (separado do site público em 3000).

## Pré-requisitos

- Monorepo configurado (ver [`../../README.md`](../../README.md))
- `.env.local` com `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Conta de admin criada no Supabase Dashboard (Authentication → Users)

## Comandos

| Comando | O que faz |
|---|---|
| `pnpm admin:dev` | sobe em http://localhost:3001 |
| `pnpm admin:build` | builda pra produção |
| `pnpm --filter @kanpai/admin exec tsc --noEmit` | typecheck |

## Estrutura

```
app/
  layout.tsx                  # root: Inter, tokens
  login/page.tsx              # /login
  (protected)/                # group protegido por auth
    layout.tsx                # header + main wrapper
    page.tsx                  # /admin (Cardápio)
    cards/page.tsx            # /admin/cards
    analytics/page.tsx        # /admin/analytics
  auth/sign-out/route.ts      # POST /auth/sign-out
components/
  AdminHeader.tsx
  LoginForm.tsx
  NavLink.tsx
lib/
  supabase-server.ts          # cliente server-side (cookies)
  supabase-browser.ts         # cliente browser-side
  auth-actions.ts             # signIn server action
middleware.ts                 # redireciona /admin/* sem sessão
```

## Auth

- Email/senha via Supabase Auth.
- Contas criadas manualmente no Dashboard (sem signup público).
- Middleware redireciona não-logado de `/admin/*` pra `/login`.
- Layout `(protected)` faz double-check com `supabase.auth.getUser()`.

## Funcionalidades

- **`/admin` (Cardápio)**: chips de categoria com contagem `ativos/total`, tabela de pratos com foto, toggle ativo, drag-reorder, edição e exclusão.
- **`/admin/dishes/new`**: criar prato (nome, categoria, descrição, preço, foto, badges, variantes).
- **`/admin/dishes/[id]`**: editar prato com mesmo form.
- **Upload de fotos**: pro bucket `dish-images` no Storage, com preview e remoção.
- **Variantes**: nome + preço por variante, adicionar/remover inline.
- **Badges**: 9 opções (Vegetariano, Frutos do mar, Contém leite/glúten, Uva, Picante, Com/Sem álcool, Não compartilhável).

## Próximo

Fase 1C: gestão de categorias (página Cards).
