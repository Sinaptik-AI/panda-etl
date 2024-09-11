"use client";
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Drawer from "./ui/Drawer";
import SelectableAccordion from "./ui/SelectableAccordion";
import { Button } from "./ui/Button";
import { GetProjects } from "@/services/projects";
import { ProjectData } from "@/interfaces/projects";

interface ProcessSelectionDrawerProps {
  isOpen: boolean;
  onCancel: () => void;
  onSubmit: (project: ProjectData) => void;
}

export const ProcessSelectionDrawer: React.FC<ProcessSelectionDrawerProps> = ({
  isOpen,
  onCancel,
  onSubmit,
}) => {
  const [selectedProject, setSelectedProject] = useState<ProjectData | null>(
    null,
  );

  const { data: projects, isLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const response = await GetProjects();
      return response?.data?.data;
    },
  });

  const handleSubmit = () => {
    if (selectedProject) {
      onSubmit(selectedProject);
    } else {
      onCancel();
    }
  };

  const handleProjectSelect = (project: ProjectData) => {
    setSelectedProject(project);
  };

  return (
    <Drawer isOpen={isOpen} onClose={onCancel} title="Select project">
      <div className="flex flex-col h-full">
        <div className="flex-1 overflow-auto">
          <div className="flex flex-col gap-2">
            {isLoading && <div>Loading...</div>}
            {projects?.map((project: ProjectData) => (
              <SelectableAccordion
                key={`project-select-${project.id}`}
                title={project.name}
                isSelected={selectedProject?.id === project.id}
                onSelect={() => handleProjectSelect(project)}
                disabled={project.asset_count === 0}
                disabledWarning="Add assets first to select project for this template!"
              >
                <div className="space-y-6">
                  {project.description || "No project description"}
                </div>
              </SelectableAccordion>
            ))}
          </div>
        </div>
        <div className="flex sticky bottom-0 bg-white gap-4 justify-end mt-4">
          <Button onClick={onCancel} variant="light">
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!selectedProject}>
            Select
          </Button>
        </div>
      </div>
    </Drawer>
  );
};
