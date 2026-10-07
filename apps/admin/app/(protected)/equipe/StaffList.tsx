"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, UsersThree, CaretRight } from "@phosphor-icons/react";
import { inviteStaff } from "./actions";
import type { StaffListItem, RoleOption } from "@/lib/data/staff";

function StatusDot({ status }: { status: "active" | "disabled" }) {
  const active = status === "active";
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium" style={{ color: active ? "var(--success)" : "var(--ink-faint)" }}>
      <span className="h-2 w-2 rounded-full" style={{ background: active ? "var(--success)" : "var(--ink-faint)" }} />
      {active ? "Ativo" : "Desativado"}
    </span>
  );
}

function AccessSummary({ labels }: { labels: string[] }) {
  if (labels.length === 0) return <span className="text-xs text-ink-faint">Sem acessos</span>;
  const shown = labels.slice(0, 3);
  const extra = labels.length - shown.length;
  return (
    <span className="text-xs text-ink-muted">
      {shown.join(" · ")}
      {extra > 0 ? <span className="text-ink-faint"> +{extra}</span> : null}
    </span>
  );
}

function InviteDialog({ roles, onClose }: { roles: RoleOption[]; onClose: () => void }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [roleSlug, setRoleSlug] = useState(roles.find((r) => !r.isOwner)?.slug ?? roles[0]?.slug ?? "");
  const [pending, startTransition] = useTransition();
  const selected = roles.find((r) => r.slug === roleSlug);

  function submit() {
    if (!email.trim() || !password) {
      toast.error("Preencha e-mail e senha.");
      return;
    }
    startTransition(async () => {
      const res = await inviteStaff({ email, password, roleSlug });
      if (res.error) {
        toast.error(res.error);
        return;
      }
      toast.success("Funcionário adicionado");
      router.refresh();
      onClose();
    });
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div className="flex w-full max-w-md flex-col gap-4 rounded-xl bg-bg-surface p-5 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-base font-semibold text-ink">Adicionar funcionário</h2>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="inv-email" className="admin-label">E-mail</label>
          <input id="inv-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="admin-input" placeholder="pessoa@email.com" autoFocus />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="inv-pass" className="admin-label">Senha provisória</label>
          <input id="inv-pass" type="text" value={password} onChange={(e) => setPassword(e.target.value)} className="admin-input" placeholder="ao menos 8 caracteres" />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="inv-role" className="admin-label">Cargo</label>
          <select id="inv-role" value={roleSlug} onChange={(e) => setRoleSlug(e.target.value)} className="admin-input">
            {roles.map((r) => (
              <option key={r.slug} value={r.slug}>{r.name}</option>
            ))}
          </select>
          {selected ? <p className="text-[11px] text-ink-soft">{selected.description}</p> : null}
        </div>

        <div className="mt-2 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="admin-btn-secondary">Cancelar</button>
          <button type="button" onClick={submit} disabled={pending} className="admin-btn-primary">
            {pending ? "Adicionando..." : "Adicionar"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function StaffList({ staff, roles, canInvite }: { staff: StaffListItem[]; roles: RoleOption[]; canInvite: boolean }) {
  const [inviteOpen, setInviteOpen] = useState(false);

  if (staff.length === 0) {
    return (
      <>
        <div className="admin-card flex flex-col items-center gap-4 px-6 py-14 text-center">
          <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-bg-muted text-ink-muted">
            <UsersThree size={26} weight="duotone" />
          </span>
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-ink">Monte sua equipe</h2>
            <p className="mx-auto mt-1 max-w-sm text-sm text-ink-muted">
              Adicione funcionários e controle exatamente o que cada pessoa pode acessar e modificar no Kanpai.
            </p>
          </div>
          {canInvite ? (
            <button type="button" onClick={() => setInviteOpen(true)} className="admin-btn-primary">
              <Plus size={16} weight="bold" /> Adicionar funcionário
            </button>
          ) : null}
        </div>
        {inviteOpen ? <InviteDialog roles={roles} onClose={() => setInviteOpen(false)} /> : null}
      </>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {canInvite ? (
        <div className="flex justify-end">
          <button type="button" onClick={() => setInviteOpen(true)} className="admin-btn-primary">
            <Plus size={16} weight="bold" /> Adicionar funcionário
          </button>
        </div>
      ) : null}

      <ul className="flex flex-col gap-3">
        {staff.map((s) => (
          <li key={s.userId}>
            <Link
              href={`/equipe/${s.userId}`}
              className="flex items-center gap-4 rounded-xl border border-ink-ghost bg-bg-surface p-4 transition hover:border-ink-faint hover:bg-bg-muted/40"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <p className="truncate text-sm font-medium text-ink">{s.name || s.email || "Sem nome"}</p>
                  <span className="rounded-full bg-bg-muted px-2 py-0.5 text-[11px] font-medium text-ink-secondary">{s.roleName}</span>
                  <StatusDot status={s.status} />
                </div>
                <div className="mt-1.5">
                  <AccessSummary labels={s.moduleLabels} />
                </div>
              </div>
              <span className="inline-flex items-center gap-1 text-xs font-medium text-ink-muted">
                Gerenciar <CaretRight size={14} weight="bold" />
              </span>
            </Link>
          </li>
        ))}
      </ul>

      {inviteOpen ? <InviteDialog roles={roles} onClose={() => setInviteOpen(false)} /> : null}
    </div>
  );
}
