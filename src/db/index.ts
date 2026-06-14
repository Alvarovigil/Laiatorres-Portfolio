import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

// La integración Neon de Vercel expone la URL como DATABASE_URL (y también como
// POSTGRES_URL). Aceptamos cualquiera de las dos para no depender del nombre.
const connectionString = process.env.DATABASE_URL ?? process.env.POSTGRES_URL;

if (!connectionString) {
  throw new Error(
    "Falta DATABASE_URL (o POSTGRES_URL). Conéctala desde la integración Neon de Vercel o tu .env.local.",
  );
}

const sql = neon(connectionString);
export const db = drizzle(sql, { schema });
export { schema };
