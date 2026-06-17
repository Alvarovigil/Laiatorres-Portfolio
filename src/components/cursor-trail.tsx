"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

// Cursor personalizado: un punto azul que sigue al ratón y deja una estela de
// línea (como un bolígrafo) que se desvanece poco a poco. Se desactiva en el
// admin y en dispositivos táctiles.
const BLUE = "#1f51ff";

export function CursorTrail() {
  const pathname = usePathname();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const enabled = !pathname?.startsWith("/admin");

  useEffect(() => {
    if (!enabled) return;
    // Solo con ratón (puntero fino).
    if (typeof window !== "undefined" && !window.matchMedia("(pointer: fine)").matches) return;

    const canvas = canvasRef.current;
    const dot = dotRef.current;
    if (!canvas || !dot) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = 0;
    let h = 0;
    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
    };
    resize();

    // Trazo tipo bolígrafo: curvas suaves (Bézier por puntos medios) y grosor
    // variable. Cada segmento guarda su hora; cada frame se redibuja con:
    //   op = max( cometa,  rallado )
    //  · cometa = exp(-edad/TAU): el azul brillante, decae IGUAL que el fade
    //    de antes (no se alarga).
    //  · rallado = suelo tenue (SCRATCH) que persiste y luego se desvanece del
    //    todo hacia los ~LIFE ms, en vez de quedarse para siempre.
    type Seg = { ax: number; ay: number; cx: number; cy: number; bx: number; by: number; w: number; t: number };
    const segs: Seg[] = [];
    const pts: { x: number; y: number }[] = [];
    let lastT = 0;
    let curW = 2.4;
    const LIFE = 2000; // cada trazo dura 2 s y se desvanece del todo

    const onMove = (e: MouseEvent) => {
      const x = e.clientX;
      const y = e.clientY;
      const t = performance.now();
      dot.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
      dot.style.opacity = "1";

      pts.push({ x, y });
      if (pts.length > 4) pts.shift();
      const n = pts.length;

      if (n >= 2) {
        const p = pts[n - 1];
        const q = pts[n - 2];
        const dist = Math.hypot(p.x - q.x, p.y - q.y);
        const dt = Math.max(t - lastT, 1);
        const speed = dist / dt; // px/ms
        const target = Math.max(0.7, Math.min(4.5, 4.5 - speed * 2.4));
        curW += (target - curW) * 0.35; // suavizado del grosor
      }
      lastT = t;

      if (n >= 3) {
        const p0 = pts[n - 3];
        const p1 = pts[n - 2];
        const p2 = pts[n - 1];
        segs.push({ ax: (p0.x + p1.x) / 2, ay: (p0.y + p1.y) / 2, cx: p1.x, cy: p1.y, bx: (p1.x + p2.x) / 2, by: (p1.y + p2.y) / 2, w: curW, t });
      } else if (n === 2) {
        segs.push({ ax: pts[0].x, ay: pts[0].y, cx: pts[0].x, cy: pts[0].y, bx: pts[1].x, by: pts[1].y, w: curW, t });
      }
      if (segs.length > 2200) segs.shift();
    };
    // Solo al salir de la ventana (no al cruzar elementos), para no romper la línea.
    const onLeave = () => {
      dot.style.opacity = "0";
      pts.length = 0;
    };

    let raf = 0;
    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      const now = performance.now();
      while (segs.length && now - segs[0].t > LIFE) segs.shift();
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = BLUE;
      for (const s of segs) {
        const age = now - s.t;
        const op = Math.max(0, 1 - age / LIFE); // fade lineal a 0 en 2 s
        if (op <= 0.004) continue;
        ctx.globalAlpha = op;
        ctx.lineWidth = s.w;
        ctx.beginPath();
        ctx.moveTo(s.ax, s.ay);
        ctx.quadraticCurveTo(s.cx, s.cy, s.bx, s.by);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    window.addEventListener("mousemove", onMove);
    document.documentElement.addEventListener("mouseleave", onLeave);
    window.addEventListener("resize", resize);
    const prevCursor = document.documentElement.style.cursor;
    document.documentElement.style.cursor = "none";
    const styleEl = document.createElement("style");
    styleEl.textContent = "*{cursor:none !important;}";
    document.head.appendChild(styleEl);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      document.documentElement.removeEventListener("mouseleave", onLeave);
      window.removeEventListener("resize", resize);
      document.documentElement.style.cursor = prevCursor;
      styleEl.remove();
    };
  }, [enabled]);

  if (!enabled) return null;
  return (
    <>
      <canvas ref={canvasRef} style={{ position: "fixed", inset: 0, zIndex: 9998, pointerEvents: "none" }} />
      <div
        ref={dotRef}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "11px",
          height: "11px",
          borderRadius: "50%",
          background: BLUE,
          pointerEvents: "none",
          zIndex: 9999,
          opacity: 0,
          transition: "opacity .2s ease",
        }}
      />
    </>
  );
}
