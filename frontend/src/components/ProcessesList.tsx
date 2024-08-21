"use client";
import React, { useState, useEffect } from "react";
import { Column, Table } from "@/components/ui/Table";
import Label from "@/components/ui/Label";
import DateLabel from "@/components/ui/Date";
import { useQuery } from "@tanstack/react-query";
import { GetProjectProcesses } from "@/services/projects";
import { GetProcess, GetProcesses, ResumeProcess, StopProcess, processApiUrl } from "@/services/processes";
import { ProcessData, ProcessStatus } from "@/interfaces/processes";
import Link from "next/link";
import { BASE_API_URL } from "@/constants";
import { useRouter } from "next/navigation";
import { Download, FileText, Loader2, Edit, Save, Copy, StopCircle, PlayCircle, FileArchive } from "lucide-react";
import Tooltip from "@/components/ui/Tooltip";
import Drawer from "./ui/Drawer";
import dynamic from "next/dynamic";
import { marked } from "marked";

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });
import "react-quill/dist/quill.snow.css";
import "@/app/style/editor.css";
import { ProcessSelectionDrawer } from "./ProjectSelectionDrawer";
import { ProjectData } from "@/interfaces/projects";

interface ProcessesProps {
  projectId?: string;
}

const ProcessesList: React.FC<ProcessesProps> = ({ projectId }) => {
  const router = useRouter();
  const [currentFile, setCurrentFile] = useState<ProcessData | null>(null);
  const [isEditing, setIsEditing] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<ProcessData | null>(null);
  const [openProjectSelection, setOpenProjectSelection] = useState<boolean>(false);
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
          processDetails.data.output.summary || ""
        );
        setEditedSummary(parsedSummary);
      };
      setSummary();
      setIsEditing(true);
    }
  }, [processDetails]);

  const stop_process = async (process: ProcessData) => {
    const response = await StopProcess(process.id);
    if (!response.data) {
      alert("Failed to stop process!")
      throw new Error("Failed to stop process!");
    }
  } 

  const resume_process = async (process: ProcessData) => {
    const response = await ResumeProcess(process.id);
    if (!response.data) {
      alert("Failed to stop process!")
      throw new Error("Failed to stop process!");
    }
  }

  const handleSave = async () => {
    console.log("Saving edited summary:", editedSummary);
    setIsEditing(false);
    // Implement the actual save logic here
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
  }

  const onProjectSelection = (project: ProjectData) => {
    setOpenProjectSelection(false);
    if (!selectedTemplate) {
      alert("No template selected!")
      return
    }
    const templateParams = new URLSearchParams({
            template: selectedTemplate.id,
            type: selectedTemplate.type,
            output: "csv",
          }).toString();
          router.push(
            `/projects/${project.id}/processes/new?${templateParams}`
          );
    setSelectedTemplate(null);
  }

  const columns: Column<ProcessData>[] = [
    { header: "ID", accessor: "id" },
    { header: "Name", accessor: "name" },
    { header: "Type", accessor: "type" },
    ...(projectId
      ? []
      : ([
          {
            header: "Project",
            accessor: "project",
            label: (process: ProcessData) => (
              <Link
                href={`/projects/${process.project_id}`}
                className="text-blue-600"
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
    {
      header: "Actions",
      accessor: "id",
      label: (process: ProcessData) => {
        
        const downloadUrl = `${BASE_API_URL}/${processApiUrl}/${process.id}/download-csv`;
        const downloadPdfZipUrl = `${BASE_API_URL}/${processApiUrl}/${process.id}/download-highlighted-pdf-zip`;

        return (
          <div className="flex items-center space-x-1">
            {process.status == ProcessStatus.IN_PROGRESS && (
              <Link
                href="#"
                className="text-blue-600 hover:underline"
                target="_blank"
                onClick={(e) => {
                  e.preventDefault();
                  stop_process(process);
                }}
              >
                <Tooltip content="Stop">
                  <StopCircle size={16} />
                </Tooltip>
              </Link>
            )}

            {process.status == ProcessStatus.STOPPED && (
              <Link
                href="#"
                className="text-blue-600 hover:underline"
                target="_blank"
                onClick={(e) => {
                  e.preventDefault();
                  resume_process(process);
                }}
              >
                <Tooltip content="Start">
                  <PlayCircle size={16} />
                </Tooltip>
              </Link>
            )}
            

            {process.status == ProcessStatus.IN_PROGRESS || process.completed_step_count == 0 ? (
                <span
                  className="text-gray-400 cursor-not-allowed"
                  title="Download not available"
                >
                  <Tooltip content="Download CSV">
                    <Download size={16} />
                  </Tooltip>
                </span>
              ) : (
                <Link
                  href={downloadUrl}
                  className="text-blue-600 hover:underline"
                  target="_blank"
                >
                  <Tooltip content="Download CSV">
                    <Download size={16} />
                  </Tooltip>
                </Link>
              )}
              
              { process.type === "extractive_summary" ? (process.status == ProcessStatus.IN_PROGRESS || process.completed_step_count == 0 ? (
                <span
                  className="text-gray-400 cursor-not-allowed"
                  title="Download not available"
                >
                  <Tooltip content="Download highlighted pdfs">
                  <FileArchive size={16}/>
                  </Tooltip>
                </span>
              ) : (
                <Link
                  href={downloadPdfZipUrl}
                  className="text-blue-600 hover:underline"
                  target="_blank"
                >
                  <Tooltip content="Download highlighted pdfs">
                    <FileArchive size={16}/>
                  </Tooltip>
                </Link>
              )): ""
            }
            
            {process.type === "extractive_summary" &&
              process.details.transformation_prompt && (
                <Link
                  href="#"
                  className="text-blue-600 hover:underline"
                  onClick={(e) => {
                    e.preventDefault();
                    setCurrentFile(process);
                  }}
                >
                  <Tooltip content="View summary">
                    <FileText size={16} />
                  </Tooltip>
                </Link>
              )}
            {(process.type === "extractive_summary" ||
              process.type === "extract") && (
              <Link
                href="#"
                className="text-blue-600 hover:underline"
                onClick={(e) =>{
                  e.preventDefault();
                  setSelectedTemplate(process)
                  setOpenProjectSelection(true);
                }}
              >
            
                <Tooltip content="Use as template">
                  <Copy size={16} />
                </Tooltip>
              </Link>
            )}
          </div>
        );
      },
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

  return (
    <>
      {processes && (
        <Table
          data={processes}
          columns={columns}
          onRowClick={(row) => {
            router.push(`/projects/${row.project_id}/processes/${row.id}`);
          }}
        />
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
                  className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
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
          <Loader2 className="animate-spin" />
        )}

      </Drawer>
      
      <ProcessSelectionDrawer isOpen={openProjectSelection} onSubmit={onProjectSelection} onCancel={onProjectSelectionCancel}/>

    </>
  );
};

export default ProcessesList;
