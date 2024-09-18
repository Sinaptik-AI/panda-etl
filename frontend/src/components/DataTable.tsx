import React, { useState, useEffect, useCallback, useRef } from "react";
import DataGrid, { Column } from "react-data-grid";
import TextEditor from "@/components/editor/TextEditor";
import "react-data-grid/lib/styles.css";
import { FaInfoCircle } from "react-icons/fa";
import ExtractReferenceDrawer from "./ExtractReferenceDrawer";

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

interface SelectRowColumnType {
  id: string;
  index: number;
  key: string;
}

const DataTable: React.FC<DataTableProps> = ({ data }) => {
  const [rows, setRows] = useState<Record<string, any>[]>([]);
  const [columns, setColumns] = useState<
    Column<Record<string, any>, unknown>[]
  >([]);
  const [selectedRows, setSelectedRows] = useState<ReadonlySet<number>>(
    new Set(),
  );

  const [selectRowColumn, setSelectRowColumn] =
    useState<SelectRowColumnType | null>(null);
  const [displayDrawer, setDisplayDrawer] = useState<boolean>(false);

  const gridRef = useRef<HTMLDivElement>(null);

  const renderCell = useCallback(
    (props: {
      row: Record<string, any>;
      column: Column<Record<string, any>, unknown>;
    }) => {
      const hasProcessId = !!props.row.___process_step_id;

      return (
        <div className="relative group h-full flex items-center overflow-hidden">
          <span className="truncate">{props.row[props.column.key]}</span>
          {hasProcessId && (
            <div className="absolute inset-y-1 right-1 w-12 bg-gradient-to-l from-[#f9fafb] via-[#f9fafb] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-in-out flex items-center justify-end">
              <FaInfoCircle
                className="text-primary cursor-pointer mr-2"
                size={14}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectRowColumn({
                    id: props.row.___process_step_id,
                    index: props.row.___extraction_index,
                    key: props.column.key,
                  });
                  setDisplayDrawer(true);
                }}
              />
            </div>
          )}
        </div>
      );
    },
    [],
  );

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

    const dataCols = Object.keys(data[0] || {})
      .filter((col) => !col.startsWith("___"))
      .map((col: string) => ({
        key: col,
        name: col,
        renderEditCell: TextEditor,
        editable: true,
        resizable: true,
        width: calculateColumnWidth(col, data),
        renderCell: renderCell,
      }));

    setColumns([lineNumberColumn, ...dataCols]);

    let rowsWithId = data.map((row, index) => {
      return {
        id: index,
        ...row,
      };
    });

    if (rowsWithId.length < MIN_ROWS) {
      const emptyRowsNeeded = MIN_ROWS - rowsWithId.length;
      const emptyRows = Array.from({ length: emptyRowsNeeded }, (_, i) => ({
        id: rowsWithId.length + i,
        ...Object.fromEntries(dataCols.map((col) => [col.key, ""])),
      }));
      rowsWithId = [...rowsWithId, ...emptyRows];
    }

    setRows(rowsWithId);
  }, [data, renderCell]);

  const onRowsChange = useCallback((newRows: Record<string, any>[]) => {
    setRows(newRows);
  }, []);

  const onCancel = () => {
    setDisplayDrawer(false);
  };

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
      {displayDrawer && selectRowColumn && (
        <ExtractReferenceDrawer
          process_step_id={selectRowColumn.id}
          column_name={selectRowColumn.key}
          index={selectRowColumn.index}
          onCancel={onCancel}
        />
      )}
    </div>
  );
};

export default DataTable;
