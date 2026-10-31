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
        secondCoverUrl: "",
        category: "",
        year: "",
        homeCaption: "",
        services: [],
        agency: "",
        collabs: [],
        credits: [],
        published: false,
        comingSoon: false,
        images: [],
      }}
    />
  );
}
