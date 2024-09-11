import React, { useState, useEffect, useCallback, useRef } from "react";
import DataGrid, { Column, TextEditor } from "react-data-grid";

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

interface DataTableProps {
  data: Record<string, any>[];
}

const DataTable: React.FC<DataTableProps> = ({ data }) => {
  const [rows, setRows] = useState<Record<string, any>[]>([]);
  const [columns, setColumns] = useState<
    Column<Record<string, any>, unknown>[]
  >([]);
  const [selectedRows, setSelectedRows] = useState<ReadonlySet<number>>(
    new Set()
  );
  const [isShiftPressed, setIsShiftPressed] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const lineNumberColumn: Column<Record<string, any>, unknown> = {
      key: "lineNumber",
      name: "#",
      width: 30,
      frozen: true,
      resizable: false,
      formatter: ({ rowIdx }) => rowIdx + 1,
    };

    const dataCols = Object.keys(data[0] || {}).map((col: string) => ({
      key: col,
      name: col,
      editor: TextEditor,
      editable: true,
      resizable: true,
      width: calculateColumnWidth(col, data),
      cellRenderer: () => {},
    }));

    setColumns([lineNumberColumn, ...dataCols]);

    let rowsWithId = data.map((row, index) => ({
      id: index,
      ...row,
    }));

    if (rowsWithId.length < MIN_ROWS) {
      const emptyRowsNeeded = MIN_ROWS - rowsWithId.length;
      const emptyRows = Array.from({ length: emptyRowsNeeded }, (_, i) => ({
        id: rowsWithId.length + i,
        ...Object.fromEntries(dataCols.map((col) => [col.key, ""])),
      }));
      rowsWithId = [...rowsWithId, ...emptyRows];
    }

    setRows(rowsWithId);
  }, [data]);

  const onRowsChange = useCallback((newRows: Record<string, any>[]) => {
    setRows(newRows);
  }, []);

  const handleSelectedRowsChange = useCallback(
    (newSelectedRows: ReadonlySet<number>) => {
      setSelectedRows(newSelectedRows);
    },
    []
  );

  const handleCellSelection = useCallback(
    (position: { idx: number; rowIdx: number }) => {
      if (isShiftPressed) {
        if (position.idx === 0) {
          // Highlight the entire row
          setSelectedRows((prev) => {
            const newSelection = new Set(prev);
            newSelection.add(position.rowIdx);
            return newSelection;
          });
        }
      } else {
        // Clear previous selections
        setSelectedRows(new Set());

        if (position.idx === 0) {
          // Select the entire row
          setSelectedRows(new Set([position.rowIdx]));
        }
      }
    },
    [isShiftPressed]
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === "Shift") {
        setIsShiftPressed(true);
      }
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

  const handleKeyUp = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === "Shift") {
        setIsShiftPressed(false);
      }
    },
    []
  );

  useEffect(() => {
    const gridElement = gridRef.current;
    if (gridElement) {
      gridElement.addEventListener("keydown", handleKeyDown as any);
      gridElement.addEventListener("keyup", handleKeyUp as any);
    }
    return () => {
      if (gridElement) {
        gridElement.removeEventListener("keydown", handleKeyDown as any);
        gridElement.removeEventListener("keyup", handleKeyUp as any);
      }
    };
  }, [handleKeyDown, handleKeyUp]);

  return (
    <div className="h-full w-full overflow-auto" ref={gridRef} tabIndex={0}>
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
        onSelectedRowsChange={handleSelectedRowsChange}
        onSelectedCellChange={handleCellSelection}
        rowKeyGetter={(row) => row.id}
      />
    </div>
  );
};

export default DataTable;
