"use client";
import React, { useEffect, useRef, useState } from "react";
import Head from "next/head";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Breadcrumb from "@/components/ui/Breadcrumb";
import {
  TrashIcon,
  PlusIcon,
  UploadIcon,
  FileIcon,
  LinkIcon,
  SearchIcon,
  DownloadIcon,
} from "lucide-react";
import TabList from "@/components/ui/TabList";
import ProcessesList from "@/components/ProcessesList";
import Title from "@/components/ui/Title";
import Drawer from "@/components/ui/Drawer";
import {
  AddProjectAsset,
  GetProject,
  GetProjectAssets,
  AddProjectURLAsset,
} from "@/services/projects";
import { ProjectData } from "@/interfaces/projects";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import DragAndDrop from "@/components/DragAndDrop";
import DragOverlay from "@/components/DragOverlay";
import { Table, Column } from "@/components/ui/Table";
import Pagination from "@/components/ui/Pagination";
import ConfirmationDialog from "@/components/ConfirmationDialog";
import { useDeleteAssets } from "@/hooks/useProjects";
import DateLabel from "@/components/ui/Date";
import { Button } from "@/components/ui/Button";
import AssetUploadModal from "@/components/AssetUploadModal";
import { AssetData } from "@/interfaces/assets";
import AssetViewer from "@/components/AssetViewer";
import Tooltip from "@/components/ui/Tooltip";
import ChatBox from "@/components/ChatBox";
import { BASE_STORAGE_URL } from "@/constants";
import PageLoader from "@/components/ui/PageLoader";

