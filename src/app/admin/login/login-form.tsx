"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { login, type LoginState } from "../auth-actions";

export function LoginForm({ from }: { from: string }) {
  const [state, action, pending] = useActionState<LoginState, FormData>(login, {});

  return (
    <form action={action} className="flex w-full max-w-xs flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="text-sm font-medium text-foreground">
          Contraseña
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoFocus
          autoComplete="current-password"
          className="h-9 rounded-lg border border-border bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        />
        <input type="hidden" name="from" value={from} />
      </div>

      {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}

      <Button type="submit" size="lg" disabled={pending}>
        {pending ? "Entrando…" : "Entrar"}
      </Button>
    </form>
  );
}
