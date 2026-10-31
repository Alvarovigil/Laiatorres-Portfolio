"use client";

import type { WorkProject } from "@/app/home-view-2";
import {
  MobileContact,
  MobileFigure,
  MobileFooter,
  MobileNav,
  MobileSection,
  MobileShell,
  label,
  mono,
  sans,
} from "./mobile-chrome";

// Home móvil: una sola columna. Intro, y debajo la lista de proyectos, cada uno
// con UNA imagen (la primera del cluster) y su pie. Se descarta el ritmo
// escalonado a dos columnas del escritorio: en un móvil obligaría a fotos
// diminutas y a un scroll desalineado.
export function MobileHome({
  work,
  intro,
  navigate,
}: {
  work: WorkProject[];
  intro: string;
  navigate: (href: string) => void;
}) {
  return (
    <MobileShell>
      <MobileNav navigate={navigate} />

      <MobileSection style={{ paddingTop: "56px" }}>
        <p style={{ ...sans, fontSize: "17px", lineHeight: 1.38, color: "#000", margin: 0 }}>
          <span style={{ ...mono, fontSize: "10px", color: "#a5a5a5", verticalAlign: "2px", marginRight: "8px" }}>
            (Hola)
          </span>
          {intro}
        </p>
      </MobileSection>

      <MobileSection style={{ marginTop: "64px" }}>
        <p style={label}>◖ Selected Work</p>
      </MobileSection>

      <div style={{ marginTop: "24px" }}>
        {work.map((p, i) => {
          const cover = p.media[0];
          if (!cover) return null;
          // «Próximamente»: se muestra, pero sin enlace ni acción.
          const inner = (
            <>
              <MobileFigure media={{ ...cover, alt: p.name }} eager={i === 0} />
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                  gap: "12px",
                  marginTop: "10px",
                  paddingLeft: "20px",
                  paddingRight: "20px",
                }}
              >
                <span style={{ ...sans, fontSize: "12px", color: "#000", textTransform: "uppercase" }}>{p.name}</span>
                <span style={{ ...label, textAlign: "right" }}>
                  {p.comingSoon ? "Próximamente" : p.homeCaption || [p.category, p.year].filter(Boolean).join(" · ")}
                </span>
              </div>
            </>
          );
          const style = {
            display: "block",
            marginTop: i === 0 ? 0 : "176px",
            textDecoration: "none",
            color: "inherit",
            WebkitTapHighlightColor: "transparent",
          };
          if (p.comingSoon) {
            return (
              <div key={p.slug} style={style}>
                {inner}
              </div>
            );
          }
          return (
            <a
              key={p.slug}
              href={`/project/${p.slug}`}
              onClick={(e) => {
                // Enlace real (accesible y abrible en pestaña nueva), pero el
                // clic normal usa la transición del sitio.
                if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
                e.preventDefault();
                navigate(`/project/${p.slug}`);
              }}
              style={style}
            >
              {inner}
            </a>
          );
        })}
      </div>

      <MobileContact />
      <MobileFooter />
    </MobileShell>
  );
}
