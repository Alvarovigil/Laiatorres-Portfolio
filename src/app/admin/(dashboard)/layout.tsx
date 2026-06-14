import Link from "next/link";
import { logout } from "../auth-actions";

export const metadata = { title: "Admin · Proyectos" };

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-border bg-background/80 px-6 backdrop-blur">
        <Link href="/admin" className="text-sm font-semibold tracking-tight">
          Proyectos · Laia Torres
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/" className="text-muted-foreground hover:text-foreground" target="_blank">
            Ver web ↗
          </Link>
          <form action={logout}>
            <button type="submit" className="text-muted-foreground hover:text-foreground">
              Salir
            </button>
          </form>
        </nav>
      </header>
      <main className="mx-auto w-full max-w-3xl px-6 py-10">{children}</main>
    </div>
  );
}
