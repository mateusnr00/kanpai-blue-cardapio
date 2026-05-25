"use client";

import { useFormState, useFormStatus } from "react-dom";
import { EnvelopeSimple, Lock } from "@phosphor-icons/react";
import { signIn, type SignInState } from "@/lib/auth-actions";

const initialState: SignInState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="admin-btn-primary w-full">
      {pending ? "Entrando..." : "Entrar"}
    </button>
  );
}

export function LoginForm() {
  const [state, formAction] = useFormState(signIn, initialState);

  return (
    <form action={formAction} className="flex w-full flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="admin-label">Email</label>
        <div className="relative">
          <EnvelopeSimple
            size={18}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-faint"
          />
          <input id="email" name="email" type="email" required autoComplete="email" className="admin-input pl-10" />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="admin-label">Senha</label>
        <div className="relative">
          <Lock
            size={18}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-faint"
          />
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className="admin-input pl-10"
          />
        </div>
      </div>

      {state.error ? (
        <p className="rounded-lg bg-danger-soft px-3 py-2 text-xs font-medium text-danger">{state.error}</p>
      ) : null}

      <SubmitButton />
    </form>
  );
}
