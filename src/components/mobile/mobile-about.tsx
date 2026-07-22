"use client";

import { BlurStage } from "@/components/blur-stage";
import { ClientsMarquee } from "@/app/about/clients-marquee";
import { Hablemos } from "@/app/about/bio-copy";
import { MobileContact, MobileFooter, MobileNav, MobileSection, MobileShell, mono, sans } from "./mobile-chrome";

// About en móvil: foto, bio en una columna y carrusel de clientes. Sin el
// marcador "(About)" colgando en el margen (en móvil no hay margen que lo
// sostenga) — pasa a ser una etiqueta encima del texto.
export function MobileAbout({ bio }: { bio: string[] }) {
  return (
    <BlurStage>
      {(navigate) => (
        <MobileShell>
          <MobileNav navigate={navigate} />

          <MobileSection style={{ paddingTop: "32px" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/profile/laia.jpg"
              alt="Laia Torres"
              style={{ width: "100%", aspectRatio: "4 / 5", objectFit: "cover", display: "block" }}
            />

            <p style={{ ...mono, fontSize: "10px", color: "#a5a5a5", margin: "28px 0 12px" }}>(About)</p>

            {bio.map((p, i) => (
              <p
                key={i}
                style={{ ...sans, fontSize: "18px", lineHeight: 1.32, color: "#000", margin: i === 0 ? 0 : "0.8em 0 0" }}
              >
                {p.includes("hablemos")
                  ? p.split(/(hablemos)/).map((part, j) => (part === "hablemos" ? <Hablemos key={j} /> : part))
                  : p}
              </p>
            ))}
          </MobileSection>

          <div style={{ marginTop: "72px" }}>
            <ClientsMarquee />
          </div>

          <MobileContact />
          <MobileFooter />
        </MobileShell>
      )}
    </BlurStage>
  );
}
