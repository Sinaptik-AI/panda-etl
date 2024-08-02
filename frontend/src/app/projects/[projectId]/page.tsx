"use client";
import React, { useEffect, useRef, useState } from "react";
import Head from "next/head";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Breadcrumb from "@/components/ui/Breadcrumb";
import File from "@/components/FileIconCard";
import {
  Loader2,
  GridIcon,
  ListIcon,
  TrashIcon,
  PlusIcon,
  UploadIcon,
} from "lucide-react";
import TabList from "@/components/ui/TabList";
import ProcessesList from "@/components/ProcessesList";
import Title from "@/components/ui/Title";
import Drawer from "@/components/ui/Drawer";
import {
  AddProjectAsset,
  GetProject,
  GetProjectAssets,
  FetchAssetFile,
} from "@/services/projects";
import { ProjectData } from "@/interfaces/projects";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import FileUploadCard from "@/components/FileUploadCard";
import PDFViewer from "@/components/PDFViewer";
import DragAndDrop from "@/components/DragAndDrop";
import DragOverlay from "@/components/DragOverlay";
import { Table, Column } from "@/components/ui/Table";
import Pagination from "@/components/ui/Pagination";
import ConfirmationDialog from "@/components/ConfirmationDialog";
import { useDeleteAssets } from "@/hooks/useProjects";
import DateLabel from "@/components/ui/Date";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/ContextMenu";
import { Button } from "@/components/ui/Button";

