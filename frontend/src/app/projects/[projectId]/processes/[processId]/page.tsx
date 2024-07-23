"use client";
import React, { useEffect, useState } from "react";
import Head from "next/head";
import { useParams } from "next/navigation";
import Breadcrumb from "@/components/ui/Breadcrumb";
import { Loader2 } from "lucide-react";
import { useGetProcessSteps } from "@/hooks/useProcesses";
import { ProcessDetailsResponse, ProcessStatus } from "@/interfaces/processes";
import { Column, Table } from "@/components/ui/Table";
import Label from "@/components/ui/Label";
import Link from "next/link";
import DateLabel from "@/components/ui/Date";
import { BASE_API_URL } from "@/constants";
import { processApiUrl } from "@/services/processes";

const statusLabel = (process: ProcessDetailsResponse) => {
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

const columns: Column<ProcessDetailsResponse>[] = [
  { header: "ID", accessor: (row: ProcessDetailsResponse) => row.process.id },
  {
    header: "Type",
    accessor: (row: ProcessDetailsResponse) => row.process.type,
  },
  {
    header: "Status",
    accessor: "status",
    label: statusLabel,
  },
  {
    header: "Start Time",
    accessor: "created_at",
    label: (process: ProcessDetailsResponse) => (
      <DateLabel dateString={process.created_at} />
    ),
  },
  {
    header: "Completed at",
    accessor: (process: ProcessDetailsResponse) =>
      process.process.completed_at || "-",
    label: (process: ProcessDetailsResponse) =>
      process.process.completed_at ? (
        <DateLabel dateString={process.process.completed_at} />
      ) : (
        "-"
      ),
  },
  {
    header: "Actions",
    accessor: (row: ProcessDetailsResponse) => row.process.id,
    label: (process: ProcessDetailsResponse) => {
      if (process.status !== ProcessStatus.COMPLETED) {
        return "-";
      }

      const downloadUrl = `${BASE_API_URL}/${processApiUrl}/${process.process.id}/download-csv`;

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

export default function Project() {
  const params = useParams();
  const processId = params.processId as string;
  const projectId = params.projectId as string;
  const {
    data: processResponse,
    isLoading,
    isError,
    error,
  } = useGetProcessSteps(processId);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (isError) {
      setErrorMessage("Something went wrong fetching process");
    }
  }, [isError]);

  const breadcrumbItems = [
    { label: "Projects", href: `/` },
    {
      label: "Process",
      href: `/projects/${projectId}/processes/${processId}`,
    },
  ];

  return (
    <>
      <Head>
        <title>{`BambooETL - Process 1`}</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Breadcrumb items={breadcrumbItems} classNames="mb-8" />

      {isLoading ? (
        <Loader2 className="w-8 h-8 animate-spin" />
      ) : errorMessage ? (
        <div>{errorMessage}</div>
      ) : (
        <>
          <Table
            data={processResponse?.data?.data}
            columns={columns}
            onRowClick={undefined}
          />
        </>
      )}
    </>
  );
}
