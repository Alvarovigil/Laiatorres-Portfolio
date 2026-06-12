"use client";

// Chrome de "archivo": barras fijas arriba y abajo con texto en las cuatro
// esquinas (+ etiquetas centrales opcionales). mix-blend-difference para leerse
// sobre cualquier fondo. Reutilizable en portada y fichas.
const linkCls = "text-[11px] uppercase tracking-[0.05em] text-white hover:opacity-50 transition-opacity";
const txtCls = "text-[11px] uppercase tracking-[0.05em] text-white";
const subCls = "text-[11px] uppercase tracking-[0.05em] text-white/55";

const NAV = ["Work", "About", "Contact"];
const SOCIAL = ["LinkedIn", "Instagram"];

export function ArchiveChrome({
  topCenter,
  bottomCenter,
  onHome,
}: {
  topCenter?: React.ReactNode;
  bottomCenter?: React.ReactNode;
  onHome?: () => void;
}) {
  return (
    <>
      {/* Barra superior */}
      <div
        className="fixed inset-x-0 top-0 z-50 flex items-start justify-between px-6 py-4"
        style={{ mixBlendMode: "difference" }}
      >
        {/* Esquina sup. izq. */}
        <div className="flex-1 leading-[1.45]">
          <button
            onClick={onHome}
            className={`block cursor-pointer border-none bg-transparent p-0 ${txtCls} hover:opacity-50 transition-opacity`}
          >
            Laia Torres
          </button>
          <span className={`block ${subCls}`}>Art Direction</span>
        </div>

        {/* Centro sup. */}
        <div className="shrink-0 text-center">{topCenter ? <span className={txtCls}>{topCenter}</span> : null}</div>

        {/* Esquina sup. der. */}
        <div className="flex flex-1 justify-end gap-6">
          {NAV.map((l) => (
            <a key={l} href="#" className={linkCls}>
              {l}
            </a>
          ))}
        </div>
      </div>

      {/* Barra inferior */}
      <div
        className="fixed inset-x-0 bottom-0 z-50 flex items-end justify-between px-6 py-4"
        style={{ mixBlendMode: "difference" }}
      >
        {/* Esquina inf. izq. */}
        <div className="flex-1 leading-[1.45]">
          <span className={`block ${txtCls}`}>©Laia Torres 2025</span>
          <span className={`block ${subCls}`}>Barcelona, ES</span>
        </div>

        {/* Centro inf. */}
        <div className="shrink-0 text-center">{bottomCenter ? <span className={subCls}>{bottomCenter}</span> : null}</div>

        {/* Esquina inf. der. */}
        <div className="flex flex-1 flex-col items-end leading-[1.45]">
          {SOCIAL.map((l) => (
            <a key={l} href="#" className={linkCls}>
              {l}
            </a>
          ))}
        </div>
      </div>
    </>
  );
}
