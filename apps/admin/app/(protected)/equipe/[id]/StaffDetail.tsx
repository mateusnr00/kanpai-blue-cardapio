"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CaretDown, Check, Circle, Crown, ShieldCheck } from "@phosphor-icons/react";
import { useConfirm } from "@/components/ConfirmProvider";
import { PERMISSION_MODULES } from "@/lib/permissions/catalog";
import { can, sourceOf, type Membership, type PermissionEffect, type PermissionSource } from "@/lib/permissions/resolve";
import { setStaffOverride, updateStaffRole, setStaffStatus, removeStaff } from "../actions";
import type { StaffDetail as StaffMemberData, RoleOption } from "@/lib/data/staff";

type Perms = { role: boolean; permission: boolean; disable: boolean; remove: boolean };
type OverrideState = "default" | "allow" | "deny";

function sourceLabel(src: PermissionSource, roleName: string): string {
  switch (src) {
    case "override_allow": return "Permissão personalizada";
    case "override_deny": return "Bloqueado para esta pessoa";
    case "role": return `Permitido pelo cargo ${roleName}`;
    case "owner": return "Proprietário — acesso total";
    default: return "Não incluído no cargo";
  }
}

function Segmented({
  value,
  disabled,
  onChange,
}: {
  value: OverrideState;
  disabled: boolean;
  onChange: (v: OverrideState) => void;
}) {
  const opts: { v: OverrideState; label: string }[] = [
    { v: "default", label: "Padrão" },
    { v: "allow", label: "Permitir" },
    { v: "deny", label: "Bloquear" },
  ];
  return (
    <div className="inline-flex shrink-0 overflow-hidden rounded-lg border border-ink-ghost">
      {opts.map((o, i) => {
        const active = value === o.v;
        const tone =
          o.v === "allow" ? "text-success" : o.v === "deny" ? "text-danger" : "text-ink-secondary";
        return (
          <button
            key={o.v}
            type="button"
            disabled={disabled}
            onClick={() => onChange(o.v)}
            className={
              "px-3 py-1.5 text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-50 " +
              (i > 0 ? "border-l border-ink-ghost " : "") +
              (active ? "bg-bg-muted " + tone : "bg-bg-surface text-ink-muted hover:bg-bg-muted/50")
            }
            aria-pressed={active}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

function ModuleBlock({
  module,
  membership,
  roleName,
  canEdit,
  onToggle,
}: {
  module: (typeof PERMISSION_MODULES)[number];
  membership: NonNullable<Membership>;
  roleName: string;
  canEdit: boolean;
  onToggle: (key: string, effect: PermissionEffect | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const granted = module.permissions.filter((p) => can(p.key, membership)).length;
  const total = module.permissions.length;

  return (
    <div className="admin-card overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left transition hover:bg-bg-muted/40"
        aria-expanded={open}
      >
        <div>
          <p className="text-sm font-semibold text-ink">{module.label}</p>
          <p className="mt-0.5 text-xs text-ink-muted">{granted} de {total} permissões</p>
        </div>
        <CaretDown size={16} className={"shrink-0 text-ink-faint transition " + (open ? "rotate-180" : "")} />
      </button>

      {open ? (
        <div className="flex flex-col divide-y divide-ink-ghost/60 border-t border-ink-ghost">
          {module.permissions.map((p) => {
            const resolved = can(p.key, membership);
            const src = sourceOf(p.key, membership);
            const current: OverrideState =
              membership.overrides[p.key] === "allow" ? "allow" : membership.overrides[p.key] === "deny" ? "deny" : "default";
            return (
              <div key={p.key} className="flex flex-col gap-3 px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-start gap-2.5">
                  {resolved ? (
                    <Check size={16} weight="bold" className="mt-0.5 shrink-0 text-success" />
                  ) : (
                    <Circle size={15} className="mt-0.5 shrink-0 text-ink-faint" />
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-ink">
                      {p.label}
                      {p.sensitive ? (
                        <span className="ml-2 rounded-full bg-amber-100 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-amber-700">
                          sensível
                        </span>
                      ) : null}
                    </p>
                    <p className="mt-0.5 text-xs leading-relaxed text-ink-muted">{p.description}</p>
                    <p className="mt-1 text-[11px] text-ink-faint">{sourceLabel(src, roleName)}</p>
                  </div>
                </div>
                <Segmented
                  value={current}
                  disabled={!canEdit}
                  onChange={(v) => onToggle(p.key, v === "default" ? null : v)}
                />
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

export function StaffDetail({
  member,
  roles,
  isSelf,
  perms,
}: {
  member: StaffMemberData;
  roles: RoleOption[];
  isSelf: boolean;
  perms: Perms;
}) {
  const router = useRouter();
  const confirm = useConfirm();
  const [overrides, setOverrides] = useState<Record<string, PermissionEffect>>(member.overrides);
  const [, startTransition] = useTransition();

  // Membership pra EXIBIR a config (sempre "active" aqui; o status real está no header).
  const membership: NonNullable<Membership> = {
    status: "active",
    isOwner: member.isOwner,
    rolePermissions: member.rolePermissions,
    overrides,
  };

  const canEditPerms = perms.permission && !isSelf && !member.isOwner;

  function toggle(key: string, effect: PermissionEffect | null) {
    const prev = overrides;
    const next = { ...overrides };
    if (effect === null) delete next[key];
    else next[key] = effect;
    setOverrides(next);
    startTransition(async () => {
      const res = await setStaffOverride(member.userId, key, effect);
      if (res.error) {
        setOverrides(prev);
        toast.error(res.error);
      } else {
        toast.success("Permissões atualizadas");
      }
    });
  }

  async function changeRole(slug: string) {
    if (slug === member.roleSlug) return;
    const role = roles.find((r) => r.slug === slug);
    const ok = await confirm({
      title: `Alterar cargo para ${role?.name ?? slug}?`,
      description: "As permissões herdadas serão atualizadas. As personalizações individuais existentes serão preservadas.",
      confirmLabel: "Alterar cargo",
    });
    if (!ok) return;
    startTransition(async () => {
      const res = await updateStaffRole(member.userId, slug);
      if (res.error) toast.error(res.error);
      else {
        toast.success("Cargo atualizado");
        router.refresh();
      }
    });
  }

  async function toggleStatus() {
    const disabling = member.status === "active";
    const ok = await confirm({
      title: disabling ? "Desativar acesso?" : "Reativar acesso?",
      description: disabling
        ? "A pessoa não conseguirá mais acessar o painel. É reversível e o histórico é preservado."
        : "A pessoa volta a acessar o painel com as permissões atuais.",
      confirmLabel: disabling ? "Desativar" : "Reativar",
      variant: disabling ? "danger" : undefined,
    });
    if (!ok) return;
    startTransition(async () => {
      const res = await setStaffStatus(member.userId, !disabling);
      if (res.error) toast.error(res.error);
      else {
        toast.success(disabling ? "Acesso desativado" : "Acesso reativado");
        router.refresh();
      }
    });
  }

  async function remove() {
    const ok = await confirm({
      title: "Remover funcionário?",
      description: "Remove o acesso ao painel permanentemente. Esta ação não pode ser desfeita.",
      confirmLabel: "Remover",
      variant: "danger",
    });
    if (!ok) return;
    startTransition(async () => {
      const res = await removeStaff(member.userId);
      if (res.error) toast.error(res.error);
      else {
        toast.success("Funcionário removido");
        router.push("/equipe");
      }
    });
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Cabeçalho */}
      <div className="admin-card p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-semibold tracking-tight text-ink">{member.name || member.email || "Funcionário"}</h1>
              {member.isOwner ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-accent-soft px-2 py-0.5 text-[11px] font-medium text-accent">
                  <Crown size={11} weight="fill" /> Proprietário
                </span>
              ) : null}
            </div>
            {member.email ? <p className="mt-1 truncate text-sm text-ink-muted">{member.email}</p> : null}
            <p className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium" style={{ color: member.status === "active" ? "var(--success)" : "var(--ink-faint)" }}>
              <span className="h-2 w-2 rounded-full" style={{ background: member.status === "active" ? "var(--success)" : "var(--ink-faint)" }} />
              {member.status === "active" ? "Ativo" : "Desativado"}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {perms.disable && !isSelf ? (
              <button type="button" onClick={toggleStatus} className="admin-btn-secondary text-xs">
                {member.status === "active" ? "Desativar acesso" : "Reativar acesso"}
              </button>
            ) : null}
            {perms.remove && !isSelf ? (
              <button type="button" onClick={remove} className="admin-btn-danger">
                Remover
              </button>
            ) : null}
          </div>
        </div>

        {/* Cargo */}
        <div className="mt-5 flex flex-col gap-1.5 border-t border-ink-ghost pt-5">
          <label htmlFor="role" className="admin-label">Cargo</label>
          {perms.role && !isSelf ? (
            <select
              id="role"
              value={member.roleSlug}
              onChange={(e) => changeRole(e.target.value)}
              className="admin-input max-w-xs"
            >
              {roles.map((r) => (
                <option key={r.slug} value={r.slug}>{r.name}</option>
              ))}
            </select>
          ) : (
            <p className="text-sm text-ink">{member.roleName}</p>
          )}
          <p className="text-[11px] text-ink-soft">
            O cargo define as permissões padrão. Personalize individualmente abaixo quando precisar.
          </p>
        </div>
      </div>

      {/* Permissões */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <ShieldCheck size={18} weight="duotone" className="text-ink-muted" />
          <h2 className="text-sm font-semibold uppercase tracking-wider text-ink-muted">Permissões</h2>
        </div>

        {member.isOwner ? (
          <div className="admin-card flex items-center gap-3 p-5">
            <Crown size={20} weight="duotone" className="text-accent" />
            <p className="text-sm text-ink-secondary">
              O proprietário tem <strong className="text-ink">acesso total</strong> e protegido — não é personalizável.
            </p>
          </div>
        ) : (
          <>
            {!canEditPerms ? (
              <p className="text-xs text-ink-muted">
                {isSelf
                  ? "Você não pode alterar as próprias permissões."
                  : "Você não tem permissão para alterar as permissões desta pessoa — visualização apenas."}
              </p>
            ) : null}
            {PERMISSION_MODULES.map((m) => (
              <ModuleBlock
                key={m.slug}
                module={m}
                membership={membership}
                roleName={member.roleName}
                canEdit={canEditPerms}
                onToggle={toggle}
              />
            ))}
          </>
        )}
      </div>
    </div>
  );
}
