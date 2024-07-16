"use client";
import React, { useState } from "react";
import Head from "next/head";
import { useParams, useRouter } from "next/navigation";
import Breadcrumb from "@/components/ui/Breadcrumb";
import File from "@/components/FileIconCard";
import { Loader2, PlusIcon } from "lucide-react";
import TabList from "@/components/ui/TabList";
import ProcessesList from "@/components/ProcessesList";
import Title from "@/components/ui/Title";
import Drawer from "@/components/ui/Drawer";
import { Button } from "@/components/ui/Button";
import {
  AddProjectAsset,
  GetProject,
  GetProjectAssets,
} from "@/services/projects";
import { ProjectData } from "@/interfaces/projects";
import { useQuery } from "@tanstack/react-query";
import FileUploadCard from "@/components/FileUploadCard";

export default function Project() {
  const params = useParams();
  const router = useRouter();
  const id = params.projectId as string;
  const [activeTab, setActiveTab] = useState<string>("assets");
  const [currentFile, setCurrentFile] = useState<string | null>(null);
  const [uploadingFile, setUploadingFile] = useState<boolean>(false);
  const { data: project, isLoading } = useQuery({
    queryKey: ["project", id],
    queryFn: async () => {
      const response = await GetProject(id);
      const { data: project } = response.data;
      return project as ProjectData;
    },
  });
  const { data: projectAssets, refetch: refetchProjectAssets } = useQuery({
    queryKey: ["projectAssets", id],
    queryFn: async () => {
      const response = await GetProjectAssets(id);
      const { data: assets } = response.data;
      return assets;
    },
  });

  const projectTabs = [
    { id: "assets", label: "Assets" },
    { id: "processes", label: "Processes" },
  ];

  const breadcrumbItems = [
    { label: "Projects", href: "/" },
    { label: project?.name || "", href: `/projects/${project?.id}` },
  ];

  const handleFileClick = (id: string) => {
    console.log(`File ${id} clicked`);
    setCurrentFile(id);
  };

  const newProcess = () => {
    router.push(`/projects/${id}/processes/new`);
  };

  const handleFileUpload = async (file: File | null) => {
    if (file) {
      try {
        setUploadingFile(true);
        const response = await AddProjectAsset(id, file);
        setUploadingFile(false);
        if (!response.data) {
          throw new Error("Failed to create project");
        }
        await refetchProjectAssets();
      } catch (error) {
        console.error("Error creating project:", error);
      }
    }
  };

  return (
    <>
      <Head>
        <title>{`BambooETL - ${project?.name}`}</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Breadcrumb items={breadcrumbItems} classNames="mb-8" />

      <div className="flex justify-between items-center mb-8">
        <Title margin={false}>{project?.name}</Title>
        <Button onClick={newProcess} icon={PlusIcon}>
          New process
        </Button>
      </div>

      {isLoading ? (
        <Loader2 className="w-8 h-8 animate-spin" />
      ) : (
        <>
          <TabList
            tabs={projectTabs}
            onTabChange={(tabId) => setActiveTab(tabId)}
            defaultActiveTab="assets"
          />

          {activeTab === "assets" && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
              {projectAssets &&
                projectAssets.map((asset) => (
                  <File
                    key={asset.id}
                    name={asset.filename}
                    onClick={() => handleFileClick(asset.id)}
                  />
                ))}

              {projectAssets && projectAssets.length === 0 && (
                <div className="text-center text-gray-500 col-span-full">
                  No assets found
                </div>
              )}

              <FileUploadCard
                onFileSelect={handleFileUpload}
                isLoading={uploadingFile}
              />
            </div>
          )}
          {activeTab === "processes" && (
            <ProcessesList projectId={project?.id} />
          )}

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
      )}
    </>
  );
}