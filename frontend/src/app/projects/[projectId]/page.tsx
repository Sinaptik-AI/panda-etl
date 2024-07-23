"use client";
import React, { useEffect, useState } from "react";
import Head from "next/head";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Breadcrumb from "@/components/ui/Breadcrumb";
import File from "@/components/FileIconCard";
import { Loader2, PlusIcon, GridIcon, ListIcon } from "lucide-react";
import TabList from "@/components/ui/TabList";
import ProcessesList from "@/components/ProcessesList";
import Title from "@/components/ui/Title";
import Drawer from "@/components/ui/Drawer";
import { Button } from "@/components/ui/Button";
import {
  AddProjectAsset,
  GetProject,
  GetProjectAssets,
  FetchAssetFile,
} from "@/services/projects";
import { ProjectData } from "@/interfaces/projects";
import { useQuery } from "@tanstack/react-query";
import FileUploadCard from "@/components/FileUploadCard";
import PDFViewer from "@/components/PDFViewer";
import DragAndDrop from "@/components/DragAndDrop";
import DragOverlay from "@/components/DragOverlay";
import { Table, Column } from "@/components/ui/Table";
import Toggle from "@/components/ui/Toggle";
import Pagination from "@/components/ui/Pagination";

export default function Project() {
  const params = useParams();
  const router = useRouter();
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab");
  const isProcesses = searchParams.get("processes");
  const id = params.projectId as string;
  const [activeTab, setActiveTab] = useState<string>(tab ? tab : "assets");
  const [currentFile, setCurrentFile] = useState<string | null>(null);
  const [uploadingFile, setUploadingFile] = useState<boolean>(false);
  const [pdfFile, setPdfFile] = useState<Blob | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);

  const { data: project, isLoading } = useQuery({
    queryKey: ["project", id],
    queryFn: async () => {
      const response = await GetProject(id);
      const { data: project } = response.data;
      return project as ProjectData;
    },
  });

  const { data: projectAssetsResponse, refetch: refetchProjectAssets } =
    useQuery({
      queryKey: ["projectAssets", id, page, pageSize],
      queryFn: () => GetProjectAssets(id, page, pageSize),
    });

  const assets = projectAssetsResponse?.data?.data || [];
  const totalAssets = projectAssetsResponse?.data?.total_count || 0;
  const totalPages = Math.ceil(totalAssets / pageSize);

  const projectTabs = [
    { id: "assets", label: "Assets" },
    { id: "processes", label: "Processes" },
  ];

  const breadcrumbItems = [
    { label: "Projects", href: "/" },
    { label: project?.name || "", href: `/projects/${project?.id}` },
  ];

  const handleFileClick = async (id: string) => {
    setCurrentFile(id);
    if (project) {
      const response = await FetchAssetFile(project.id, id);
      setPdfFile(new Blob([response], { type: "application/pdf" }));
    }
  };

  const newProcess = () => {
    router.push(`/projects/${id}/processes/new`);
  };

  const handleFileUpload = async (file: FileList | null) => {
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

  const viewOptions = [
    { value: "grid", label: "Grid", icon: GridIcon },
    { value: "table", label: "Table", icon: ListIcon },
  ];

  const columns: Column<(typeof assets)[0]>[] = [
    { header: "File Name", accessor: "filename" },
    { header: "File Type", accessor: "filetype" },
    { header: "Size", accessor: "size" },
    { header: "Upload Date", accessor: "created_at" },
    {
      header: "Actions",
      accessor: (asset) => (
        <Button onClick={() => handleFileClick(asset.id)}>Preview</Button>
      ),
    },
  ];

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  useEffect(() => {
    if (isProcesses) {
      setActiveTab("processes");
    }
  }, []);

  return (
    <>
      <Head>
        <title>{`BambooETL - ${project?.name}`}</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Breadcrumb items={breadcrumbItems} classNames="mb-8" />

      <div className="flex justify-between items-center mb-8">
        <Title margin={false}>{project?.name}</Title>
        <div className="flex space-x-4">
          {activeTab === "assets" && (
            <Toggle
              options={viewOptions}
              value={viewMode}
              onChange={(value) => setViewMode(value as "grid" | "table")}
            />
          )}
          <Button onClick={newProcess} icon={PlusIcon}>
            New process
          </Button>
        </div>
      </div>

      {isLoading ? (
        <Loader2 className="w-8 h-8 animate-spin" />
      ) : (
        <>
          <TabList
            tabs={projectTabs}
            onTabChange={(tabId) => setActiveTab(tabId)}
            defaultActiveTab={activeTab}
          />

          {activeTab === "assets" && (
            <>
              {assets && assets?.length === 0 ? (
                <DragAndDrop
                  onFileSelect={handleFileUpload}
                  accept={[".pdf", "application/pdf"]}
                />
              ) : viewMode === "grid" ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2">
                  {assets &&
                    assets.map((asset: any) => (
                      <File
                        key={asset.id}
                        name={asset.filename}
                        onClick={() => handleFileClick(asset.id)}
                      />
                    ))}

                  <FileUploadCard
                    onFileSelect={handleFileUpload}
                    isLoading={uploadingFile}
                  />
                </div>
              ) : (
                <Table data={assets || []} columns={columns} />
              )}

              {totalPages > 1 && (
                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              )}

              {activeTab === "assets" && assets && assets.length > 0 && (
                <DragOverlay
                  onFileDrop={handleFileUpload}
                  accept={[".pdf", "application/pdf"]}
                />
              )}
            </>
          )}
          {activeTab === "processes" && (
            <ProcessesList projectId={project?.id} />
          )}

          <Drawer
            isOpen={currentFile !== null}
            onClose={() => setCurrentFile(null)}
            title={"Preview"}
          >
            <PDFViewer file={pdfFile} />
          </Drawer>
        </>
      )}
    </>
  );
}
