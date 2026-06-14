import { ProjectEditor } from "../project-editor";

export default function NewProjectPage() {
  return (
    <ProjectEditor
      initial={{
        slug: "",
        name: "",
        description: "",
        chromeCenter: "",
        chromeBottom: "",
        coverUrl: "",
        category: "",
        year: "",
        services: [],
        credits: [],
        published: false,
        images: [],
      }}
    />
  );
}
