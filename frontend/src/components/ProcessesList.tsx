"use client";
import React, { useState, useEffect } from "react";
import { Table } from "@/components/ui/Table";

interface Process {
  id: string;
  name: string;
  status: "completed" | "failed" | "running";
  startTime: string;
  endTime?: string;
}

interface ProcessesProps {
  projectId?: string;
}

const ProcessesList: React.FC<ProcessesProps> = ({ projectId }) => {
  const [processes, setProcesses] = useState<Process[]>([]);

  useEffect(() => {
    const mockProcesses: Process[] = [
      {
        id: "1",
        name: "Data Import",
        status: "completed",
        startTime: "2023-07-01 10:00:00",
        endTime: "2023-07-01 10:05:00",
      },
      {
        id: "2",
        name: "Data Transformation",
        status: "running",
        startTime: "2023-07-01 10:06:00",
      },
      {
        id: "3",
        name: "Data Export",
        status: "failed",
        startTime: "2023-07-01 09:00:00",
        endTime: "2023-07-01 09:02:00",
      },
    ];
    setProcesses(mockProcesses);
  }, [projectId]);

  const columns = [
    { header: "ID", accessor: "id" },
    { header: "Name", accessor: "name" },
    { header: "Status", accessor: "status" },
    { header: "Start Time", accessor: "startTime" },
    {
      header: "End Time",
      accessor: (process: Process) => process.endTime || "-",
    },
  ];

  return <Table data={processes} columns={columns} />;
};

export default ProcessesList;
