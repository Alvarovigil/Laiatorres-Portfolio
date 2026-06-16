"use client";

import type { CSSProperties } from "react";

// Navbar del sitio: fija arriba, a ancho completo (tope 2550px), centrada.
// mix-blend-mode: exclusion para leerse sobre cualquier fondo. Compartida entre
// la home y las fichas de proyecto.
const SANS = "var(--font-unica), 'Helvetica Neue', Arial, sans-serif";
const sans: CSSProperties = { fontFamily: SANS, fontWeight: 400, fontStyle: "normal" };
const NAV = ["HOME", "ABOUT ME", "CONTACT"];

const linkBtn: CSSProperties = {
  ...sans,
  color: "#fff",
  whiteSpace: "nowrap",
  background: "transparent",
  border: "none",
  padding: 0,
  cursor: "pointer",
};

export function SiteNav({ navigate }: { navigate: (href: string) => void }) {
  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: "50%",
        transform: "translateX(-50%)",
        width: "100%",
        maxWidth: "2550px",
        zIndex: 50,
        mixBlendMode: "exclusion",
        display: "flex",
        alignItems: "flex-start",
        paddingTop: "24px",
        paddingBottom: "20px",
        paddingLeft: "18px",
        paddingRight: "18px",
      }}
    >
      <button onClick={() => navigate("/")} style={{ ...linkBtn, fontSize: "17.45px", lineHeight: 1.45 }}>
        Laia Torres
      </button>
      <div style={{ marginLeft: "auto", display: "flex", gap: "56px", paddingTop: "1px" }}>
        {NAV.map((item) => (
          <button
            key={item}
            onClick={() => (item === "HOME" ? navigate("/") : undefined)}
            style={{ ...linkBtn, fontSize: "12.235px", lineHeight: 1.45 }}
          >
            {item}
          </button>
        ))}
      </div>
    </nav>
  );
}
