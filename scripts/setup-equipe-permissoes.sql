-- ============================================================================
-- SETUP COMPLETO · Equipe, Cargos e Permissões (Kanpai Blue)
-- Rode TUDO de uma vez no Supabase Studio -> SQL Editor.
-- Seguro: aditivo, preserva os admins atuais (viram 'owner' = acesso total).
-- ============================================================================

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

-- ============================================================================
-- Seed dos cargos (não-owner) + permissões, gerado de lib/permissions/roles.ts
insert into public.roles (slug,name,description,is_owner,is_system) values ('manager','Gerente','Operação ampla: cardápio, categorias, relacionamento e conteúdo. Sem alterar a equipe nem integrações.',false,true)
  on conflict (slug) do update set name=excluded.name, description=excluded.description, is_system=excluded.is_system;
insert into public.roles (slug,name,description,is_owner,is_system) values ('menu_manager','Responsável pelo cardápio','Cuida do cardápio: produtos, categorias, fotos e disponibilidade. Preço é opcional (ajuste individual).',false,true)
  on conflict (slug) do update set name=excluded.name, description=excluded.description, is_system=excluded.is_system;
insert into public.roles (slug,name,description,is_owner,is_system) values ('kitchen','Cozinha','Marca produtos como disponíveis ou indisponíveis durante o serviço. Sem editar preços nem configurações.',false,true)
  on conflict (slug) do update set name=excluded.name, description=excluded.description, is_system=excluded.is_system;
insert into public.roles (slug,name,description,is_owner,is_system) values ('marketing','Marketing','Conteúdo e divulgação: avisos, linktree, QR Codes e base de clientes. Sem mexer no cardápio.',false,true)
  on conflict (slug) do update set name=excluded.name, description=excluded.description, is_system=excluded.is_system;
insert into public.roles (slug,name,description,is_owner,is_system) values ('relationship','Atendimento','Cuida do relacionamento: avaliações e base de clientes. Sem acesso ao cardápio ou configurações.',false,true)
  on conflict (slug) do update set name=excluded.name, description=excluded.description, is_system=excluded.is_system;
insert into public.roles (slug,name,description,is_owner,is_system) values ('viewer','Visualizador','Somente leitura das áreas concedidas. Não modifica nada.',false,true)
  on conflict (slug) do update set name=excluded.name, description=excluded.description, is_system=excluded.is_system;

