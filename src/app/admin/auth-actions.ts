"use server";

import { redirect } from "next/navigation";
import { checkPassword } from "@/lib/auth";
import { startSession, endSession } from "@/lib/session";

export type LoginState = { error?: string };

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const password = String(formData.get("password") ?? "");
  const from = String(formData.get("from") ?? "/admin");

  if (!checkPassword(password)) {
    return { error: "Contraseña incorrecta." };
  }

  await startSession();
  // Solo redirigimos a rutas internas para evitar open-redirect.
  redirect(from.startsWith("/admin") ? from : "/admin");
}

export async function logout(): Promise<void> {
  await endSession();
  redirect("/admin/login");
}
