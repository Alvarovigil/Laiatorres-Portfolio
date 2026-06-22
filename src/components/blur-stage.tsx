"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

// Envuelve una página y le da una transición de desenfoque:
//  - al entrar: aparece desde blur + fade.
//  - al navegar con `navigate(href)`: hace blur-out + fade y luego cambia de ruta.
// Cuando la transición termina, el filtro pasa a `none` para no romper el
// position:fixed de la navbar (un ancestro con `filter` crea bloque contenedor).
const DURATION_MS = 400;

export function BlurStage({
  children,
}: {
  children: (navigate: (href: string) => void) => React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [blurred, setBlurred] = useState(true); // entra borroso
  const [settled, setSettled] = useState(false); // asentado -> filter:none
  const leaving = useRef(false);

  // Se ejecuta en cada cambio de ruta (no solo al montar): si Next reutiliza la
  // instancia de BlurStage entre páginas del mismo tipo, el estado quedaría en
  // `blurred`/`leaving` y la pantalla se vería en blanco. Reseteamos y volvemos
  // a disparar el fundido de entrada.
  useEffect(() => {
    leaving.current = false;
    setSettled(false);
    setBlurred(true);
    // doble rAF para garantizar que la transición de entrada se dispare
    const r = requestAnimationFrame(() =>
      requestAnimationFrame(() => setBlurred(false))
    );
    return () => cancelAnimationFrame(r);
  }, [pathname]);

  const navigate = (href: string) => {
    if (leaving.current) return;
    leaving.current = true;
    setSettled(false);
    setBlurred(true);
    window.setTimeout(() => router.push(href), DURATION_MS - 60);
  };

  const onTransitionEnd = (e: React.TransitionEvent) => {
    if (e.propertyName === "filter" && !blurred && !leaving.current) {
      setSettled(true);
    }
  };

  const filter = settled ? "none" : blurred ? "blur(20px)" : "blur(0px)";

  return (
    <div
      onTransitionEnd={onTransitionEnd}
      style={{
        filter,
        opacity: blurred ? 0 : 1,
        transition: `filter ${DURATION_MS}ms ease, opacity ${DURATION_MS}ms ease`,
        // `will-change: filter` crea bloque contenedor para position:fixed (rompe la
        // navbar fija). Solo lo activamos durante la transición; al asentar -> auto.
        willChange: settled ? "auto" : "filter, opacity",
      }}
    >
      {/* `navigate` solo lee el ref al invocarse (clic), no durante el render. */}
      {/* eslint-disable-next-line react-hooks/refs */}
      {children(navigate)}
    </div>
  );
}
