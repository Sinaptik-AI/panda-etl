import React from "react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/ContextMenu";
import { TrashIcon } from "lucide-react";

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
}

export function Table<T>({
  data,
  columns,
  onRowClick,
  className = "",
  onDelete,
}: TableProps<T>) {
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
        {data.map((row: any, rowIndex) =>
          onDelete ? (
            <ContextMenu key={rowIndex}>
              <ContextMenuTrigger asChild>
                <tr
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
                      {column.label
                        ? column.label(row)
                        : typeof column.accessor === "function"
                        ? column.accessor(row)
                        : (row[column.accessor] as React.ReactNode) ?? "-"}
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
                  {column.label
                    ? column.label(row)
                    : typeof column.accessor === "function"
                    ? column.accessor(row)
                    : (row[column.accessor] as React.ReactNode) ?? "-"}
                </td>
              ))}
            </tr>
          )
        )}
      </tbody>
    </table>
  );
}
