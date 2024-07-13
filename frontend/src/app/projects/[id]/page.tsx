"use client";
import React, { useState } from "react";
import Head from "next/head";
import { useParams, useRouter } from "next/navigation";
import Breadcrumb from "@/components/ui/Breadcrumb";
import File from "@/components/FileIconCard";
import { PlusIcon } from "lucide-react";
import TabList from "@/components/ui/TabList";
import ProcessesList from "@/components/ProcessesList";
import Title from "@/components/ui/Title";
import Drawer from "@/components/ui/Drawer";

interface ProjectData {
  name: string;
  id: string;
}

export default function Project() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [activeTab, setActiveTab] = useState<string>("assets");
  const [currentFile, setCurrentFile] = useState<string | null>(null);

  const [files, _] = useState<ProjectData[]>([
    { name: "File 1.pdf", id: "1" },
    { name: "File 2.pdf", id: "2" },
    { name: "File 3.pdf", id: "3" },
    { name: "File 4.pdf", id: "4" },
    { name: "File 5.pdf", id: "5" },
    { name: "File 6.pdf", id: "6" },
    { name: "File 7.pdf", id: "7" },
  ]);

  const projectTabs = [
    { id: "assets", label: "Assets" },
    { id: "processes", label: "Processes" },
  ];

  const project: ProjectData = {
    name: `Project ${id}`,
    id: id as string,
  };

  const breadcrumbItems = [
    { label: "Projects", href: "/" },
    { label: project.name, href: `/projects/${project.id}` },
  ];

  const handleFileClick = (id: string) => {
    console.log(`File ${id} clicked`);
    setCurrentFile(id);
  };

  const handleAddProcess = () => {
    router.push("/extract");
  };

  return (
    <>
      <Head>
        <title>{`BambooETL - ${project.name}`}</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="flex justify-between items-start mb-8">
        <Breadcrumb items={breadcrumbItems} />
        <button
          onClick={handleAddProcess}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex items-center"
        >
          <PlusIcon className="w-6 h-6 mr-2" />
          New process
        </button>
      </div>

      <Title>{project.name}</Title>

      <TabList
        tabs={projectTabs}
        onTabChange={(tabId) => setActiveTab(tabId)}
        defaultActiveTab="assets"
      />

      {activeTab === "assets" && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
          {files.map((file) => (
            <File
              key={file.id}
              name={file.name}
              onClick={() => handleFileClick(file.id)}
            />
          ))}
        </div>
      )}
      {activeTab === "processes" && <ProcessesList projectId={project.id} />}

      <Drawer
        isOpen={currentFile !== null}
        onClose={() => setCurrentFile(null)}
        title={"Preview"}
      >
        <div>
          <p>Preview goes here</p>
        </div>
      </Drawer>
    </>
  );
}
