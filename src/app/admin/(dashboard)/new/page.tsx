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