export default function Project() {
  const params = useParams();
  const router = useRouter();
  const [viewMode, setViewMode] = useState<"grid" | "table">("table");
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
  const [deletedId, setDeletedId] = useState("");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingFiles, setUploadingFiles] = useState<File[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<[string, Date][]>([]);
  const queryClient = useQueryClient();

  useEffect(() => {
    const storedViewMode = localStorage.getItem("assetsViewMode") as
      | "grid"
      | "table"
      | null;
    if (storedViewMode) {
      setViewMode(storedViewMode);
    } else {
      setViewMode("table");
    }
  }, []);

  const updateViewMode = (mode: "grid" | "table") => {
    setViewMode(mode);
    localStorage.setItem("assetsViewMode", mode);
  };

  const { data: project, isLoading } = useQuery({
    queryKey: ["project", id],
    queryFn: async () => {
      const response = await GetProject(id);
      const { data: project } = response.data;
      return project as ProjectData;
    },
    refetchInterval: 2000,
  });

  const {
    data: projectAssetsResponse,
    refetch: refetchProjectAssets,
    isLoading: isAssetsLoading,
  } = useQuery({
    queryKey: ["projectAssets", id, page, pageSize],
    queryFn: () => GetProjectAssets(id, page, pageSize),
  });

  const { mutateAsync: deleteAsset, isPending: isDeleteAssetPending } =
    useDeleteAssets();

  const assets = projectAssetsResponse?.data?.data || [];
  const totalAssets = projectAssetsResponse?.data?.total_count || 0;
  const totalPages = Math.ceil(totalAssets / pageSize);

  const projectTabs = [
    { id: "assets", label: "Files" },
    { id: "processes", label: "Processes" },
  ];

  const breadcrumbItems = [
    { label: "Projects", href: "/" },
    { label: project?.name || "", href: `/projects/${project?.id}` },
  ];

  const handleFileClick = async (id: string) => {
    setCurrentFile(id);
    if (project) {
      if (typeof id == "string") {
        const file_obj = uploadingFiles.find((value) => value.name === id);
        if (file_obj) {
          const file_blob = new Blob([file_obj], { type: file_obj.type });
          setPdfFile(file_blob);
        } else {
          console.error("File not found in uploadingFiles.");
        }
      } else {
        const response = await FetchAssetFile(project.id, id);
        setPdfFile(new Blob([response], { type: "application/pdf" }));
      }
    }
  };

  const newProcess = () => {
    router.push(`/projects/${id}/processes/new`);
  };

  const handleFileUpload = async (fileList: FileList | null) => {
    if (fileList) {
      const files = Array.from(fileList);
      setUploadingFiles((prev) => [...prev, ...files]);

      try {
        setUploadingFile(true);
        for (const file of files) {
          const response = await AddProjectAsset(id, file);

          if (!response.data) {
            throw new Error("Failed to upload file");
          }
          setUploadedFiles((prev) => [...prev, [file.name, new Date()]]);
        }
        setUploadingFile(false);
        setUploadingFiles([]);
        setUploadedFiles([]);
        queryClient.invalidateQueries({ queryKey: ["projectAssets"] });
      } catch (error) {
        console.error("Error uploading files:", error);
        setUploadingFiles([]);
        setUploadedFiles([]);
      }
    }
  };

  const viewOptions = [
    { value: "grid", label: "Grid", icon: GridIcon },
    { value: "table", label: "Table", icon: ListIcon },
  ];

  const columns: Column<(typeof assets)[0]>[] = [
    { header: "File name", accessor: "filename" },
    { header: "File type", accessor: "filetype" },
    { header: "Size", accessor: "size" },
    {
      header: "Uploaded at",
      accessor: "created_at",
      label: (process: ProjectData) => (
        <DateLabel dateString={process.created_at} />
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

  const handleDelete = () => {
    deleteAsset(
      { projectId: project?.id!, assetId: deletedId! },
      {
        onSuccess() {
          setIsDeleteModalOpen(false);
        },
        onError(error) {
          console.log(error);
        },
      }
    );
  };

  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    handleFileUpload(files);
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
      </div>

      {isLoading || isAssetsLoading ? (
        <Loader2 className="w-8 h-8 animate-spin" />
      ) : (
        <>
          <TabList
            tabs={projectTabs}
            onTabChange={(tabId) => setActiveTab(tabId)}
            defaultActiveTab={activeTab}
            actions={
              <div className="flex gap-2">
                {activeTab === "assets" && (
                  <Button
                    onClick={handleButtonClick}
                    icon={UploadIcon}
                    variant="secondary"
                  >
                    Upload files
                  </Button>
                )}
                <Button onClick={newProcess} icon={PlusIcon}>
                  New process
                </Button>
              </div>
            }
          />

          <input
            type="file"
            ref={fileInputRef}
            accept="application/pdf"
            onChange={handleFileChange}
            multiple
            style={{ display: "none" }}
          />

          {activeTab === "assets" && (
            <>
              {!uploadingFile && assets && assets?.length === 0 ? (
                <DragAndDrop
                  onFileSelect={handleFileUpload}
                  accept={[".pdf", "application/pdf"]}
                />
              ) : viewMode === "grid" ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2">
                  {assets &&
                    assets.map((asset: any) => (
                      <ContextMenu key={asset.id}>
                        <ContextMenuTrigger>
                          <File
                            key={asset.id}
                            name={asset.filename}
                            onClick={() => handleFileClick(asset.id)}
                          />
                        </ContextMenuTrigger>

                        <ContextMenuContent className="bg-white">
                          <ContextMenuItem
                            onClick={() => {
                              setDeletedId(asset.id);
                              setIsDeleteModalOpen(true);
                            }}
                          >
                            <TrashIcon className="mr-2 h-4 w-4" />
                            Delete
                          </ContextMenuItem>
                        </ContextMenuContent>
                      </ContextMenu>
                    ))}

                  <FileUploadCard
                    onFileSelect={handleFileUpload}
                    isLoading={uploadingFile}
                  />
                </div>
              ) : (
                <Table
                  data={assets || []}
                  columns={columns}
                  onRowClick={(row) => handleFileClick(row.id)}
                  onDelete={(id: string) => {
                    setDeletedId(id);
                    setIsDeleteModalOpen(true);
                  }}
                  uploadingFiles={uploadingFiles}
                  uploadedFiles={uploadedFiles}
                  isAssetsLoading={isAssetsLoading}
                />
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

      {isDeleteModalOpen && (
        <ConfirmationDialog
          text={`Are you sure you want to delete this Asset?`}
          onCancel={() => {
            setIsDeleteModalOpen(false);
          }}
          isLoading={deleteLoading}
          onSubmit={handleDelete}
        />
      )}
    </>
  );
}
