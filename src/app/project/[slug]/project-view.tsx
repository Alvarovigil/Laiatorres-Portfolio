"use client";

import { BlurStage } from "@/components/blur-stage";
import { ProjectTaqta, type Credit, type Section } from "@/components/project-taqta";

export type ProjectViewData = {
  index: string;
  name: string;
  category: string;
  year: string;
  about: string[];
  services: string[];
  credits: Credit[];
  sections: Section[];
  nextHref: string;
  nextLabel: string;
};

export function ProjectView(data: ProjectViewData) {
  return (
    <BlurStage>
      {(navigate) => (
        <ProjectTaqta
          navigate={navigate}
          name={data.name}
          index={data.index}
          category={data.category}
          year={data.year}
          about={data.about}
          services={data.services}
          credits={data.credits}
          sections={data.sections}
          nextHref={data.nextHref}
          nextLabel={data.nextLabel}
        />
      )}
    </BlurStage>
  );
}