insert into public.role_permissions (role_slug,permission_key) values ('manager','menu.view') on conflict do nothing;
insert into public.role_permissions (role_slug,permission_key) values ('manager','menu.item.create') on conflict do nothing;
insert into public.role_permissions (role_slug,permission_key) values ('manager','menu.item.update') on conflict do nothing;
insert into public.role_permissions (role_slug,permission_key) values ('manager','menu.item.price.update') on conflict do nothing;
insert into public.role_permissions (role_slug,permission_key) values ('manager','menu.item.image.update') on conflict do nothing;
insert into public.role_permissions (role_slug,permission_key) values ('manager','menu.item.status') on conflict do nothing;
insert into public.role_permissions (role_slug,permission_key) values ('manager','menu.item.reorder') on conflict do nothing;
insert into public.role_permissions (role_slug,permission_key) values ('manager','menu.item.components.update') on conflict do nothing;
insert into public.role_permissions (role_slug,permission_key) values ('manager','menu.item.delete') on conflict do nothing;
insert into public.role_permissions (role_slug,permission_key) values ('manager','menu.category.create') on conflict do nothing;
insert into public.role_permissions (role_slug,permission_key) values ('manager','menu.category.update') on conflict do nothing;
insert into public.role_permissions (role_slug,permission_key) values ('manager','menu.category.reorder') on conflict do nothing;
insert into public.role_permissions (role_slug,permission_key) values ('manager','menu.category.status') on conflict do nothing;
insert into public.role_permissions (role_slug,permission_key) values ('manager','menu.category.delete') on conflict do nothing;
insert into public.role_permissions (role_slug,permission_key) values ('manager','announcement.update') on conflict do nothing;
insert into public.role_permissions (role_slug,permission_key) values ('manager','linktree.update') on conflict do nothing;
insert into public.role_permissions (role_slug,permission_key) values ('manager','qrcode.manage') on conflict do nothing;
insert into public.role_permissions (role_slug,permission_key) values ('manager','reviews.view') on conflict do nothing;
insert into public.role_permissions (role_slug,permission_key) values ('manager','reviews.manage') on conflict do nothing;
insert into public.role_permissions (role_slug,permission_key) values ('manager','customers.view') on conflict do nothing;
insert into public.role_permissions (role_slug,permission_key) values ('manager','customers.export') on conflict do nothing;
insert into public.role_permissions (role_slug,permission_key) values ('manager','analytics.view') on conflict do nothing;
insert into public.role_permissions (role_slug,permission_key) values ('manager','staff.view') on conflict do nothing;
insert into public.role_permissions (role_slug,permission_key) values ('manager','audit.view') on conflict do nothing;
insert into public.role_permissions (role_slug,permission_key) values ('menu_manager','menu.view') on conflict do nothing;
insert into public.role_permissions (role_slug,permission_key) values ('menu_manager','menu.item.create') on conflict do nothing;
insert into public.role_permissions (role_slug,permission_key) values ('menu_manager','menu.item.update') on conflict do nothing;
insert into public.role_permissions (role_slug,permission_key) values ('menu_manager','menu.item.image.update') on conflict do nothing;
insert into public.role_permissions (role_slug,permission_key) values ('menu_manager','menu.item.status') on conflict do nothing;
insert into public.role_permissions (role_slug,permission_key) values ('menu_manager','menu.item.reorder') on conflict do nothing;
insert into public.role_permissions (role_slug,permission_key) values ('menu_manager','menu.item.components.update') on conflict do nothing;
insert into public.role_permissions (role_slug,permission_key) values ('menu_manager','menu.category.create') on conflict do nothing;
insert into public.role_permissions (role_slug,permission_key) values ('menu_manager','menu.category.update') on conflict do nothing;
insert into public.role_permissions (role_slug,permission_key) values ('menu_manager','menu.category.reorder') on conflict do nothing;
insert into public.role_permissions (role_slug,permission_key) values ('menu_manager','menu.category.status') on conflict do nothing;
insert into public.role_permissions (role_slug,permission_key) values ('kitchen','menu.view') on conflict do nothing;
insert into public.role_permissions (role_slug,permission_key) values ('kitchen','menu.item.status') on conflict do nothing;
insert into public.role_permissions (role_slug,permission_key) values ('marketing','announcement.update') on conflict do nothing;
insert into public.role_permissions (role_slug,permission_key) values ('marketing','linktree.update') on conflict do nothing;
insert into public.role_permissions (role_slug,permission_key) values ('marketing','qrcode.manage') on conflict do nothing;
insert into public.role_permissions (role_slug,permission_key) values ('marketing','customers.view') on conflict do nothing;
insert into public.role_permissions (role_slug,permission_key) values ('marketing','customers.export') on conflict do nothing;
insert into public.role_permissions (role_slug,permission_key) values ('marketing','analytics.view') on conflict do nothing;
insert into public.role_permissions (role_slug,permission_key) values ('marketing','reviews.view') on conflict do nothing;
insert into public.role_permissions (role_slug,permission_key) values ('relationship','reviews.view') on conflict do nothing;
insert into public.role_permissions (role_slug,permission_key) values ('relationship','reviews.manage') on conflict do nothing;
insert into public.role_permissions (role_slug,permission_key) values ('relationship','customers.view') on conflict do nothing;
insert into public.role_permissions (role_slug,permission_key) values ('viewer','menu.view') on conflict do nothing;
insert into public.role_permissions (role_slug,permission_key) values ('viewer','reviews.view') on conflict do nothing;
insert into public.role_permissions (role_slug,permission_key) values ('viewer','customers.view') on conflict do nothing;
insert into public.role_permissions (role_slug,permission_key) values ('viewer','analytics.view') on conflict do nothing;
insert into public.role_permissions (role_slug,permission_key) values ('viewer','audit.view') on conflict do nothing;


-- ============================================================================
-- VERIFICAÇÃO (rode depois): ninguém deve ficar sem acesso.
-- ============================================================================
select (select count(*) from public.roles) as cargos,
       (select count(*) from public.role_permissions) as permissoes_de_cargo,
       (select count(*) from public.staff_members) as membros,
       (select count(*) from public.staff_members where is_owner) as owners;
