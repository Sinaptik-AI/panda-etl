"use client";
import React, { useState, useEffect } from "react";
import { Column, Table } from "@/components/ui/Table";
import Label from "@/components/ui/Label";
import DateLabel from "@/components/ui/Date";
import { useQuery } from "@tanstack/react-query";
import { GetProjectProcesses } from "@/services/projects";
import {
  GetProcess,
  GetProcesses,
  ResumeProcess,
  StopProcess,
  processApiUrl,
} from "@/services/processes";
import { ProcessData, ProcessStatus } from "@/interfaces/processes";
import Link from "next/link";
import { BASE_API_URL } from "@/constants";
import { useRouter } from "next/navigation";
import {
  Download,
  FileText,
  Edit,
  Save,
  Copy,
  StopCircle,
  PlayCircle,
  FileArchive,
  RefreshCcw,
} from "lucide-react";
import Tooltip from "@/components/ui/Tooltip";
import Drawer from "./ui/Drawer";
import dynamic from "next/dynamic";
import { marked } from "marked";
import { toast } from "react-hot-toast";

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });
import "react-quill/dist/quill.snow.css";
import "@/app/style/editor.css";
import { ProcessSelectionDrawer } from "./ProjectSelectionDrawer";
import { ProjectData } from "@/interfaces/projects";
import Image from "next/image";
import PageLoader from "./ui/PageLoader";
import { AxiosError } from "axios";

interface ProcessesProps {
  projectId?: string;
}

const NoProcessesPlaceholder = ({ projectId }: { projectId?: string }) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center py-12">
      <Image
        src="/build_chat.svg"
        className="mb-6"
        alt="No processes"
        width={384}
        height={384}
      />
      <div className="text-center max-w-lg">
        <p>There are no processes available at the moment.</p>
        <p>
          {projectId && (
            <>
              To get started,{" "}
              <Link
                href={`/projects/${projectId}/processes/new`}
                className="text-primary font-medium"
              >
                create a new process
              </Link>
              .
            </>
          )}
        </p>
      </div>
    </div>
  );
};

