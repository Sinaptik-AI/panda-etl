"use client";
import React, { useEffect, useState } from "react";
import Head from "next/head";
import Folder from "@/components/FolderIconCard";
import { useRouter } from "next/navigation";
import Breadcrumb from "@/components/ui/Breadcrumb";
import Title from "@/components/ui/Title";
import { Button } from "@/components/ui/Button";
import { PlusIcon } from "lucide-react";

interface ProjectData {
  name: string;
  id: string;
}

export default function Projects() {
  const router = useRouter();
  const [projects, _] = useState<ProjectData[]>([
    { name: "Project 1", id: "1" },
    { name: "Project 2", id: "2" },
    { name: "Project 3", id: "3" },
  ]);

  const handleProjectClick = (id: string) => {
    router.push(`/projects/${id}`);
  };

  const newProject = () => {
    router.push("/projects/new");
  };

  const breadcrumbItems = [{ label: "Projects", href: "/" }];

  useEffect(() => {
    if (projects.length === 0) {
      newProject();
    }
  }, []);

  return (
    <>
      <Head>
        <title>BambooETL - Projects</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Breadcrumb items={breadcrumbItems} classNames="mb-8" />

      <div className="flex justify-between items-start mb-8">
        <Title>My projects</Title>
        <Button onClick={newProject} icon={PlusIcon}>
          New project
        </Button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
        {projects.map((project) => (
          <Folder
            key={project.id}
            name={project.name}
            onClick={() => handleProjectClick(project.id)}
          />
        ))}
      </div>
    </>
  );
}
