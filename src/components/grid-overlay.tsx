"use client";

import { useEffect, useState } from "react";

// Retícula de 12 columnas de depuración (margen y gutter de 18px, gris al 10%).
// Oculta por defecto; visible añadiendo ?grid a la URL. Debe ir dentro de un
// contenedor position:relative que abarque toda la altura de la página.
// gap: separación entre columnas. lines: en vez de columnas rellenas, dibuja
// solo líneas verticales (para alinear contenido sin separación entre columnas).
export function GridOverlay({ gap = "18px", lines = false }: { gap?: string; lines?: boolean }) {
  const [grid, setGrid] = useState(false);
  useEffect(() => {
    // Sync único con la URL al montar (debug ?grid); seguro para hidratación.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setGrid(new URLSearchParams(window.location.search).has("grid"));
  }, []);

  if (!grid) return null;
  const line = "1px solid rgba(0,0,0,0.14)";
  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        bottom: 0,
        left: "18px",
        right: "18px",
        zIndex: 60,
        pointerEvents: "none",
        display: "grid",
        gridTemplateColumns: "repeat(12, 1fr)",
        columnGap: gap,
        borderLeft: lines ? line : undefined,
      }}
    >
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} style={lines ? { borderRight: line } : { background: "rgba(198,198,198,0.10)" }} />
      ))}
    </div>
  );
}