const ProcessesList: React.FC<ProcessesProps> = ({ projectId }) => {
  const router = useRouter();
  const [currentFile, setCurrentFile] = useState<ProcessData | null>(null);
  const [isEditing, setIsEditing] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<ProcessData | null>(
    null,
  );
  const [openProjectSelection, setOpenProjectSelection] =
    useState<boolean>(false);
  const [editedSummary, setEditedSummary] = useState("");

  const { data: processes } = useQuery({
    queryKey: ["processes", projectId || ""],
    queryFn: async () => {
      const response = await (projectId
        ? GetProjectProcesses(projectId)
        : GetProcesses());
      const { data: processes } = response.data;
      return processes;
    },
    refetchInterval: 2000,
  });

  const { data: processDetails, refetch: refetchProcessDetails } = useQuery({
    queryKey: ["process", currentFile?.id],
    queryFn: async () => {
      if (!currentFile) return null;
      const response = await GetProcess(currentFile.id);
      return response.data;
    },
    enabled: false,
  });

  useEffect(() => {
    if (currentFile) {
      refetchProcessDetails();
    }
  }, [currentFile, refetchProcessDetails]);

  useEffect(() => {
    if (processDetails) {
      const setSummary = async () => {
        const parsedSummary = await marked.parse(
          processDetails.data.output.summary || "",
        );
        setEditedSummary(parsedSummary);
      };
      setSummary();
      setIsEditing(true);
    }
  }, [processDetails]);

  const stop_process = async (process: ProcessData) => {
    try {
      const response = await StopProcess(process.id);
      if (!response.data) {
        toast.error("Failed to stop process!");
        throw new Error("Failed to stop process!");
      }
    } catch (error) {
      if (
        error instanceof AxiosError &&
        "status" in error &&
        error.status === 402
      ) {
        toast.error(error.response?.data.detail);
      }
    }
  };

  const resume_process = async (process: ProcessData) => {
    try {
      const response = await ResumeProcess(process.id);
      if (!response.data) {
        toast.error("Failed to resume process!");
        throw new Error("Failed to resume process!");
      }
    } catch (error) {
      if (
        error instanceof AxiosError &&
        "status" in error &&
        error.status === 402
      ) {
        toast.error(error.response?.data.detail);
      }
    }
  };

  const handleSave = async () => {
    console.log("Saving edited summary:", editedSummary);
    setIsEditing(false);
  };

  const statusLabel = (process: ProcessData) => {
    switch (process.status) {
      case ProcessStatus.COMPLETED:
        return <Label status="success">Completed</Label>;
      case ProcessStatus.FAILED:
        return <Label status="error">Failed</Label>;
      case ProcessStatus.IN_PROGRESS:
        return <Label status="warning">In progress</Label>;
      case ProcessStatus.PENDING:
        return <Label status="info">Pending</Label>;
      case ProcessStatus.STOPPED:
        return <Label status="default">Stopped</Label>;

      default:
        return "-" + process.status;
    }
  };

  const onProjectSelectionCancel = () => {
    setOpenProjectSelection(false);
    setSelectedTemplate(null);
  };

  const onProjectSelection = (project: ProjectData) => {
    setOpenProjectSelection(false);
    if (!selectedTemplate) {
      alert("No template selected!");
      return;
    }
    const templateParams = new URLSearchParams({
      template: selectedTemplate.id,
      type: selectedTemplate.type,
      output: "csv",
    }).toString();
    router.push(`/projects/${project.id}/processes/new?${templateParams}`);
    setSelectedTemplate(null);
  };

  const columns: Column<ProcessData>[] = [
    { header: "ID", accessor: "id" },
    { header: "Name", accessor: "name" },
    ...(projectId
      ? []
      : ([
          {
            header: "Project",
            accessor: "project",
            label: (process: ProcessData) => (
              <Link
                href={`/projects/${process.project_id}`}
                className="text-primary"
              >
                {process.project}
              </Link>
            ),
          },
        ] as Column<ProcessData>[])),
    {
      header: "Status",
      accessor: "status",
      label: statusLabel,
    },
    {
      header: "Started at",
      accessor: "started_at",
      label: (process: ProcessData) => (
        <DateLabel dateString={process.started_at} />
      ),
    },
    {
      header: "Completed at",
      accessor: (process: ProcessData) => process.completed_at || "-",
      label: (process: ProcessData) =>
        process.completed_at ? (
          <DateLabel dateString={process.completed_at} />
        ) : (
          "-"
        ),
    },
  ];

  const modules = {
    toolbar: [
      [{ header: [1, 2, false] }],
      ["bold", "italic", "underline", "strike", "blockquote"],
      [
        { list: "ordered" },
        { list: "bullet" },
        { indent: "-1" },
        { indent: "+1" },
      ],
      ["link", "image"],
      ["clean"],
    ],
  };

  const formats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "blockquote",
    "list",
    "bullet",
    "indent",
    "link",
    "image",
  ];

  const handleDownloadCsv = async (process: ProcessData) => {
    try {
      const downloadUrl = `${BASE_API_URL}/${processApiUrl}/${process.id}/download-csv`;
      const response = await fetch(downloadUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `process_${process.id}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      // Show success toast
      toast.success("CSV downloaded successfully");
    } catch (error) {
      console.error("Error downloading CSV:", error);
      toast.error("Failed to download CSV");
    }
  };

  return (
    <>
      {processes && processes.length > 0 ? (
        <Table
          data={processes}
          columns={columns}
          onRowClick={(row) => {
            router.push(`/projects/${row.project_id}/processes/${row.id}`);
          }}
          actions={[
            {
              label: "Stop",
              icon: <StopCircle className="mx-1 h-4 w-4" />,
              onClick: (process: ProcessData) => {
                if (process.status === ProcessStatus.IN_PROGRESS) {
                  stop_process(process);
                }
              },
              hidden: (process: ProcessData) =>
                process.status !== ProcessStatus.IN_PROGRESS,
            },
            {
              label: "Start",
              icon: <PlayCircle className="mx-1 h-4 w-4" />,
              onClick: (process: ProcessData) => {
                if (process.status === ProcessStatus.STOPPED) {
                  resume_process(process);
                }
              },
              hidden: (process: ProcessData) =>
                process.status !== ProcessStatus.STOPPED,
            },
            {
              label: "Retry",
              icon: <RefreshCcw className="mx-1 h-4 w-4" />,
              onClick: (process: ProcessData) => {
                if (process.status === ProcessStatus.FAILED) {
                  resume_process(process);
                }
              },
              hidden: (process: ProcessData) =>
                process.status !== ProcessStatus.FAILED,
            },
            {
              label: "Download CSV",
              icon: (process: ProcessData) => {
                if (
                  process.status === ProcessStatus.IN_PROGRESS ||
                  process.completed_step_count == 0
                ) {
                  return (
                    <span className="text-gray-400 cursor-not-allowed">
                      <Download className="mx-1 h-4 w-4" />
                    </span>
                  );
                }
                return <Download className="mx-1 h-4 w-4" />;
              },
              onClick: (process: ProcessData) => {
                if (
                  process.status === ProcessStatus.IN_PROGRESS ||
                  process.completed_step_count == 0
                ) {
                  return;
                }
                handleDownloadCsv(process);
              },
              hidden: (process: ProcessData) =>
                process.status === ProcessStatus.IN_PROGRESS ||
                process.completed_step_count == 0,
            },
            {
              label: "Download highlighted PDFs",
              icon: (process: ProcessData) => {
                if (
                  process.status === ProcessStatus.IN_PROGRESS ||
                  process.completed_step_count == 0
                ) {
                  return (
                    <span className="text-gray-400 cursor-not-allowed">
                      <FileArchive className="mx-1 h-4 w-4" />
                    </span>
                  );
                }
                return <FileArchive className="mx-1 h-4 w-4" />;
              },
              onClick: (process: ProcessData) => {
                if (
                  process.status === ProcessStatus.IN_PROGRESS ||
                  process.completed_step_count == 0
                ) {
                  return;
                }

                const downloadPdfZipUrl = `${BASE_API_URL}/${processApiUrl}/${process.id}/download-highlighted-pdf-zip`;
                window.open(downloadPdfZipUrl, "_blank");
              },
              hidden: (process: ProcessData) =>
                process.status === ProcessStatus.IN_PROGRESS ||
                process.completed_step_count == 0 ||
                process.type !== "extractive_summary",
            },
            {
              label: "View Summary",
              icon: <FileText className="mx-1 h-4 w-4" />,
              onClick: (process: ProcessData) => {
                setCurrentFile(process);
              },
              hidden: (process: ProcessData) =>
                process.type !== "extractive_summary" || !process.details,
            },
            {
              label: "Use as Template",
              icon: <Copy className="mx-1 h-4 w-4" />,
              onClick: (process: ProcessData) => {
                setSelectedTemplate(process);
                setOpenProjectSelection(true);
              },
              hidden: (process: ProcessData) =>
                process.type !== "extractive_summary" &&
                process.type !== "extract",
            },
          ]}
        />
      ) : (
        <NoProcessesPlaceholder projectId={projectId} />
      )}
      <Drawer
        isOpen={currentFile !== null}
        onClose={() => {
          setCurrentFile(null);
          setIsEditing(true);
        }}
        title={"Summary Preview"}
      >
        {processDetails ? (
          <div>
            {isEditing ? (
              <>
                <ReactQuill
                  theme="snow"
                  value={editedSummary}
                  onChange={setEditedSummary}
                  modules={modules}
                  formats={formats}
                />
                <button
                  onClick={handleSave}
                  className="mt-4 px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark"
                >
                  <Save className="inline-block mr-2" size={16} />
                  Download
                </button>
              </>
            ) : (
              <>
                <div dangerouslySetInnerHTML={{ __html: editedSummary }} />
                <button
                  onClick={() => setIsEditing(true)}
                  className="mt-4 px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                >
                  <Edit className="inline-block mr-2" size={16} />
                  Edit
                </button>
              </>
            )}
          </div>
        ) : (
          <PageLoader />
        )}
      </Drawer>

      <ProcessSelectionDrawer
        isOpen={openProjectSelection}
        onSubmit={onProjectSelection}
        onCancel={onProjectSelectionCancel}
      />
    </>
  );
};

export default ProcessesList;
