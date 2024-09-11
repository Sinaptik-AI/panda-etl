import React, { useState, useEffect, useCallback, useRef } from "react";
import DataGrid, { Column } from "react-data-grid";
import TextEditor from "@/components/editor/TextEditor";
import "react-data-grid/lib/styles.css";

function calculateColumnWidth(
  title: string,
  data: Record<string, any>[],
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
    new Set(),
  );
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const lineNumberColumn = {
      key: "lineNumber",
      name: "#",
      width: 30,
      frozen: true,
      resizable: false,
      cellClass: "rdg-row-index-column",
      headerCellClass: "rdg-row-index-column",
      renderCell: (props: { row: Record<string, any> }) => {
        return <>{props.row.id + 1}</>;
      },
    };

    const dataCols = Object.keys(data[0] || {}).map((col: string) => ({
      key: col,
      name: col,
      renderEditCell: TextEditor,
      editable: true,
      resizable: true,
      width: calculateColumnWidth(col, data),
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

  return (
    <div className="h-full w-full overflow-hidden" ref={gridRef} tabIndex={0}>
      <DataGrid
        columns={columns}
        rows={rows}
        onRowsChange={onRowsChange}
        className="rdg-light"
        style={{
          height: "100%",
          width: "100%",
        }}
        selectedRows={selectedRows}
        rowKeyGetter={(row) => row.id}
        enableVirtualization={true}
      />
    </div>
  );
};

export default DataTable;
