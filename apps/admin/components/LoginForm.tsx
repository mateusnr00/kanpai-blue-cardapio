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
