// Convierte un nombre en slug url-safe: "Día de la Madre 2025" -> "dia-de-la-madre-2025".
export function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // quita acentos (combining marks)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}
