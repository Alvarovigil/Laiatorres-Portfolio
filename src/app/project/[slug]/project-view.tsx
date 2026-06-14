"use client";

import { BlurStage } from "@/components/blur-stage";
import { ProjectFicha, type Credit } from "@/components/project-ficha";

export type ProjectViewData = {
  index: string;
  name: string;
  description: string;
  chromeCenter: string;
  chromeBottom: string;
  images: string[];
  credits: Credit[][];
  nextHref: string;
  nextLabel: string;
};

export function ProjectView(data: ProjectViewData) {
  return (
    <BlurStage>
      {(navigate) => (
        <ProjectFicha
          navigate={navigate}
          chromeCenter={data.chromeCenter}
          chromeBottom={data.chromeBottom}
          index={data.index}
          name={data.name}
          description={data.description}
          images={data.images}
          credits={data.credits}
          nextHref={data.nextHref}
          nextLabel={data.nextLabel}
        />
      )}
    </BlurStage>
  );
}
