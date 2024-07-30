import React from "react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/ContextMenu";
import { TrashIcon, Loader2 } from "lucide-react";
export interface Column<T> {
  header: string;
  accessor: keyof T | ((data: T) => React.ReactNode);
  label?: (data: T) => React.ReactNode;
}

interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  className?: string;
  onRowClick?: (data: any) => void;
  onDelete?: (id: string) => void;
  uploadingFiles?: File[];
}

export function Table<T>({
  data,
  columns,
  onRowClick,
  className = "",
  onDelete,
  uploadingFiles = [],
}: TableProps<T>) {
  const combinedData = [
    ...uploadingFiles.map((file) => ({
      id: file.name,
      filename: file.name,
      filetype: file.type,
      size: file.size,
      created_at: "Uploading",
      isUploading: true,
    })),
    ...data,
  ];
  return (
    <table className={`min-w-full bg-white ${className} shadow rounded`}>
      <thead>
        <tr>
          {columns.map((column, index) => (
            <th key={index} className="py-2 px-4 border-b text-left">
              {column.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {combinedData.map((row: any, rowIndex) =>
          onDelete ? (
            <ContextMenu key={rowIndex}>
              <ContextMenuTrigger asChild>
                <tr
                  className={`hover:bg-gray-100 transition-colors duration-200 ${
                    row.isUploading ? "opacity-50" : ""
                  }`}
                  onClick={(e) => {
                    if (
                      onRowClick &&
                      !(e.target as HTMLElement).closest("a") &&
                      !(e.target as HTMLElement).closest("button")
                    ) {
                      onRowClick(row);
                    }
                  }}
                >
                  {columns.map((column, colIndex) => (
                    <td
                      key={colIndex}
                      className={`py-2 px-4 border-b ${
                        onRowClick && "cursor-pointer"
                      }`}
                    >
                      {row.isUploading ? (
                        colIndex === 0 ? (
                          <div className="flex items-center gap-2">
                            {row.filename}
                            <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                          </div>
                        ) : colIndex === columns.length - 1 ? (
                          "Loading"
                        ) : (
                          "-"
                        )
                      ) : column.label ? (
                        column.label(row)
                      ) : typeof column.accessor === "function" ? (
                        column.accessor(row)
                      ) : (
                        (row[column.accessor] as React.ReactNode) ?? "-"
                      )}
                    </td>
                  ))}
                </tr>
              </ContextMenuTrigger>
              <ContextMenuContent className="bg-white">
                <ContextMenuItem onClick={() => onDelete(row.id)}>
                  <TrashIcon className="mr-2 h-4 w-4" />
                  Delete
                </ContextMenuItem>
              </ContextMenuContent>
            </ContextMenu>
          ) : (
            <tr
              key={rowIndex}
              className="hover:bg-gray-100 transition-colors duration-200"
              onClick={(e) => {
                if (
                  onRowClick &&
                  !(e.target as HTMLElement).closest("a") &&
                  !(e.target as HTMLElement).closest("button")
                ) {
                  onRowClick(row);
                }
              }}
            >
              {columns.map((column, colIndex) => (
                <td
                  key={colIndex}
                  className={`py-2 px-4 border-b ${
                    onRowClick && "cursor-pointer"
                  }`}
                >
                  {row.isUploading ? (
                    colIndex === 0 ? (
                      <div className="flex items-center gap-2">
                        {row.filename}
                        <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                      </div>
                    ) : colIndex === columns.length - 1 ? (
                      "Loading"
                    ) : (
                      "-"
                    )
                  ) : column.label ? (
                    column.label(row)
                  ) : typeof column.accessor === "function" ? (
                    column.accessor(row)
                  ) : (
                    (row[column.accessor] as React.ReactNode) ?? "-"
                  )}
                </td>
              ))}
            </tr>
          )
        )}
      </tbody>
    </table>
  );
}
