# Fase 1A — Admin Shell Autenticado — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Criar `apps/admin` como Next.js 14 standalone no monorepo, com auth via Supabase (email/senha), middleware protegendo rotas `/admin/*`, header com logo Kanpai + nav (Cardápio / Cards / Analytics / Ver site / email / Sair) e três placeholders de página. Resultado final: usuário consegue logar, ver o shell completo, navegar entre abas vazias e sair.

**Architecture:** Next.js 14 App Router, server actions pra signIn/signOut, `@supabase/ssr` pra cliente server+browser tipado via `@kanpai/db`, middleware Next que redireciona não-autenticados pra `/login`. Tailwind config local (cópia do site). Sem multi-idioma. Logo do Kanpai vem da URL pública do Storage que o site já usa.

**Tech Stack:** Next.js 14.2.15, TypeScript 5.6, Tailwind 3.4, `@supabase/ssr` 0.5, `@kanpai/db` (workspace), Inter via `next/font/google`, Vercel-ready.

**Pré-requisito:** Fase 0 mergeada em main. Variáveis `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` disponíveis no `.env` raiz.

---

## Conta de admin

Antes de executar a Task 14 (smoke test do login), uma conta precisa existir no Supabase Auth. **Não automatizamos isso na migration** — o usuário cria manualmente no Dashboard → Authentication → Users → Add user → "Create new user" (com email/senha confirmados). O plano assume que a Task 0 abaixo aconteceu.

---

## File Structure

**Novos:**
```
apps/admin/
├── app/
│   ├── layout.tsx                  # root: Inter, html lang, body
│   ├── globals.css                 # tokens + reset
│   ├── login/page.tsx              # form de login (server action)
│   ├── (protected)/
│   │   ├── layout.tsx              # header + main wrapper
│   │   ├── page.tsx                # /admin (placeholder "Cardápio · em construção")
│   │   ├── cards/page.tsx          # /admin/cards placeholder
│   │   └── analytics/page.tsx      # /admin/analytics "em breve"
│   └── auth/sign-out/route.ts      # POST → signOut → redirect /login
├── components/
│   ├── AdminHeader.tsx             # logo + nav + email + Sair
│   ├── NavLink.tsx                 # client component, active state
│   └── LoginForm.tsx               # client component com useFormState
├── lib/
│   ├── supabase-server.ts          # createServerClient com cookies()
│   ├── supabase-browser.ts         # createBrowserClient
│   └── auth-actions.ts             # signIn (server action)
├── middleware.ts                   # protege /admin, libera /login
├── public/                         # vazio (logo via URL externa)
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── postcss.config.js
├── next.config.js
└── .env.local.example
```

**Modificados:**
- `package.json` (raiz): `admin:dev` e `admin:build` já existem dos scripts da Fase 0 — sem mudança.

---

## Task 0 (manual): Criar conta de admin no Supabase

> **Esta task é executada pelo usuário, não pelo implementer subagent.**

1. Abrir Supabase Dashboard → Authentication → Users.
2. Clicar **Add user** → **Create new user**.
3. Preencher email (ex: `joaopedro89dias@gmail.com`) + senha.
4. Marcar **Auto Confirm User** = true.
5. Clicar Create user.

A conta serve pro smoke test na Task 14.

---

## Task 1: Branch de trabalho

**Files:** nenhum

- [ ] **Step 1: Criar branch**

```bash
git checkout main
git pull --ff-only origin main
git checkout -b feat/admin-shell
```

- [ ] **Step 2: Verificar working tree limpa**

Run: `git status`
Expected: `nothing to commit, working tree clean`

---

## Task 2: Scaffold apps/admin (package.json + configs)

**Files:**
- Create: `apps/admin/package.json`
- Create: `apps/admin/tsconfig.json`
- Create: `apps/admin/next.config.js`
- Create: `apps/admin/postcss.config.js`
- Create: `apps/admin/tailwind.config.ts`
- Create: `apps/admin/.env.local.example`

