"use client";
import React, { useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { GetProcess, processApiUrl } from "@/services/processes";
import { useQuery } from "@tanstack/react-query";
import LogoDark from "@/icons/LogoDark";
import { X } from "lucide-react";
import DataTable from "@/components/DataTable";
import Papa from "papaparse";
import { BASE_API_URL } from "@/constants";

const ProcessPage = () => {
  const router = useRouter();
  const params = useParams<{
    projectId: string;
    processId: string;
  }>();
  const projectId = params?.projectId;
  const processId = params?.processId;
  const [csvData, setCsvData] = useState<Record<string, any>[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { data: process } = useQuery({
    queryKey: ["process", processId],
    queryFn: () =>
      processId
        ? GetProcess(processId).then((response) => response.data.data)
        : Promise.reject("No processId"),
    enabled: !!processId,
  });

  const loadCsvData = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `${BASE_API_URL}/${processApiUrl}/${processId}/get-csv`,
      );
      const {
        data: { csv },
      } = await response.json();

      Papa.parse(csv, {
        complete: (result: Papa.ParseResult<Record<string, any>>) => {
          if (
            !result.data ||
            !Array.isArray(result.data) ||
            result.data.length === 0
          ) {
            console.error("CSV data is empty or not in the expected format");
            return;
          }
          setCsvData(result.data);
          setIsLoading(false);
        },
        header: true,
      });
    } catch (error) {
      console.error("Error loading CSV data:", error);
      setIsLoading(false);
    }
  }, [processId]);

  React.useEffect(() => {
    loadCsvData();
  }, [loadCsvData]);

  const handleClose = () => {
    router.push(`/projects/${projectId}`);
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden">
      <header className="bg-gray-100 px-2 py-2 flex items-center justify-between shadow-sm border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <div className="mt-[2px]">
            <LogoDark color="black" width="48" height="48" />
          </div>
          <h1 className="text-lg font-semibold text-gray-800">
            {isLoading ? "Loading..." : `${process?.name}.csv` || "CSV Preview"}
          </h1>
        </div>
        <div className="space-x-2">
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <span className="sr-only">Close</span>
            <X className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>
      </header>
      <main className="flex-grow overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <p>Loading CSV data...</p>
          </div>
        ) : (
          <DataTable data={csvData} />
        )}
      </main>
    </div>
  );
};

export default ProcessPage;
