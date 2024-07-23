"use client";
import React from "react";
import { Column, Table } from "@/components/ui/Table";
import Label from "@/components/ui/Label";
import DateLabel from "@/components/ui/Date";
import { useQuery } from "@tanstack/react-query";
import { GetProjectProcesses } from "@/services/projects";
import { GetProcesses, processApiUrl } from "@/services/processes";
import { ProcessData, ProcessStatus } from "@/interfaces/processes";
import Link from "next/link";
import { BASE_API_URL } from "@/constants";
import { useRouter } from "next/navigation";

interface ProcessesProps {
  projectId?: string;
}

const ProcessesList: React.FC<ProcessesProps> = ({ projectId }) => {
  const router = useRouter();
  const { data: processes } = useQuery({
    queryKey: ["processes", projectId || ""],
    queryFn: async () => {
      const response = await (projectId
        ? GetProjectProcesses(projectId)
        : GetProcesses());
      const { data: processes } = response.data;
      return processes;
    },
  });

  const statusLabel = (process: ProcessData) => {
    switch (process.status) {
      case ProcessStatus.COMPLETED:
        return <Label status="success">Completed</Label>;
      case ProcessStatus.FAILED:
        return <Label status="error">Failed</Label>;
      case ProcessStatus.IN_PROGRESS:
        return <Label status="warning">In Progress</Label>;
      case ProcessStatus.PENDING:
        return <Label status="info">Pending</Label>;
      default:
        return "-" + process.status;
    }
  };

  const columns: Column<ProcessData>[] = [
    { header: "ID", accessor: "id" },
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
      header: "Start Time",
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
        if (process.status !== ProcessStatus.COMPLETED) {
          return "-";
        }

        const downloadUrl = `${BASE_API_URL}/${processApiUrl}/${process.id}/download-csv`;

        return (
          <Link
            href={downloadUrl}
            className="text-blue-600 hover:underline"
            target="_blank"
          >
            Download
          </Link>
        );
      },
    },
  ];

  return (
    processes && (
      <Table
        data={processes}
        columns={columns}
        onRowClick={(row) => {
          router.push(`/projects/${row.project_id}/processes/${row.id}`);
        }}
      />
    )
  );
};

export default ProcessesList;