export default function Project() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab");
  const isProcesses = searchParams.get("processes");
  const id = params.projectId as string;
  const [activeTab, setActiveTab] = useState<string>(tab ? tab : "assets");
  const [uploadingFile, setUploadingFile] = useState<boolean>(false);
  const [currentAsset, setCurrentAsset] = useState<AssetData | null>(null);
  const [currentAssetPreview, setCurrentAssetPreview] = useState<
    AssetData | Blob | null
  >(null);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [deletedId, setDeletedId] = useState("");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<File[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<[string, Date][]>([]);
  const [openUploadModal, setOpenUploadModal] = useState<boolean>(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<
    Array<{ sender: string; text: string; timestamp: Date }>
  >([]);
  const [chatEnabled, setChatEnabled] = useState<boolean>(false);

  const queryClient = useQueryClient();

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
    { id: "assets", label: "Docs" },
    { id: "processes", label: "Processes" },
    { id: "chat", label: "Chat", badge: "beta" },
  ];

  const breadcrumbItems = [
    { label: "Projects", href: "/" },
    { label: project?.name || "", href: `/projects/${project?.id}` },
  ];

  const openPreview = async (asset: AssetData) => {
    if (project) {
      setCurrentAsset(asset);
      if (typeof asset.id == "string") {
        const file_obj = uploadingFiles.find(
          (value) => value.name === asset.id
        );
        if (file_obj) {
          const file_blob = new Blob([file_obj], { type: file_obj.type });
          setCurrentAssetPreview(file_blob);
        } else {
          console.error("File not found in uploadingFiles.");
        }
      } else {
        const assetExtracted = assets.find(
          (value: AssetData) => value.id == asset.id
        );
        setCurrentAssetPreview(assetExtracted);
      }
    }
  };

  const startDownload = async (row: AssetData) => {
    try {
      const response = await fetch(
        `${BASE_STORAGE_URL}/${project?.id}/${row.filename}`
      );
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = row.filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading file:", error);
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

  const columns: Column<(typeof assets)[0]>[] = [
    {
      header: "File name",
      accessor: "filename",
      label: (process: ProjectData) => (
        <div className="flex items-center">
          {process.type?.includes("pdf") ? (
            <Tooltip content="PDF" delay={1000}>
              <FileIcon className="mr-2 h-4 w-4" />
            </Tooltip>
          ) : process.type?.includes("url") ? (
            <Tooltip content="Website">
              <LinkIcon className="mr-2 h-4 w-4" />
            </Tooltip>
          ) : null}
          {process.filename}
        </div>
      ),
    },
    { header: "Size", accessor: "size" },
    {
      header: "Last modified",
      accessor: "updated_at",
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
          refetchProjectAssets();
        },
        onError(error) {
          console.log(error);
        },
      }
    );
  };

  const onUploadSubmit = async (
    type: string,
    data: string[] | FileList | null
  ) => {
    if (type == "file") {
      handleFileUpload(data as FileList);
    } else if (type == "url") {
      const response = await AddProjectURLAsset(id, data as string[]);
      if (!response.data) {
        return false;
      }
      refetchProjectAssets();
    }

    setOpenUploadModal(false);
    return true;
  };

  return (
    <>
      <Head>
        <title>{`PandaETL - ${project?.name}`}</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Breadcrumb items={breadcrumbItems} classNames="mb-8" />

      <div className="flex justify-between items-center mb-8">
        <Title margin={false}>{project?.name}</Title>
      </div>

      {isLoading || isAssetsLoading ? (
        <PageLoader />
      ) : (
        <div ref={scrollRef}>
          <TabList
            tabs={projectTabs}
            onTabChange={(tabId) => setActiveTab(tabId)}
            defaultActiveTab={activeTab}
            actions={
              <div className="flex gap-2">
                {activeTab === "assets" && (
                  <Button
                    onClick={() => setOpenUploadModal(true)}
                    icon={UploadIcon}
                    variant="light"
                  >
                    Add docs
                  </Button>
                )}
                {(assets && assets.length == 0) || assets == undefined ? (
                  <Tooltip content="Add docs to the project before running a process">
                    <Button
                      onClick={newProcess}
                      icon={PlusIcon}
                      disabled={true}
                    >
                      New process
                    </Button>
                  </Tooltip>
                ) : (
                  <Button onClick={newProcess} icon={PlusIcon}>
                    New process
                  </Button>
                )}
              </div>
            }
          />

          {activeTab === "assets" && (
            <>
              {!uploadingFile && assets && assets?.length === 0 ? (
                <DragAndDrop
                  onFileSelect={handleFileUpload}
                  accept={[".pdf", "application/pdf"]}
                />
              ) : (
                <Table
                  data={assets || []}
                  columns={columns}
                  onRowClick={(row) => openPreview(row)}
                  actions={[
                    {
                      label: "Preview",
                      icon: <SearchIcon className="mx-1 h-4 w-4" />,
                      onClick: (row) => openPreview(row),
                    },
                    {
                      label: "Download",
                      icon: <DownloadIcon className="mx-1 h-4 w-4" />,
                      onClick: (row) => {
                        startDownload(row);
                      },
                    },
                    {
                      label: "Delete",
                      icon: <TrashIcon className="mx-1 h-4 w-4" />,
                      onClick: (row) => {
                        setDeletedId(row.id);
                        setIsDeleteModalOpen(true);
                      },
                    },
                  ]}
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
          {activeTab == "chat" && (
            <ChatBox
              project_id={project?.id}
              messages={messages}
              setMessages={setMessages}
              chatEnabled={chatEnabled}
              setChatEnabled={setChatEnabled}
            />
          )}

          <Drawer
            isOpen={currentAssetPreview !== null}
            onClose={() => setCurrentAssetPreview(null)}
            title={currentAsset?.filename}
          >
            {currentAssetPreview && project && (
              <AssetViewer
                project_id={project.id}
                asset={currentAssetPreview}
              />
            )}
          </Drawer>
        </div>
      )}

      {isDeleteModalOpen && (
        <ConfirmationDialog
          text="Are you sure you want to delete this asset?"
          onCancel={() => {
            setIsDeleteModalOpen(false);
          }}
          isLoading={deleteLoading}
          onSubmit={handleDelete}
        />
      )}

      {openUploadModal && (
        <AssetUploadModal
          isOpen={openUploadModal}
          project_id={project?.id}
          onSubmit={onUploadSubmit}
          onCancel={() => setOpenUploadModal(false)}
        />
      )}
    </>
  );
}
