import Link from "next/link";
import { Button } from "@/components/ui/button";
import { listProjects } from "@/db/queries";
import { ProjectList } from "./project-list";

export default async function AdminHome() {
  const projects = await listProjects();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Proyectos</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {projects.length} {projects.length === 1 ? "proyecto" : "proyectos"} en el archivo
          </p>
        </div>
        <Button render={<Link href="/admin/new" />}>Nuevo proyecto</Button>
      </div>

      {projects.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border px-6 py-16 text-center">
          <p className="text-sm text-muted-foreground">Aún no hay proyectos.</p>
          <Button className="mt-4" render={<Link href="/admin/new" />}>
            Crear el primero
          </Button>
        </div>
      ) : (
        <ProjectList projects={projects} />
      )}
    </div>
  );
}
