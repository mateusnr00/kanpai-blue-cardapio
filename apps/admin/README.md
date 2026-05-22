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

## Próximo

Conteúdo das abas (lista de pratos, form de prato, gestão de cards) na Fase 1B.
