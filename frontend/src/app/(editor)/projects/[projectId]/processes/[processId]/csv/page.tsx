"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import Papa from "papaparse";
import { BASE_API_URL } from "@/constants";
import { GetProcess, processApiUrl } from "@/services/processes";
import { useQuery } from "@tanstack/react-query";
import LogoDark from "@/icons/LogoDark";
import { Button } from "@/components/ui/Button";

const ProcessPage = () => {
  const router = useRouter();
  const { projectId, processId } = useParams<{
    projectId: string;
    processId: string;
  }>();

  const [gridData, setGridData] = useState<any[]>([]);
  const [columnDefs, setColumnDefs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { data: process } = useQuery({
    queryKey: ["process", processId],
    queryFn: () => GetProcess(processId).then((response) => response.data.data),
  });

  const loadCsvData = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `${BASE_API_URL}/${processApiUrl}/${processId}/get-csv`
      );
      const {
        data: { csv },
      } = await response.json();

      Papa.parse(csv, {
        complete: (result: Papa.ParseResult<any>) => {
          if (
            !result.data ||
            !Array.isArray(result.data) ||
            result.data.length === 0
          ) {
            console.error("CSV data is empty or not in the expected format");
            return;
          }

          const columns = result.meta.fields!.map((col: string) => ({
            headerName: col,
            field: col,
            editable: true,
          }));
          setColumnDefs(columns);
          setGridData(result.data);
          setIsLoading(false);
        },
        header: true,
      });
    } catch (error) {
      console.error("Error loading CSV data:", error);
      setIsLoading(false);
    }
  }, [processId]);

  useEffect(() => {
    loadCsvData();
  }, [loadCsvData]);

  const onCellValueChanged = (event: any) => {
    console.log("Cell value changed:", event);
    // TODO: Implement logic to save changes
  };

  const handleClose = () => {
    router.push(`/projects/${projectId}`);
  };

  const handleSave = () => {
    // TODO: Implement save functionality
    console.log("Save button clicked");
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden">
      <header className="bg-gray-100 px-4 py-4 flex items-center justify-between shadow-sm border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <div className="mt-[2px]">
            <LogoDark color="black" width="48" height="48" />
          </div>
          <h1 className="text-xl font-semibold text-gray-800">
            {isLoading ? "Loading..." : `${process?.name}.csv` || "CSV Preview"}
          </h1>
        </div>
        <div className="space-x-2">
          <Button onClick={handleClose} variant="light">
            Close
          </Button>
          <Button onClick={handleSave} variant="primary">
            Save
          </Button>
        </div>
      </header>
      <main className="flex-grow overflow-hidden">
        <div className="h-full w-full">
          <div className="h-full w-full ag-theme-alpine">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <p>Loading CSV data...</p>
              </div>
            ) : (
              <AgGridReact
                columnDefs={columnDefs}
                rowData={gridData}
                domLayout="normal"
                onCellValueChanged={onCellValueChanged}
                defaultColDef={{
                  sortable: true,
                  filter: true,
                  resizable: true,
                }}
                enableRangeSelection={true}
                rowSelection="multiple"
                animateRows={true}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProcessPage;
