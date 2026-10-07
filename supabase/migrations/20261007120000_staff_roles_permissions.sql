-- ============================================================================
-- SISTEMA DE EQUIPE, CARGOS E PERMISSÕES · Kanpai Blue
-- ----------------------------------------------------------------------------
-- Migration ADITIVA e SEGURA:
--   • não toca em auth.users nem na autenticação existente;
--   • preserva o acesso dos admins atuais (grandfather → cargo 'owner');
--   • tabelas de acesso são travadas: escrita só via service-role (as Server
--     Actions guardadas por requirePermission), nunca direto pelo cliente anon.
--
-- Os demais cargos (manager, menu_manager, kitchen, marketing, relationship,
-- viewer) e suas role_permissions são semeados pelo app a partir de
-- lib/permissions/roles.ts (fonte única de verdade), de forma idempotente.
-- ============================================================================

-- Cargos -------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.roles (
  slug        text PRIMARY KEY,
  name        text NOT NULL,
  description text NOT NULL DEFAULT '',
  is_owner    boolean NOT NULL DEFAULT false,
  is_system   boolean NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- Permissões herdadas por cargo -------------------------------------------
CREATE TABLE IF NOT EXISTS public.role_permissions (
  role_slug      text NOT NULL REFERENCES public.roles(slug) ON DELETE CASCADE,
  permission_key text NOT NULL,
  PRIMARY KEY (role_slug, permission_key)
);

-- Vínculo pessoa ↔ equipe --------------------------------------------------
CREATE TABLE IF NOT EXISTS public.staff_members (
  user_id    uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role_slug  text NOT NULL REFERENCES public.roles(slug),
  status     text NOT NULL DEFAULT 'active' CHECK (status IN ('active','disabled')),
  is_owner   boolean NOT NULL DEFAULT false,
  name       text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  -- quando o acesso foi suspenso (pra invalidar sessões antigas)
  disabled_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_staff_members_role ON public.staff_members (role_slug);

-- Overrides individuais (allow/deny por cima do cargo) ---------------------
CREATE TABLE IF NOT EXISTS public.staff_permission_overrides (
  user_id        uuid NOT NULL REFERENCES public.staff_members(user_id) ON DELETE CASCADE,
  permission_key text NOT NULL,
  effect         text NOT NULL CHECK (effect IN ('allow','deny')),
  created_at     timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, permission_key)
);

-- RLS: leitura por autenticado (o app precisa resolver permissões);
--      ESCRITA sem policy → só o service-role (Server Actions guardadas) grava.
ALTER TABLE public.roles                      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_members              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_permission_overrides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "auth_read_roles" ON public.roles
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_read_role_permissions" ON public.role_permissions
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_read_staff_members" ON public.staff_members
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_read_overrides" ON public.staff_permission_overrides
  FOR SELECT TO authenticated USING (true);
-- (sem policies de INSERT/UPDATE/DELETE: mutação só via service-role)

-- updated_at automático
CREATE OR REPLACE FUNCTION public.staff_touch_updated_at()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS roles_updated_at ON public.roles;
CREATE TRIGGER roles_updated_at BEFORE UPDATE ON public.roles
  FOR EACH ROW EXECUTE FUNCTION public.staff_touch_updated_at();

DROP TRIGGER IF EXISTS staff_members_updated_at ON public.staff_members;
CREATE TRIGGER staff_members_updated_at BEFORE UPDATE ON public.staff_members
  FOR EACH ROW EXECUTE FUNCTION public.staff_touch_updated_at();

-- Cargo owner (necessário pro grandfather). Os demais cargos vêm do app.
INSERT INTO public.roles (slug, name, description, is_owner, is_system)
VALUES ('owner', 'Proprietário', 'Acesso total ao painel. Cargo protegido.', true, true)
ON CONFLICT (slug) DO NOTHING;

-- GRANDFATHER: todo usuário atual vira owner (preserva acesso integral).
INSERT INTO public.staff_members (user_id, role_slug, status, is_owner, name)
SELECT u.id, 'owner', 'active', true, u.email
FROM auth.users u
WHERE NOT EXISTS (SELECT 1 FROM public.staff_members s WHERE s.user_id = u.id);
