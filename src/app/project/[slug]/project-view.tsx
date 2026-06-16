"use client";

import { BlurStage } from "@/components/blur-stage";
import { ProjectTaqta, type Section } from "@/components/project-taqta";
import type { Collab } from "@/db/schema";

export type ProjectViewData = {
  name: string;
  about: string[];
  services: string[];
  agency: string;
  collabs: Collab[];
  sections: Section[];
  nextHref: string;
};

export function ProjectView(data: ProjectViewData) {
  return (
    <BlurStage>
      {(navigate) => (
        <ProjectTaqta
          navigate={navigate}
          name={data.name}
          about={data.about}
          services={data.services}
          agency={data.agency}
          collabs={data.collabs}
          sections={data.sections}
          nextHref={data.nextHref}
        />
      )}
    </BlurStage>
  );
}
