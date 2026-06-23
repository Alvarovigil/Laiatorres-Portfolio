import { LoginForm } from "./login-form";

export const metadata = { title: "Admin · Acceso" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  const { from } = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="ad-card flex w-full max-w-sm flex-col items-center gap-7 p-8">
        <div className="text-center">
          <p className="ad-eyebrow mb-2">Acceso privado</p>
          <h1 className="ad-display text-[24px]">Panel de proyectos</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">Laia Torres</p>
        </div>
        <LoginForm from={from ?? "/admin"} />
      </div>
    </main>
  );
}
