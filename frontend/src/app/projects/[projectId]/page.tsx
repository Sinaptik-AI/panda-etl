"use client";
import React, { useEffect, useState } from "react";
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
import axios from "axios";
import { GetProject } from "@/services/projects";
import { ProjectData } from "@/interfaces/projects";

interface AssetData {
  id: string;
  name: string;
}

export default function Project() {
  const params = useParams();
  const router = useRouter();
  const id = params.projectId as string;
  const [activeTab, setActiveTab] = useState<string>("assets");
  const [currentFile, setCurrentFile] = useState<string | null>(null);
  const [assets, setAssets] = useState<AssetData[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [project, setProject] = useState<ProjectData | null>(null);

  useEffect(() => {
    GetProject(id).then((response) => {
      const { data: project } = response.data;
      setProject(project);
      setIsLoading(false);
    });
  }, []);

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

  useEffect(() => {
    axios
      .get<{ data: ProjectData[] }>(`/api/projects/${id}/assets`)
      .then((response) => {
        const { data: assets } = response.data;
        setAssets(assets);
      });
  }, []);

  return (
    <>
      <Head>
        <title>{`BambooETL - ${project?.name}`}</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="flex justify-between items-start mb-8">
        <Breadcrumb items={breadcrumbItems} />
        <Button onClick={newProcess} icon={PlusIcon}>
          New process
        </Button>
      </div>

      <Title>{project?.name}</Title>

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
              {assets &&
                assets.map((asset) => (
                  <File
                    key={asset.id}
                    name={asset.name}
                    onClick={() => handleFileClick(asset.id)}
                  />
                ))}

              {assets && assets.length === 0 && (
                <div className="text-center text-gray-500 col-span-full">
                  No assets found
                </div>
              )}
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
