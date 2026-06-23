import { Bricolage_Grotesque } from "next/font/google";

// El admin reutiliza la guía de estilos del Panel de Adhōc (estética "Claude":
// superficies crema, hairline + sombra suave, Bricolage Grotesque, escala
// tipográfica estricta) — pero en neutro, sin el verde de marca. Todo va
// scopeado bajo `.admin-theme` para no afectar al portfolio público, que tiene
// su propia identidad.
const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
  display: "swap",
});

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`admin-theme ${bricolage.variable} flex min-h-screen flex-col bg-background text-foreground`}>
      <div className="flex-1">{children}</div>
      <AdminCredit />
    </div>
  );
}

// Crédito discreto en el pie de todos los paneles de admin.
function AdminCredit() {
  return (
    <footer className="border-t border-border/60 px-6 py-5">
      <div className="mx-auto flex w-full max-w-3xl items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
        <span>Creado por</span>
        <a
          href="https://adhoc.alvarovigil.com"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 font-medium text-foreground/80 transition hover:text-foreground"
        >
          Adhōc
          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M7 17 17 7M9 7h8v8" />
          </svg>
        </a>
      </div>
    </footer>
  );
}
