"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import DataGrid, { Column, TextEditor } from "react-data-grid";
import Papa from "papaparse";
import { BASE_API_URL } from "@/constants";
import { GetProcess, processApiUrl } from "@/services/processes";
import { useQuery } from "@tanstack/react-query";
import LogoDark from "@/icons/LogoDark";
import { X } from "lucide-react";

const MIN_ROWS = 50;

const ProcessPage = () => {
  const router = useRouter();
  const { projectId, processId } = useParams<{
    projectId: string;
    processId: string;
  }>();
  const [rows, setRows] = useState<Record<string, any>[]>([]);
  const [columns, setColumns] = useState<
    Column<Record<string, any>, unknown>[]
  >([]);
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
        complete: (result: Papa.ParseResult<Record<string, any>>) => {
          if (
            !result.data ||
            !Array.isArray(result.data) ||
            result.data.length === 0
          ) {
            console.error("CSV data is empty or not in the expected format");
            return;
          }

          const cols = result.meta.fields!.map((col: string) => ({
            key: col,
            name: col,
            editor: TextEditor,
            editable: true,
            resizable: true,
          }));
          setColumns(cols);

          // Add a unique id to each row
          let rowsWithId = result.data.map((row, index) => ({
            id: index,
            ...row,
          }));

          // Add empty rows if the data has fewer than MIN_ROWS
          if (rowsWithId.length < MIN_ROWS) {
            const emptyRowsNeeded = MIN_ROWS - rowsWithId.length;
            const emptyRows = Array.from(
              { length: emptyRowsNeeded },
              (_, i) => ({
                id: rowsWithId.length + i,
                ...Object.fromEntries(cols.map((col) => [col.key, ""])),
              })
            );
            rowsWithId = [...rowsWithId, ...emptyRows];
          }

          setRows(rowsWithId);
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

  const onRowsChange = useCallback((newRows: Record<string, any>[]) => {
    setRows(newRows);
  }, []);

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
        <div className="h-full w-full">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <p>Loading CSV data...</p>
            </div>
          ) : (
            <DataGrid
              columns={columns}
              rows={rows}
              onRowsChange={onRowsChange}
              className="rdg-light"
              style={{
                height: "100%",
              }}
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default ProcessPage;
