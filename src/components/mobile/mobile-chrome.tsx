"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { usePathname } from "next/navigation";
import { UNICA_MONO, UNICA_SANS } from "@/lib/unica";
import { videoEmbed } from "@/lib/video";
import type { VideoMode } from "@/db/schema";

// Piezas compartidas de la experiencia móvil: márgenes, tipografías, navbar,
// medios a ancho completo, bloque de contacto y pie. Todo en una columna y sin
// efectos que en un móvil resulten frágiles (nada de sticky apilado, zigzag,
// mix-blend sobre imágenes ni rejilla de 12 columnas).

export const M = 20; // margen lateral único de toda la experiencia móvil
export const EMAIL = "laiatorres1234@gmail.com";

export const sans: CSSProperties = { fontFamily: UNICA_SANS, fontWeight: 400, fontStyle: "normal" };
export const mono: CSSProperties = { fontFamily: UNICA_MONO, fontWeight: 400, fontStyle: "normal" };
export const label: CSSProperties = {
  ...mono,
  fontSize: "10px",
  letterSpacing: "0.04em",
  color: "#a5a5a5",
  margin: 0,
  textTransform: "uppercase",
};
export const bodyText: CSSProperties = { ...sans, fontSize: "16px", lineHeight: 1.35, color: "#000", margin: 0 };

// Envoltorio de página: fondo blanco, columna y hueco reservado para el nav fijo.
export function MobileShell({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ background: "#fff", minHeight: "100vh", display: "flex", flexDirection: "column", overflowX: "hidden" }}>
      {children}
    </div>
  );
}

export function MobileSection({ children, style }: { children: React.ReactNode; style?: CSSProperties }) {
  return <div style={{ paddingLeft: `${M}px`, paddingRight: `${M}px`, ...style }}>{children}</div>;
}

// ── Navbar ──────────────────────────────────────────────────────────────────
// Fija arriba, sobre una banda blanca sólida: en móvil el contenido pasa por
// debajo constantemente y el mix-blend-mode del escritorio haría ilegible el
// texto. Solo dos destinos, así que no hace falta menú desplegable.
const NAV = [
  { label: "PROYECTOS", href: "/" },
  { label: "ABOUT", href: "/about" },
];

export const NAV_HEIGHT = 52;

export function MobileNav({ navigate }: { navigate: (href: string) => void }) {
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === "/about" ? pathname.startsWith("/about") : !pathname.startsWith("/about");

  const btn: CSSProperties = {
    ...sans,
    fontSize: "11px",
    letterSpacing: "0.02em",
    color: "#000",
    background: "transparent",
    border: "none",
    padding: "6px 0",
    cursor: "pointer",
    WebkitTapHighlightColor: "transparent",
  };

  return (
    <>
      <header
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          height: `${NAV_HEIGHT}px`,
          background: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingLeft: `${M}px`,
          paddingRight: `${M}px`,
        }}
      >
        <button onClick={() => navigate("/")} style={btn}>
          LAIA TORRES
        </button>
        <nav style={{ display: "flex", gap: "20px" }}>
          {NAV.map((item) => (
            <button
              key={item.label}
              onClick={() => navigate(item.href)}
              style={{ ...btn, opacity: isActive(item.href) ? 1 : 0.4 }}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </header>
      {/* Reserva el hueco del nav fijo */}
      <div style={{ height: `${NAV_HEIGHT}px`, flexShrink: 0 }} />
    </>
  );
}

// ── Medios ──────────────────────────────────────────────────────────────────
export type MobileMedia = { url: string; kind: "image" | "video"; videoMode: VideoMode; alt?: string };

// Imagen o vídeo a ancho completo y alto natural. Las imágenes van con
// `loading="lazy"` para no castigar la conexión móvil.
export function MobileFigure({ media, eager = false }: { media: MobileMedia; eager?: boolean }) {
  if (media.kind === "video") {
    const embed = videoEmbed(media.url, media.videoMode);
    if (embed.type === "file") {
      if (embed.ambient) return <AmbientVideo src={embed.src} />;
      return (
        <video
          src={embed.src}
          style={{ width: "100%", height: "auto", display: "block", border: 0 }}
          playsInline
          preload="metadata"
          controls
        />
      );
    }
    return (
      <iframe
        src={embed.src}
        title={media.alt || "Vídeo"}
        loading="lazy"
        style={{ width: "100%", aspectRatio: "16 / 9", display: "block", border: 0 }}
        allow="autoplay; fullscreen; picture-in-picture"
        allowFullScreen
      />
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={media.url}
      alt={media.alt ?? ""}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      style={{ width: "100%", height: "auto", display: "block" }}
    />
  );
}

// Vídeo de ambiente (autoplay silencioso en bucle) endurecido para móvil:
//
//  · `muted` se fuerza por propiedad además de por atributo: React no siempre
//    emite el atributo en el HTML del servidor, e iOS Safari se niega a hacer
//    autoplay si no lo ve → el vídeo se quedaba en negro.
//  · Solo se pide reproducir cuando el vídeo entra en pantalla, así no compiten
//    varias descargas a la vez por el ancho de banda del móvil.
//  · Si el navegador rechaza el autoplay (Modo de Bajo Consumo, Ahorro de
//    Datos), en lugar de dejar un hueco negro se muestran los controles para
//    que se pueda reproducir a mano.
function AmbientVideo({ src }: { src: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [needsTap, setNeedsTap] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.muted = true; // imprescindible para el autoplay en iOS
    el.defaultMuted = true;

    const tryPlay = () => {
      el.play().then(
        () => setNeedsTap(false),
        () => setNeedsTap(true), // autoplay denegado → controles manuales
      );
    };

    const io = new IntersectionObserver(
      ([entry]) => (entry.isIntersecting ? tryPlay() : el.pause()),
      { rootMargin: "200px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <video
      ref={ref}
      src={src}
      style={{ width: "100%", height: "auto", display: "block", border: 0, background: "#f2f2f2" }}
      playsInline
      muted
      loop
      preload="metadata"
      controls={needsTap}
    />
  );
}

// ── Contacto + pie ──────────────────────────────────────────────────────────
export function MobileContact() {
  return (
    <MobileSection style={{ marginTop: "72px" }}>
      <p style={{ ...label, marginBottom: "10px" }}>Contacto</p>
      <p style={{ ...sans, fontSize: "18px", lineHeight: 1.25, color: "#000", margin: 0 }}>
        Si quieres ver más proyectos,{" "}
        <a href={`mailto:${EMAIL}`} style={{ color: "inherit", textDecoration: "underline" }}>
          contacta conmigo
        </a>
        .
      </p>
    </MobileSection>
  );
}

const SOCIAL = [
  { label: "Linkedin", href: "https://www.linkedin.com/in/laiatorresr/" },
  { label: "Instagram", href: "https://www.instagram.com/laiatowers22/" },
];

export function MobileFooter() {
  return (
    <MobileSection style={{ marginTop: "72px", paddingBottom: "40px" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        {SOCIAL.map((s) => (
          <a
            key={s.label}
            href={s.href}
            target="_blank"
            rel="noreferrer"
            style={{ ...sans, fontSize: "13px", lineHeight: 1.3, color: "#000", textDecoration: "underline" }}
          >
            {s.label}
          </a>
        ))}
      </div>
      <p style={{ ...sans, fontSize: "13px", lineHeight: 1.3, color: "#000", opacity: 0.5, margin: "20px 0 0" }}>
        © 2026
      </p>
    </MobileSection>
  );
}
