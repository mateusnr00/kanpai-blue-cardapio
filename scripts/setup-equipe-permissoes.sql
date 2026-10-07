-- ============================================================================
-- SETUP · Equipe, Cargos e Permissões (Kanpai Blue) — IDEMPOTENTE
-- Selecione TUDO e rode no Supabase Studio -> SQL Editor. Pode rodar de novo
-- sem erro. Aditivo e seguro: preserva os admins atuais (viram 'owner').
-- ============================================================================

create table if not exists public.roles (
  slug text primary key, name text not null, description text not null default '',
  is_owner boolean not null default false, is_system boolean not null default false,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.role_permissions (
  role_slug text not null references public.roles(slug) on delete cascade,
  permission_key text not null, primary key (role_slug, permission_key)
);
create table if not exists public.staff_members (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role_slug text not null references public.roles(slug),
  status text not null default 'active' check (status in ('active','disabled')),
  is_owner boolean not null default false, name text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  disabled_at timestamptz
);
create index if not exists idx_staff_members_role on public.staff_members (role_slug);
create table if not exists public.staff_permission_overrides (
  user_id uuid not null references public.staff_members(user_id) on delete cascade,
  permission_key text not null, effect text not null check (effect in ('allow','deny')),
  created_at timestamptz not null default now(), primary key (user_id, permission_key)
);

alter table public.roles                      enable row level security;
alter table public.role_permissions           enable row level security;
alter table public.staff_members              enable row level security;
alter table public.staff_permission_overrides enable row level security;

drop policy if exists "auth_read_roles" on public.roles;
create policy "auth_read_roles" on public.roles for select to authenticated using (true);
drop policy if exists "auth_read_role_permissions" on public.role_permissions;
create policy "auth_read_role_permissions" on public.role_permissions for select to authenticated using (true);
drop policy if exists "auth_read_staff_members" on public.staff_members;
create policy "auth_read_staff_members" on public.staff_members for select to authenticated using (true);
drop policy if exists "auth_read_overrides" on public.staff_permission_overrides;
create policy "auth_read_overrides" on public.staff_permission_overrides for select to authenticated using (true);

create or replace function public.staff_touch_updated_at()
returns trigger as $$ begin new.updated_at = now(); return new; end; $$ language plpgsql;
drop trigger if exists roles_updated_at on public.roles;
create trigger roles_updated_at before update on public.roles for each row execute function public.staff_touch_updated_at();
drop trigger if exists staff_members_updated_at on public.staff_members;
create trigger staff_members_updated_at before update on public.staff_members for each row execute function public.staff_touch_updated_at();

-- Cargo owner + grandfather (todo admin atual vira owner = acesso total)
insert into public.roles (slug, name, description, is_owner, is_system)
values ('owner','Proprietário','Acesso total ao painel. Cargo protegido.',true,true)
on conflict (slug) do update set name=excluded.name, description=excluded.description, is_owner=true, is_system=true;

insert into public.staff_members (user_id, role_slug, status, is_owner, name)
select u.id, 'owner', 'active', true, u.email from auth.users u
where not exists (select 1 from public.staff_members s where s.user_id = u.id);

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
-- VERIFICAÇÃO: owners deve ser = nº de admins que você já tinha.
-- ============================================================================
select (select count(*) from public.roles) as cargos,
       (select count(*) from public.role_permissions) as permissoes_de_cargo,
       (select count(*) from public.staff_members) as membros,
       (select count(*) from public.staff_members where is_owner) as owners;
