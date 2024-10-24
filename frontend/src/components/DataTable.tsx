import React, { useState, useEffect, useCallback, useRef } from "react";
import DataGrid, { Column } from "react-data-grid";
import TextEditor from "@/components/editor/TextEditor";
import "react-data-grid/lib/styles.css";
import { FaInfoCircle } from "react-icons/fa";
import ExtractReferenceDrawer from "./ExtractReferenceDrawer";
import { GetProcessStepReferences } from "@/services/processSteps";
import { Source } from "@/interfaces/processSteps";
import toast from "react-hot-toast";

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

interface SelectRowColumnType {
  id: string;
  index: number;
  key: string;
  filename: string;
}

const DataTable: React.FC<DataTableProps> = ({ data }) => {
  const [rows, setRows] = useState<Record<string, any>[]>([]);
  const [columns, setColumns] = useState<
    Column<Record<string, any>, unknown>[]
  >([]);
  const [selectedRows, setSelectedRows] = useState<ReadonlySet<number>>(
    new Set()
  );

  const [selectRowColumn, setSelectRowColumn] =
    useState<SelectRowColumnType | null>(null);
  const [displayDrawer, setDisplayDrawer] = useState<boolean>(false);
  const [hoveredCell, setHoveredCell] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleRefClick = async (props: SelectRowColumnType) => {
    setIsLoading(true);
    try {
      const data = await GetProcessStepReferences(props.id);
      const filtered_output = data?.output_reference?.[props.index].filter(
        (item: Source) => item.name == props.key && item.page_numbers
      );
      //  Verify valid reference exists
      if (filtered_output.length == 0) {
        toast.error("Couldn't find the reference for this");
      } else {
        setSelectRowColumn(props);
        setDisplayDrawer(true);
      }
    } catch (error) {
      toast.error("Failed to fetch references");
    } finally {
      setIsLoading(false);
    }
  };

  const gridRef = useRef<HTMLDivElement>(null);

  const renderCell = useCallback(
    (props: {
      row: Record<string, any>;
      column: Column<Record<string, any>, unknown>;
    }) => {
      const hasProcessId = !!props.row.___process_step_id;
      const cellContent = props.row[props.column.key];
      const showInfoIcon =
        hasProcessId &&
        cellContent !== "" &&
        cellContent !== null &&
        cellContent !== undefined &&
        props.column.key !== "Filename";
      const cellId = `${props.row.id}-${props.column.key}`;

      return (
        <div
          className="relative group h-full flex items-center overflow-hidden"
          onMouseEnter={() => {
            setTimeout(() => setHoveredCell(cellId), 200);
          }}
          onMouseLeave={() => setHoveredCell(null)}
        >
          <span className="truncate">{cellContent}</span>
          {showInfoIcon && hoveredCell === cellId && (
            <div className="absolute inset-y-1 right-1 w-12 bg-gradient-to-l from-[#f9fafb] via-[#f9fafb] to-transparent flex items-center justify-end transition-opacity duration-300 ease-in-out">
              <FaInfoCircle
                className="text-primary cursor-pointer mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-in-out"
                size={14}
                onClick={(e) => {
                  e.stopPropagation();
                  handleRefClick({
                    id: props.row.___process_step_id,
                    index: props.row.___extraction_index,
                    filename: props.row.Filename,
                    key: props.column.key,
                  });
                }}
                style={{ cursor: isLoading ? "not-allowed" : "pointer" }}
              />
            </div>
          )}
        </div>
      );
    },
    [hoveredCell]
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
          filename={selectRowColumn.filename}
          onCancel={onCancel}
        />
      )}
    </div>
  );
};

export default DataTable;
