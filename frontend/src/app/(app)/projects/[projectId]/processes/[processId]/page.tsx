"use client";
import React, { useEffect, useState } from "react";
import Head from "next/head";
import { useParams } from "next/navigation";
import Breadcrumb from "@/components/ui/Breadcrumb";
import { Download } from "lucide-react";
import { ProcessDetailsResponse, ProcessStatus } from "@/interfaces/processes";
import { Column, Table } from "@/components/ui/Table";
import Label from "@/components/ui/Label";
import DateLabel from "@/components/ui/Date";
import Title from "@/components/ui/Title";
import Drawer from "@/components/ui/Drawer";
import { useProcessStep } from "@/hooks/useProcessStep";
import Accordion from "@/components/ui/Accordion";
import { BASE_API_URL } from "@/constants";
import { GetProcessSteps, processApiUrl } from "@/services/processes";
import { truncateTextFromCenter } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import PageLoader from "@/components/ui/PageLoader";
import { Card } from "@/components/ui/Card";

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
  { header: "ID", accessor: (row: ProcessDetailsResponse) => row.id },
  {
    header: "File name",
    accessor: (row: ProcessDetailsResponse) =>
      truncateTextFromCenter(row.asset.filename, 50),
  },
  {
    header: "Status",
    accessor: "status",
    label: statusLabel,
  },
  {
    header: "Started at",
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
];

export default function Process() {
  const params = useParams();
  const processId = (params?.processId as string) || "";
  const projectId = (params?.projectId as string) || "";
  const {
    data: processResponse,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["useGetProcessStepsStale", processId],
    queryFn: () => GetProcessSteps(processId),
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    staleTime: 0,
  });

  const [errorMessage, setErrorMessage] = useState("");
  const [selectedProcess, setSelectedProcess] =
    useState<ProcessDetailsResponse | null>(null);
  const [selectedStepId, setSelectedStepId] = useState<number | null>(null);

  const {
    data: processStepData,
    isLoading: isLoadingProcessStep,
    isError: isErrorProcessStep,
    error: processStepError,
  } = useProcessStep(selectedStepId || 0);

  const project = processResponse?.data?.data?.[0]?.process?.project;
  const process = processResponse?.data?.data?.[0]?.process;

  useEffect(() => {
    if (isError) {
      setErrorMessage("Something went wrong fetching process");
    }
  }, [isError]);

  const breadcrumbItems = [
    { label: "Projects", href: `/` },
    {
      label: project?.name || "",
      href: `/projects/${projectId}`,
    },
    {
      label: `Processes`,
      href: `/projects/${projectId}?processes=true`,
    },
    {
      label: process && process?.name,
      href: `/projects/${projectId}/processes/${processId}`,
    },
  ];

  return (
    <>
      <Head>
        <title>{`PandaETL - Process 1`}</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Breadcrumb items={breadcrumbItems} classNames="mb-8" />

      {process && (
        <div className="flex justify-between items-center mb-8">
          <Title margin={false}>{process?.name}</Title>
        </div>
      )}

      {isLoading ? (
        <PageLoader />
      ) : errorMessage ? (
        <div>{errorMessage}</div>
      ) : (
        <>
          <Table
            data={processResponse?.data?.data}
            columns={columns}
            onRowClick={(row) => {
              setSelectedProcess(row);
              setSelectedStepId(row.id);
            }}
            actions={[
              {
                label: "Download",
                icon: <Download className="mx-1 h-4 w-4" />,
                onClick: (row) => {
                  const downloadUrl = `${BASE_API_URL}/${processApiUrl}/${row.process_id}/steps/${row.id}/download`;
                  window.open(downloadUrl, "_blank");
                },
              },
            ]}
          />
        </>
      )}

      <Drawer
        isOpen={selectedProcess !== null}
        onClose={() => {
          setSelectedProcess(null);
          setSelectedStepId(null);
        }}
        title={"Process Details"}
      >
        {selectedProcess && (
          <div className="space-y-6">
            <div>
              {isLoadingProcessStep ? (
                <PageLoader />
              ) : isErrorProcessStep ? (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded">
                  <p className="font-bold">
                    Error loading process step details:
                  </p>
                  <p>{processStepError?.message}</p>
                </div>
              ) : processStepData?.data.output ? (
                (Array.isArray(processStepData.data.output)
                  ? processStepData.data.output
                  : [processStepData.data.output]
                ).map((item, index) => (
                  <Card className="mb-2" key={index}>
                    {Object.entries(item).map(([key, value]) => (
                      <div key={key} className="mb-4 last:mb-0">
                        <h4 className="text-lg font-semibold text-gray-700 mb-2">
                          {key}
                        </h4>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          {typeof value === "object" ? (
                            <pre className="text-sm text-gray-600 whitespace-pre-wrap">
                              {JSON.stringify(value, null, 2)}
                            </pre>
                          ) : (
                            <p className="text-gray-600 break-words">
                              {String(value)}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </Card>
                ))
              ) : (
                <p className="text-gray-600">No output data available.</p>
              )}
            </div>

            <Accordion title="Process Metadata">
              <div className="space-y-6">
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-gray-100 p-4 rounded-lg">
                    <h3 className="text-sm font-semibold text-gray-500 mb-2">
                      ID
                    </h3>
                    <p className="text-lg font-bold">
                      {selectedProcess.process.id}
                    </p>
                  </div>
                  <div className="bg-gray-100 p-4 rounded-lg">
                    <h3 className="text-sm font-semibold text-gray-500 mb-2">
                      Type
                    </h3>
                    <p className="text-lg font-bold">
                      {selectedProcess.process.type}
                    </p>
                  </div>
                  <div className="bg-gray-100 p-4 rounded-lg">
                    <h3 className="text-sm font-semibold text-gray-500 mb-2">
                      Status
                    </h3>
                    <div className="mt-1">{statusLabel(selectedProcess)}</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-100 p-4 rounded-lg">
                    <h3 className="text-sm font-semibold text-gray-500 mb-2">
                      Start Time
                    </h3>
                    <DateLabel dateString={selectedProcess.created_at} />
                  </div>
                  <div className="bg-gray-100 p-4 rounded-lg">
                    <h3 className="text-sm font-semibold text-gray-500 mb-2">
                      Completed at
                    </h3>
                    {selectedProcess.process.completed_at ? (
                      <DateLabel
                        dateString={selectedProcess.process.completed_at}
                      />
                    ) : (
                      <p className="text-lg font-bold">-</p>
                    )}
                  </div>
                </div>
              </div>
            </Accordion>
          </div>
        )}
      </Drawer>
    </>
  );
}
