"use client";

import { BlurStage } from "@/components/blur-stage";
import { ProjectTaqta, type Section } from "@/components/project-taqta";
import { MobileProject } from "@/components/mobile/mobile-project";
import { Responsive } from "@/components/mobile/responsive";
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
    <Responsive
      mobile={<BlurStage>{(navigate) => <MobileProject navigate={navigate} {...data} />}</BlurStage>}
      desktop={
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
      }
    />
  );
}
