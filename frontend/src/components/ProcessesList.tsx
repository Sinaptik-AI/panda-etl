"use client";
import React from "react";
import { Column, Table } from "@/components/ui/Table";
import Label from "@/components/ui/Label";
import DateLabel from "@/components/ui/Date";
import { useQuery } from "@tanstack/react-query";
import { GetProjectProcesses } from "@/services/projects";
import { GetProcesses } from "@/services/processes";
import { ProcessData } from "@/interfaces/processes";
import Link from "next/link";

interface ProcessesProps {
  projectId?: string;
}

const ProcessesList: React.FC<ProcessesProps> = ({ projectId }) => {
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
      case 1:
        return <Label status="success" />;
      case -1:
        return <Label status="error" />;
      case 0:
        return <Label status="warning" />;
      default:
        return "-";
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
  ];

  return processes && <Table data={processes} columns={columns} />;
};

export default ProcessesList;
