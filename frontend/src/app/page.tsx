"use client";
import React from "react";
import Head from "next/head";
import Folder from "@/components/FolderIconCard";
import { useRouter } from "next/navigation";
import Breadcrumb from "@/components/ui/Breadcrumb";
import Title from "@/components/ui/Title";
import { Button } from "@/components/ui/Button";
import { Loader2, PlusIcon } from "lucide-react";
import { ProjectData } from "@/interfaces/projects";
import { GetProjects } from "@/services/projects";
import { useQuery } from "@tanstack/react-query";

export default function Projects() {
  const router = useRouter();

  const { data: projects, isLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const response = await GetProjects();
      const { data: projects } = response.data;
      return projects as ProjectData[];
    },
  });

  const handleProjectClick = (id: string) => {
    router.push(`/projects/${id}`);
  };

  const newProject = () => {
    router.push("/projects/new");
  };

  if (!isLoading && projects?.length === 0) {
    newProject();
  }

  const breadcrumbItems = [{ label: "Projects", href: "/" }];

  return (
    <>
      <Head>
        <title>BambooETL - Projects</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Breadcrumb items={breadcrumbItems} classNames="mb-8" />

      <div className="flex justify-between items-center mb-8">
        <Title margin={false}>My projects</Title>
        <Button onClick={newProject} icon={PlusIcon}>
          New project
        </Button>
      </div>
      {isLoading && <Loader2 className="w-8 h-8 animate-spin" />}
      {projects && (
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2">
          {projects.map((project) => (
            <Folder
              key={project.id}
              name={project.name}
              onClick={() => handleProjectClick(project.id)}
            />
          ))}
        </div>
      )}
    </>
  );
}
