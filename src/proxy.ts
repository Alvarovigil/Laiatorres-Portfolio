import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";

// Guard del panel: cualquier ruta bajo /admin (excepto el propio login) exige
// una cookie de sesión válida. La verificación real del token se repite dentro
// de cada server action; aquí solo evitamos pintar el panel a un anónimo.
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/admin/login") return NextResponse.next();

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (await verifySessionToken(token)) return NextResponse.next();

  const url = request.nextUrl.clone();
  url.pathname = "/admin/login";
  url.searchParams.set("from", pathname);
  return NextResponse.redirect(url);
}

export const config = {
  // Solo protegemos /admin/*. Excluimos assets para no bloquear CSS/JS/imágenes.
  matcher: ["/admin/:path*"],
};