- [ ] **Step 1: Criar `apps/admin/package.json`**

```json
{
  "name": "@kanpai/admin",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev --port 3001",
    "build": "next build",
    "start": "next start --port 3001",
    "lint": "next lint"
  },
  "dependencies": {
    "@kanpai/db": "workspace:*",
    "@supabase/ssr": "^0.5.1",
    "@supabase/supabase-js": "^2.45.4",
    "next": "14.2.15",
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@types/node": "^20.16.11",
    "@types/react": "^18.3.11",
    "@types/react-dom": "^18.3.0",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.4.47",
    "tailwindcss": "^3.4.14",
    "typescript": "^5.6.3"
  }
}
```

- [ ] **Step 2: Criar `apps/admin/tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 3: Criar `apps/admin/next.config.js`**

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@kanpai/db"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.supabase.co" },
    ],
  },
};

module.exports = nextConfig;
```

- [ ] **Step 4: Criar `apps/admin/postcss.config.js`**

```js
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

- [ ] **Step 5: Criar `apps/admin/tailwind.config.ts`**

```ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "bg-warm":   "#FAFAF8",
        "bg-card":   "#FBFAF6",
        ink:         "#1A0E6E",
        "ink-soft":  "rgba(26, 14, 110, 0.55)",
        "ink-faint": "rgba(26, 14, 110, 0.18)",
        "ink-ghost": "rgba(26, 14, 110, 0.12)",
        "ink-trace": "rgba(26, 14, 110, 0.08)",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
```

- [ ] **Step 6: Criar `apps/admin/.env.local.example`**

```bash
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
```

- [ ] **Step 7: Instalar dependências**

```bash
pnpm install
```
Expected: `apps/admin` listada nos workspaces, deps resolvidas.

- [ ] **Step 8: Commit**

```bash
git add apps/admin pnpm-lock.yaml
git commit -m "feat(admin): scaffold apps/admin (Next 14 + Tailwind + types)"
```

---

## Task 3: globals.css com tokens da marca

**Files:**
- Create: `apps/admin/app/globals.css`

- [ ] **Step 1: Criar arquivo**

Conteúdo de `apps/admin/app/globals.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --bg-warm:   #FAFAF8;
  --bg-card:   #FBFAF6;
  --ink:       #1A0E6E;
  --ink-soft:  rgba(26, 14, 110, 0.55);
  --ink-faint: rgba(26, 14, 110, 0.18);
  --ink-ghost: rgba(26, 14, 110, 0.12);
  --ink-trace: rgba(26, 14, 110, 0.08);
}

html, body {
  margin: 0;
  padding: 0;
  background: var(--bg-warm);
  color: var(--ink);
  font-feature-settings: "ss01", "cv11";
}

* {
  box-sizing: border-box;
}

button {
  font: inherit;
  color: inherit;
  cursor: pointer;
}

input, textarea, select {
  font: inherit;
  color: inherit;
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/admin/app/globals.css
git commit -m "feat(admin): globals.css com tokens da paleta Kanpai"
```

---

## Task 4: Root layout (Inter + html lang)

**Files:**
- Create: `apps/admin/app/layout.tsx`

- [ ] **Step 1: Criar layout**

Conteúdo de `apps/admin/app/layout.tsx`:

```tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Kanpai · Admin",
  description: "Painel de gestão do cardápio Kanpai Blue.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={inter.variable}>
      <body className="font-sans">
        {children}
      </body>
    </html>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/admin/app/layout.tsx
git commit -m "feat(admin): root layout com Inter"
```

---

## Task 5: Clientes Supabase (server + browser)

**Files:**
- Create: `apps/admin/lib/supabase-server.ts`
- Create: `apps/admin/lib/supabase-browser.ts`

- [ ] **Step 1: Criar `supabase-server.ts`**

Conteúdo de `apps/admin/lib/supabase-server.ts`:

```ts
import { cookies } from "next/headers";
import { createServerClient as createSSR, type CookieOptions } from "@supabase/ssr";
import type { Database } from "@kanpai/db";

export function createServerClient() {
  const cookieStore = cookies();
  return createSSR<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
          return cookieStore.get(name)?.value;
        },
        set(name, value, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch {
            // ignora em Server Components puros (sem mutation)
          }
        },
        remove(name, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: "", ...options });
          } catch {
            // idem
          }
        },
      },
    }
  );
}
```

- [ ] **Step 2: Criar `supabase-browser.ts`**

Conteúdo de `apps/admin/lib/supabase-browser.ts`:

```ts
"use client";

