"use client";

import { useEffect, useState, type ReactNode } from "react";

// Puerta responsive del sitio: decide qué experiencia se monta, la de
// escritorio o la de móvil (dos árboles distintos, no una adaptación por CSS).
//
// Cómo evita parpadeos y dobles descargas:
//  1. En SSR y en el primer pintado no sabemos el ancho, así que se renderizan
//     los dos envueltos en `.solo-movil` / `.solo-escritorio`, que se ocultan
//     por media query (globals.css). El primer pintado ya es correcto.
//  2. Al hidratar, matchMedia resuelve el ancho y desmontamos la rama que no
//     toca, de modo que sus imágenes/vídeos dejan de existir.
// Los envoltorios no se quitan nunca, así la rama que sobrevive no se remonta.
export const MOBILE_QUERY = "(max-width: 820px)";

export function Responsive({ mobile, desktop }: { mobile: ReactNode; desktop: ReactNode }) {
  // null = todavía no lo sabemos (SSR / primer pintado).
  const [isMobile, setIsMobile] = useState<boolean | null>(null);

  useEffect(() => {
    const mq = window.matchMedia(MOBILE_QUERY);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    const sync = () => setIsMobile(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  return (
    <>
      <div className="solo-movil">{isMobile !== false ? mobile : null}</div>
      <div className="solo-escritorio">{isMobile !== true ? desktop : null}</div>
    </>
  );
}
