import { redirect } from "next/navigation";

// Contacto unificado dentro de /about. Mantenemos la ruta por compatibilidad.
export default function ContactPage() {
  redirect("/about");
}
