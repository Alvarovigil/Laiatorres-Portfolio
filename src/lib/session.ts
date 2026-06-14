import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE_SECONDS,
  createSessionToken,
  verifySessionToken,
} from "./auth";

// Helpers de sesión para usar dentro de server actions y route handlers (runtime
// Node). El proxy.ts hace un chequeo más ligero por su cuenta.

export async function startSession(): Promise<void> {
  const token = await createSessionToken();
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export async function endSession(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

export async function isAuthenticated(): Promise<boolean> {
  const store = await cookies();
  return verifySessionToken(store.get(SESSION_COOKIE)?.value);
}

// Llamar al principio de cada mutación/route protegida. Redirige al login si no
// hay sesión válida (defensa en profundidad: el proxy ya filtra, pero las
// server actions son invocables por POST directo).
export async function requireAuth(): Promise<void> {
  if (!(await isAuthenticated())) redirect("/admin/login");
}
