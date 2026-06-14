# Panel de administración de proyectos

Panel privado en `/admin` para crear/editar proyectos (info + imágenes), respaldado por
Postgres (Neon) y Vercel Blob. La web pública lee los proyectos publicados desde la base
de datos en la ruta `/project/[slug]`.

## Puesta en marcha (una vez)

### 1. Base de datos — Neon
1. En Vercel: **Project → Storage → Create Database → Neon (Postgres)**.
2. Conéctala al proyecto. Esto añade `DATABASE_URL` a las variables de entorno.

### 2. Almacenamiento de imágenes — Vercel Blob
1. En Vercel: **Project → Storage → Create → Blob**.
2. Conéctalo al proyecto. Añade `BLOB_READ_WRITE_TOKEN`.

### 3. Variables del panel
En **Project → Settings → Environment Variables** añade:
- `ADMIN_PASSWORD` — la contraseña para entrar al panel.
- `SESSION_SECRET` — secreto para firmar la cookie. Genera uno: `openssl rand -base64 32`.

### 4. Desarrollo local
```bash
vercel env pull .env.local   # trae DATABASE_URL y BLOB_READ_WRITE_TOKEN
# añade ADMIN_PASSWORD y SESSION_SECRET a .env.local (ver .env.example)
```

### 5. Crear las tablas
```bash
pnpm db:push     # crea las tablas projects/images en la base de datos
```

### 6. Importar los proyectos actuales (Julia Perfumeries y Smyl)
```bash
pnpm db:seed     # inserta los 2 proyectos existentes (idempotente)
```

## Uso
- Panel: `/admin` (login en `/admin/login` con `ADMIN_PASSWORD`).
- Crear/editar proyecto, subir imágenes arrastrándolas, reordenar, marcar **Publicado**.
- La web pública muestra solo los proyectos publicados.

## Comandos útiles
- `pnpm db:push` — sincroniza el esquema con la base de datos.
- `pnpm db:studio` — explorador visual de la base de datos.
- `pnpm db:seed` — importa los proyectos de ejemplo.

## Notas
- Las imágenes de los 2 proyectos migrados siguen en `public/projects/...`. Las imágenes
  nuevas que subas desde el panel van a Vercel Blob.
- Las páginas hardcodeadas antiguas (`/project/smyl`, `/project/julia-perfumeries`) se
  sustituyen por la ruta dinámica `/project/[slug]` una vez hecho el seed.
