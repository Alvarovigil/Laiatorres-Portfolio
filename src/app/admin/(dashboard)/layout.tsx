import Link from "next/link";
import { logout } from "../auth-actions";

export const metadata = { title: "Admin · Proyectos" };

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-border bg-background/75 px-6 backdrop-blur">
        <Link href="/admin" className="ad-display text-[15px]">
          Proyectos <span className="text-muted-foreground">· Laia Torres</span>
        </Link>
        <nav className="flex items-center gap-5 text-[13px]">
          <Link href="/" className="text-muted-foreground transition hover:text-foreground" target="_blank">
            Ver web ↗
          </Link>
          <form action={logout}>
            <button type="submit" className="text-muted-foreground transition hover:text-foreground">
              Salir
            </button>
          </form>
        </nav>
      </header>
      <main className="mx-auto w-full max-w-3xl px-6 py-12">{children}</main>
    </div>
  );
}
