"use client";

import { useState, useTransition } from "react";
import { Plus, Trash, User as UserIcon } from "@phosphor-icons/react";
import { toast } from "sonner";
import { createUser, deleteUser, type UserRow } from "./actions";

type Props = {
  users: UserRow[];
  currentUserId: string | null;
};

function fmtDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function UsersManager({ users, currentUserId }: Props) {
  const [createOpen, setCreateOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, startTransition] = useTransition();

  function submitCreate() {
    if (!email.trim() || !password) {
      toast.error("Email e senha obrigatórios.");
      return;
    }
    startTransition(async () => {
      const res = await createUser({ email, password });
      if (res.error) {
        toast.error(res.error);
        return;
      }
      toast.success("Usuário criado.");
      setEmail("");
      setPassword("");
      setCreateOpen(false);
    });
  }

  function onDelete(id: string, label: string | null) {
    if (!confirm(`Excluir ${label ?? "este usuário"}? A ação não pode ser desfeita.`)) return;
    startTransition(async () => {
      const res = await deleteUser(id);
      if (res.error) toast.error(res.error);
      else toast.success("Usuário excluído.");
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setCreateOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-md bg-ink px-3 py-2 text-xs font-medium text-white hover:opacity-90"
        >
          <Plus size={12} weight="bold" />
          Novo usuário
        </button>
      </div>

      <ul className="flex flex-col gap-2">
        {users.length === 0 ? (
          <li className="rounded-xl border border-dashed border-ink-ghost bg-bg-muted/40 p-8 text-center text-sm text-ink-muted">
            Nenhum usuário cadastrado.
          </li>
        ) : null}
        {users.map((u) => {
          const isMe = u.id === currentUserId;
          return (
            <li
              key={u.id}
              className="flex items-center gap-3 rounded-xl border border-ink-ghost bg-bg-card px-4 py-3"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-bg-muted text-ink-soft">
                <UserIcon size={16} weight="duotone" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-ink">
                  {u.email ?? <span className="italic">sem email</span>}
                  {isMe ? (
                    <span className="ml-2 rounded-full bg-accent-soft px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-accent">
                      você
                    </span>
                  ) : null}
                </p>
                <p className="truncate text-xs text-ink-muted">
                  Criado em {fmtDate(u.created_at)}
                  {u.last_sign_in_at ? ` · último login ${fmtDate(u.last_sign_in_at)}` : ""}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onDelete(u.id, u.email)}
                disabled={isMe || pending}
                className="rounded-md p-1.5 text-ink-soft hover:bg-rose-50 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-30"
                title={isMe ? "Não é possível excluir você mesmo" : "Excluir"}
                aria-label="Excluir"
              >
                <Trash size={14} />
              </button>
            </li>
          );
        })}
      </ul>

      {createOpen ? (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setCreateOpen(false)}
        >
          <div
            className="flex w-full max-w-md flex-col gap-4 rounded-xl bg-bg-surface p-5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-base font-semibold text-ink">Novo usuário</h2>
            <div className="flex flex-col gap-1.5">
              <label className="admin-label">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="admin-input"
                placeholder="email@exemplo.com"
                autoFocus
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="admin-label">Senha</label>
              <input
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="admin-input font-mono"
                placeholder="mínimo 8 caracteres"
              />
              <p className="text-[11px] text-ink-soft">
                Anote agora — não tem como ver depois. O usuário pode mudar depois.
              </p>
            </div>
            <div className="mt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setCreateOpen(false)}
                className="rounded-md border border-ink-ghost px-3 py-1.5 text-sm hover:border-ink"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={submitCreate}
                disabled={pending}
                className="rounded-md bg-ink px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50"
              >
                {pending ? "Criando..." : "Criar"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
