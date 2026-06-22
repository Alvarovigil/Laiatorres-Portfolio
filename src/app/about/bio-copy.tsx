"use client";

import { useState } from "react";
import { UNICA_MONO } from "@/lib/unica";

const EMAIL = "laiatorres1234@gmail.com";

// "hablemos" como acción: al hacer clic copia el email al portapapeles y muestra
// un aviso efímero de "¡Copiado!".
export function Hablemos() {
  const [copied, setCopied] = useState(false);

  const onClick = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard no disponible */
    }
  };

  return (
    <u
      onClick={onClick}
      style={{ cursor: "pointer", whiteSpace: "nowrap", position: "relative" }}
      title={`Copiar ${EMAIL}`}
    >
      hablemos
      {copied && (
        <span
          style={{
            fontFamily: UNICA_MONO,
            position: "absolute",
            bottom: "calc(100% + 8px)",
            left: "50%",
            transform: "translateX(-50%)",
            textDecoration: "none",
            whiteSpace: "nowrap",
            fontSize: "0.42em",
            letterSpacing: "0.02em",
            background: "#d8dadc",
            color: "#1f51ff",
            padding: "3px 7px",
            pointerEvents: "none",
          }}
        >
          (mail copiado)
        </span>
      )}
    </u>
  );
}
