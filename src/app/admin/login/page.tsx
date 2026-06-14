import { LoginForm } from "./login-form";

export const metadata = { title: "Admin · Acceso" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  const { from } = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="flex flex-col items-center gap-8">
        <div className="text-center">
          <h1 className="text-lg font-semibold text-foreground">Panel de proyectos</h1>
          <p className="mt-1 text-sm text-muted-foreground">Laia Torres — acceso privado</p>
        </div>
        <LoginForm from={from ?? "/admin"} />
      </div>
    </main>
  );
}