import { createBrowserClient as createSSR } from "@supabase/ssr";
import type { Database } from "@kanpai/db";

export function createBrowserClient() {
  return createSSR<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

- [ ] **Step 3: Verificar typecheck**

```bash
pnpm --filter @kanpai/admin exec tsc --noEmit
```
Expected: zero erros.

> Se houver erros tipo "Cannot find module '@kanpai/db'", confirmar que Task 2 (Step 7 install) foi feita.

- [ ] **Step 4: Commit**

```bash
git add apps/admin/lib
git commit -m "feat(admin): clientes Supabase server e browser tipados via @kanpai/db"
```

---

## Task 6: Middleware de proteção de rotas

**Files:**
- Create: `apps/admin/middleware.ts`

- [ ] **Step 1: Criar middleware**

Conteúdo de `apps/admin/middleware.ts`:

```ts
import { NextResponse, type NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request: { headers: request.headers } });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options });
          response = NextResponse.next({ request: { headers: request.headers } });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: "", ...options });
          response = NextResponse.next({ request: { headers: request.headers } });
          response.cookies.set({ name, value: "", ...options });
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isAuthRoute = path === "/login" || path.startsWith("/auth");

  // Não logado tentando entrar em rota protegida → /login
  if (!user && !isAuthRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Já logado batendo em /login → /admin
  if (user && path === "/login") {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
```

- [ ] **Step 2: Typecheck**

```bash
pnpm --filter @kanpai/admin exec tsc --noEmit
```
Expected: zero erros.

- [ ] **Step 3: Commit**

```bash
git add apps/admin/middleware.ts
git commit -m "feat(admin): middleware protege rotas, redireciona login/logout"
```

---

## Task 7: Auth actions (signIn / signOut)

**Files:**
- Create: `apps/admin/lib/auth-actions.ts`
- Create: `apps/admin/app/auth/sign-out/route.ts`

- [ ] **Step 1: Criar `auth-actions.ts`**

Conteúdo de `apps/admin/lib/auth-actions.ts`:

```ts
"use server";

import { redirect } from "next/navigation";
import { createServerClient } from "./supabase-server";

export type SignInState = {
  error?: string;
};

export async function signIn(_prev: SignInState, formData: FormData): Promise<SignInState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Preencha email e senha." };
  }

  const supabase = createServerClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: "Credenciais invalidas." };
  }

  redirect("/");
}
```

- [ ] **Step 2: Criar route handler de signOut**

Conteúdo de `apps/admin/app/auth/sign-out/route.ts`:

```ts
import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";

export async function POST(request: Request) {
  const supabase = createServerClient();
  await supabase.auth.signOut();

  const url = new URL("/login", request.url);
  return NextResponse.redirect(url, { status: 303 });
}
```

- [ ] **Step 3: Typecheck**

```bash
pnpm --filter @kanpai/admin exec tsc --noEmit
```
Expected: zero erros.

- [ ] **Step 4: Commit**

```bash
git add apps/admin/lib/auth-actions.ts apps/admin/app/auth
git commit -m "feat(admin): server action signIn e route POST sign-out"
```

---

## Task 8: Login page + LoginForm

**Files:**
- Create: `apps/admin/components/LoginForm.tsx`
- Create: `apps/admin/app/login/page.tsx`

- [ ] **Step 1: Criar `LoginForm.tsx`** (client component com useFormState)

Conteúdo de `apps/admin/components/LoginForm.tsx`:

```tsx
"use client";

import { useFormState, useFormStatus } from "react-dom";
import { signIn, type SignInState } from "@/lib/auth-actions";

const initialState: SignInState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-md bg-ink py-2.5 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
    >
      {pending ? "Entrando..." : "Entrar"}
    </button>
  );
}

export function LoginForm() {
  const [state, formAction] = useFormState(signIn, initialState);

  return (
    <form action={formAction} className="flex w-full max-w-sm flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-xs font-medium text-ink-soft">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="rounded-md border border-ink-faint bg-bg-card px-3 py-2 text-sm outline-none focus:border-ink"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="text-xs font-medium text-ink-soft">
          Senha
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="rounded-md border border-ink-faint bg-bg-card px-3 py-2 text-sm outline-none focus:border-ink"
        />
      </div>

      {state.error ? (
        <p className="text-xs text-red-700">{state.error}</p>
      ) : null}

      <SubmitButton />
    </form>
  );
}
```

- [ ] **Step 2: Criar página de login**

Conteúdo de `apps/admin/app/login/page.tsx`:

```tsx
import Image from "next/image";
import { LoginForm } from "@/components/LoginForm";

const LOGO_URL =
  "https://rxzohyrttklxevegdijm.supabase.co/storage/v1/object/public/LOGOS/logo%20kanpai%20(1).png";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-12">
      <div className="flex w-full max-w-sm flex-col items-center gap-8">
        <Image
          src={LOGO_URL}
          alt="Kanpai Blue"
          width={140}
          height={140}
          priority
        />
        <h1 className="text-base font-medium tracking-tight">Painel administrativo</h1>
        <LoginForm />
      </div>
    </main>
  );
}
```

- [ ] **Step 3: Typecheck**

```bash
pnpm --filter @kanpai/admin exec tsc --noEmit
```
Expected: zero erros.

- [ ] **Step 4: Commit**

```bash
git add apps/admin/app/login apps/admin/components/LoginForm.tsx
git commit -m "feat(admin): pagina de login com formulario"
```

---

## Task 9: NavLink (client component com active state)

**Files:**
- Create: `apps/admin/components/NavLink.tsx`

- [ ] **Step 1: Criar componente**

Conteúdo de `apps/admin/components/NavLink.tsx`:

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Props = {
  href: string;
  children: React.ReactNode;
  exact?: boolean;
};

export function NavLink({ href, children, exact }: Props) {
  const pathname = usePathname();
  const active = exact ? pathname === href : pathname === href || pathname.startsWith(href + "/");

  return (
    <Link
      href={href}
      className={
        "text-sm transition " +
        (active ? "font-medium text-ink" : "text-ink-soft hover:text-ink")
      }
    >
      {children}
    </Link>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/admin/components/NavLink.tsx
git commit -m "feat(admin): NavLink com estado ativo"
```

---

## Task 10: AdminHeader

**Files:**
- Create: `apps/admin/components/AdminHeader.tsx`

- [ ] **Step 1: Criar header**

Conteúdo de `apps/admin/components/AdminHeader.tsx`:

```tsx
import Image from "next/image";
import { NavLink } from "./NavLink";

const LOGO_URL =
  "https://rxzohyrttklxevegdijm.supabase.co/storage/v1/object/public/LOGOS/logo%20kanpai%20(1).png";

type Props = {
  email: string | null;
};

export function AdminHeader({ email }: Props) {
  return (
    <header className="border-b border-ink-faint bg-bg-warm">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-6 py-4">
        <div className="flex items-center gap-8">
          <a href="/" aria-label="Kanpai Admin" className="block">
            <Image src={LOGO_URL} alt="Kanpai Blue" width={32} height={32} />
          </a>
          <nav className="flex items-center gap-6">
            <NavLink href="/" exact>Cardápio</NavLink>
            <NavLink href="/cards">Cards</NavLink>
            <NavLink href="/analytics">Analytics</NavLink>
            <a
              href="https://kanpai-blue.com"
              target="_blank"
              rel="noreferrer"
              className="text-sm text-ink-soft transition hover:text-ink"
            >
              Ver site →
            </a>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          {email ? (
            <span className="text-xs text-ink-soft">{email}</span>
          ) : null}
          <form action="/auth/sign-out" method="post">
            <button
              type="submit"
              className="text-sm font-medium text-ink transition hover:opacity-80"
            >
              Sair
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
```

> A URL `https://kanpai-blue.com` é placeholder pra "Ver site"; ajustar se a URL real for outra (Vercel domain ou similar). Mantemos placeholder até a Fase 3 ligar tudo.

- [ ] **Step 2: Commit**

```bash
git add apps/admin/components/AdminHeader.tsx
git commit -m "feat(admin): AdminHeader com logo, nav, email e Sair"
```

---

## Task 11: (protected) layout

**Files:**
- Create: `apps/admin/app/(protected)/layout.tsx`

- [ ] **Step 1: Criar layout**

Conteúdo de `apps/admin/app/(protected)/layout.tsx`:

```tsx
import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase-server";
import { AdminHeader } from "@/components/AdminHeader";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen">
      <AdminHeader email={user.email ?? null} />
      <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/admin/app
git commit -m "feat(admin): layout protegido com header e gate de auth"
```

---

## Task 12: Páginas placeholder

**Files:**
- Create: `apps/admin/app/(protected)/page.tsx`
- Create: `apps/admin/app/(protected)/cards/page.tsx`
- Create: `apps/admin/app/(protected)/analytics/page.tsx`

- [ ] **Step 1: Criar `/admin` (Cardápio)**

Conteúdo de `apps/admin/app/(protected)/page.tsx`:

```tsx
export default function CardapioPage() {
  return (
    <section className="flex flex-col gap-2">
      <h1 className="text-2xl font-semibold tracking-tight">Cardápio</h1>
      <p className="text-sm text-ink-soft">
        Pratos por categoria. Conteúdo será preenchido na próxima fase.
      </p>
    </section>
  );
}
```

- [ ] **Step 2: Criar `/cards`**

Conteúdo de `apps/admin/app/(protected)/cards/page.tsx`:

```tsx
export default function CardsPage() {
  return (
    <section className="flex flex-col gap-2">
      <h1 className="text-2xl font-semibold tracking-tight">Cards da home</h1>
      <p className="text-sm text-ink-soft">
        Gestão das categorias exibidas na home. Conteúdo na próxima fase.
      </p>
    </section>
  );
}
```

- [ ] **Step 3: Criar `/analytics`**

Conteúdo de `apps/admin/app/(protected)/analytics/page.tsx`:

```tsx
export default function AnalyticsPage() {
  return (
    <section className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold tracking-tight">Analytics</h1>
      <p className="text-sm text-ink-soft">Em breve.</p>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {["Views", "Pratos populares", "Origem"].map((label) => (
          <div
            key={label}
            className="rounded-md border border-ink-faint bg-bg-card p-6 opacity-50"
          >
            <h2 className="text-sm font-medium">{label}</h2>
            <p className="mt-2 text-xs text-ink-soft">Fase futura.</p>
          </div>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add apps/admin/app
git commit -m "feat(admin): paginas placeholder de Cardapio, Cards e Analytics"
```

---

## Task 13: .env.local + build seco

**Files:**
- Create: `apps/admin/.env.local` (NÃO COMMITADO)

- [ ] **Step 1: Criar `apps/admin/.env.local`**

Copie os valores reais do `.env` da raiz:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://rxzohyrttklxevegdijm.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<o-anon-key-real-do-.env-da-raiz>
```

> Conferir que `.env.local` está coberto pelo `.gitignore` (padrão `.env*.local`).

- [ ] **Step 2: Build seco**

```bash
pnpm --filter @kanpai/admin build
```
Expected: build conclui sem erro. Pode aparecer warning de "Found no entries..." se algum app router endpoint não tiver export — ignorar.

> Se o build falhar com erro de tipo ou de import, parar e reportar. Não tentar contornar com `// @ts-ignore`.

- [ ] **Step 3: Commit (apenas se algo extra foi ajustado pra build passar)**

Se Step 2 passou sem mudanças, pular este step. Se algum tipo precisou ser corrigido, commitar com mensagem `fix(admin): <descricao>`.

---

## Task 14: Smoke test do login (manual + automatizado básico)

**Files:** nenhum (verificação)

> **Pré-requisito:** Task 0 (criar usuário no Supabase) feita.

- [ ] **Step 1: Subir dev server**

```bash
pnpm admin:dev
```
Expected: `▲ Next.js 14.2.15 ... ready in Xs - Local: http://localhost:3001`. Deixar rodando em background ou outro terminal.

- [ ] **Step 2: Verificar redirect não-autenticado**

Abrir `http://localhost:3001/` no navegador.
Expected: redirect imediato para `http://localhost:3001/login`. Página mostra logo Kanpai + formulário email/senha.

- [ ] **Step 3: Login**

Preencher email + senha criados na Task 0. Clicar Entrar.
Expected: redirect para `/`, página "Cardápio · em breve" visível, header completo (logo + nav + email do usuário + Sair).

- [ ] **Step 4: Navegação**

Clicar `Cards` → vai para `/cards`, nav highlight muda.
Clicar `Analytics` → vai para `/analytics`, 3 cards desabilitados aparecem.
Clicar `Cardápio` → volta pra `/`.

- [ ] **Step 5: Logout**

Clicar `Sair`.
Expected: redirect pra `/login`. Tentar acessar `/` direto na URL → redirect de volta pra `/login`.

- [ ] **Step 6: Parar dev server**

Ctrl+C no terminal do dev.

- [ ] **Step 7: Documentar resultado**

Se todos os passos passaram, escrever no PR (ou no relatório do subagent):

```
Smoke test passou:
  [x] Redirect quando nao logado
  [x] Login com credenciais validas
  [x] Header renderiza
  [x] Navegacao entre abas
  [x] Logout limpa sessao
```

Se algum passo falhou, **NÃO seguir pra Task 15** — reportar BLOCKED com detalhes.

---

## Task 15: README do admin

**Files:**
- Create: `apps/admin/README.md`

- [ ] **Step 1: Criar README**

Conteúdo de `apps/admin/README.md`:

````markdown
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
````

- [ ] **Step 2: Commit**

```bash
git add apps/admin/README.md
git commit -m "docs(admin): README com setup e estrutura"
```

---

## Task 16: Push + PR

**Files:** nenhum

- [ ] **Step 1: Push**

```bash
git push -u origin feat/admin-shell
```

- [ ] **Step 2: Confirmar com o usuário antes de abrir PR**

> Pausa. Pergunta se deve abrir PR via `gh pr create` ou esperar.

---

## Critério de pronto (Fase 1A)

A fase está completa quando TODAS as condições abaixo são verdadeiras:

- [ ] `pnpm admin:dev` sobe em `localhost:3001` sem erros.
- [ ] `pnpm admin:build` conclui sem erros.
- [ ] `pnpm --filter @kanpai/admin exec tsc --noEmit` zero erros.
- [ ] Acessar `/` deslogado redireciona pra `/login`.
- [ ] Login com conta criada na Task 0 funciona e redireciona pra `/`.
- [ ] Header mostra logo, 4 itens de nav, email, botão Sair.
- [ ] Clicar nos itens de nav navega corretamente; active-state muda.
- [ ] Sair faz logout e redireciona pra `/login`.
- [ ] Branch `feat/admin-shell` pushed.
- [ ] `pnpm site:build` continua passando (não quebrou nada do site).

---

## Próximos passos (fora desse plano)

Fase 1B (`docs/superpowers/plans/<data>-fase-1b-admin-crud.md`) escrita após o merge desta:
- Lista de pratos por categoria + chips + toggle ativo + drag-reorder
- Form de novo/editar prato com upload pro Storage
- Badges + variantes
- Editor de categorias / cards da home
