"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { login, type LoginState } from "../auth-actions";

export function LoginForm({ from }: { from: string }) {
  const [state, action, pending] = useActionState<LoginState, FormData>(login, {});

  return (
    <form action={action} className="flex w-full flex-col gap-4">
      <div className="flex flex-col gap-2">
        <label htmlFor="password" className="ad-eyebrow">
          Contraseña
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoFocus
          autoComplete="current-password"
          className="h-10 rounded-[10px] border border-border bg-card px-3.5 text-[14px] text-foreground outline-none transition focus-visible:border-foreground/30 focus-visible:ring-2 focus-visible:ring-foreground/10"
        />
        <input type="hidden" name="from" value={from} />
      </div>

      {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}

      <Button type="submit" size="lg" disabled={pending} className="w-full">
        {pending ? "Entrando…" : "Entrar"}
      </Button>
    </form>
  );
}
