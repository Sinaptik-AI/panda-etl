"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import DataGrid, { Column, TextEditor } from "react-data-grid";
import Papa from "papaparse";
import { BASE_API_URL } from "@/constants";
import { GetProcess, processApiUrl } from "@/services/processes";
import { useQuery } from "@tanstack/react-query";
import LogoDark from "@/icons/LogoDark";
import { X } from "lucide-react";

function calculateColumnWidth(
  title: string,
  data: Record<string, any>[]
): number {
  const minWidth = 100;
  const maxWidth = 250;
  const charWidth = 9;
  const padding = 20;

  const sampleSize = Math.min(data.length, 100);
  const longestContent = data.slice(0, sampleSize).reduce((max, row) => {
    const cellContent = String(row[title] || "");
    return cellContent.length > max.length ? cellContent : max;
  }, title);

  const calculatedWidth = longestContent.length * charWidth + padding;
  return Math.min(Math.max(calculatedWidth, minWidth), maxWidth);
}

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
  const [selectedRows, setSelectedRows] = useState<ReadonlySet<number>>(
    new Set()
  );
  const gridRef = useRef<HTMLDivElement>(null);

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

          const lineNumberColumn: Column<Record<string, any>, unknown> = {
            key: "lineNumber",
            name: "#",
            width: 30,
            frozen: true,
            resizable: false,
            formatter: ({ rowIdx }) => rowIdx + 1,
          };

          const dataCols = result.meta.fields!.map((col: string) => ({
            key: col,
            name: col,
            editor: TextEditor,
            editable: true,
            resizable: true,
            width: calculateColumnWidth(col, result.data),
          }));

          setColumns([lineNumberColumn, ...dataCols]);

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
                ...Object.fromEntries(dataCols.map((col) => [col.key, ""])),
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

  const handleRowClick = useCallback(
    (
      rowIdx: number,
      row: Record<string, any>,
      column: Column<Record<string, any>, unknown>
    ) => {
      setSelectedRows(new Set());

      if (column.key === "lineNumber") {
        setSelectedRows((prev) => {
          const newSelection = new Set(prev);
          if (newSelection.has(row.id)) {
            newSelection.delete(row.id);
          } else {
            newSelection.add(row.id);
          }
          return newSelection;
        });
      }
    },
    []
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      console.log(event.key);
      if (event.key === "Backspace" && selectedRows.size > 0) {
        event.preventDefault();
        const newRows = rows.map((row) => {
          if (selectedRows.has(row.id)) {
            const updatedRow = { ...row };
            columns.forEach((col) => {
              if (col.key !== "lineNumber" && col.key !== "select-row") {
                updatedRow[col.key] = "";
              }
            });
            return updatedRow;
          }
          return row;
        });
        setRows(newRows);
      }
    },
    [selectedRows, rows, columns]
  );

  useEffect(() => {
    const gridElement = gridRef.current;
    if (gridElement) {
      gridElement.addEventListener("keydown", handleKeyDown as any);
    }
    return () => {
      if (gridElement) {
        gridElement.removeEventListener("keydown", handleKeyDown as any);
      }
    };
  }, [handleKeyDown]);

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
        <div
          className="h-full w-full overflow-auto"
          ref={gridRef}
          tabIndex={0} // Make the div focusable
        >
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
                width: "max-content",
                minWidth: "100%",
              }}
              selectedRows={selectedRows}
              onSelectedRowsChange={setSelectedRows}
              onRowClick={handleRowClick}
              rowKeyGetter={(row) => row.id}
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default ProcessPage;
