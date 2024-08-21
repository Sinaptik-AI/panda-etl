"use client";
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Drawer from "./ui/Drawer";
import SelectableAccordion from "./ui/SelectableAccordion";
import { Button } from "./ui/Button";
import { GetProjects } from "@/services/projects";
import { ProjectData } from "@/interfaces/projects";

interface IProps {
  isOpen: boolean;
  onCancel: () => void;
  onSubmit: (process: ProjectData ) => void;
}

export const ProcessSelectionDrawer = ({
  isOpen,
  onCancel,
  onSubmit,
}: IProps) => {
  const [selectedProject, setSelectedProject] = useState<ProjectData | null>(null);

  const { data: projects, isLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const response = await GetProjects()
      return response?.data?.data
    },
  });

  
  const handleSubmit = () => {
    if (!selectedProject) {
      onCancel()
      return
    }
    onSubmit(selectedProject);
  };

  const handleChipClick = (template: ProjectData) => {
    setSelectedProject(template);
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onCancel}
      title={"Select Project"}
    >

      <div className="flex flex-col h-full">
        <div className="flex-1 overflow-auto">
          <div className="flex flex-col gap-2">
            {
              isLoading && <div>Loading...</div>
            }
            {projects?.map((project: ProjectData) => (
            
              <SelectableAccordion
                key={`project-select-${project.id}`}
                title={project.name}
                isSelected={selectedProject !== null && selectedProject.id === project.id}
                onSelect={() => handleChipClick(project)}
                disabled={project.asset_count === 0}
                disabledWarning="Add Assets first to select project for this template!"
              >
                <div className="space-y-6">
                  {project.description.length===0? "No Project Description": project.description}
                 </div>
              </SelectableAccordion>
            ))}
          </div>
        </div>
        <div className="flex sticky bottom-0 bg-white border-t border-gray-200 p-4 gap-4 justify-center">
        <Button
            onClick={onCancel}
            variant="danger"
            outlined
          >
            Cancel
          </Button>

          <Button
            onClick={handleSubmit}
            disabled={selectedProject == null}
            >
            Select
          </Button>

        </div>
      </div>
    </Drawer>
  );
};
