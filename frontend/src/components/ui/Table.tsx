import React, { useState } from "react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/ContextMenu";
import { Loader2 } from "lucide-react";
import { formatFileSize, truncateTextFromCenter } from "@/lib/utils";
import TooltipWrapper from "./Tooltip";

export interface Column<T> {
  header: string;
  accessor: keyof T | ((data: T) => React.ReactNode);
  label?: (data: T) => React.ReactNode;
}

type ActionType = {
  label: string;
  onClick: (rowData: any) => void;
  icon?: React.ReactNode | ((rowData: any) => React.ReactNode);
  hidden?: (rowData: any) => boolean;
};

interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  className?: string;
  onRowClick?: (data: any) => void;
  uploadingFiles?: File[];
  uploadedFiles?: [string, Date][];
  isAssetsLoading?: boolean;
  actions?: ActionType[];
}

export function Table<T>({
  data,
  columns,
  onRowClick,
  className = "",
  uploadingFiles = [],
  uploadedFiles = [],
  isAssetsLoading,
  actions = [],
}: TableProps<T>) {
  const [highlightedRowIndex, setHighlightedRowIndex] = useState<number | null>(
    null,
  );
  const getUploadedFileElements = (
    uploadedFiles: [string, Date][],
    fileName: string,
  ): [string, Date][] => {
    return uploadedFiles.filter(([name, _timestamp]) => name === fileName);
  };

  const combinedData = [
    ...uploadingFiles.map((file) => {
      const uploaded_file = getUploadedFileElements(uploadedFiles, file.name);
      return {
        id: file.name,
        filename: file.name,
        filetype: file.type.replace("application/", "").toUpperCase(),
        size: formatFileSize(file.size),
        created_at:
          uploaded_file.length == 0 ? "Uploading" : uploaded_file[0][1],
        isUploading: uploaded_file.length == 0,
      };
    }),
    ...data,
  ];

  const renderCellContent = (row: any, column: Column<T>) => {
    if (row.isUploading || isAssetsLoading) {
      return "-";
    }

    let content: React.ReactNode;
    if (column.label) {
      if (typeof column.label === "function") {
        const labelResult = column.label(row);
        if (React.isValidElement(labelResult)) {
          content = React.cloneElement(labelResult as React.ReactElement<any>, {
            children: React.Children.map(
              (labelResult as React.ReactElement<any>).props.children,
              (child) => {
                if (typeof child === "string") {
                  return truncateTextFromCenter(child);
                }
                return child;
              },
            ),
          });
        } else {
          content = labelResult;
        }
      } else {
        content = column.label;
      }
    } else if (typeof column.accessor === "function") {
      content = column.accessor(row);
    } else {
      content = row[column.accessor] ?? "-";
    }

    if (typeof content === "string") {
      return truncateTextFromCenter(content);
    }

    return content;
  };

  return (
    <table className={`min-w-full bg-white ${className} shadow rounded`}>
      <thead>
        <tr>
          {columns.map((column, index) => (
            <th
              key={index}
              className="py-2 px-4 border-b text-left font-semibold"
            >
              {column.header}
            </th>
          ))}
          {actions.length > 0 && <th className="py-2 px-4 border-b"></th>}
        </tr>
      </thead>
      <tbody>
        {combinedData.map((row: any, rowIndex) =>
          actions.length > 0 ? (
            <ContextMenu
              key={rowIndex}
              onOpenChange={(open) => {
                if (open) {
                  setHighlightedRowIndex(rowIndex);
                } else {
                  setHighlightedRowIndex(null);
                }
              }}
            >
              <ContextMenuTrigger asChild>
                <tr
                  className={`hover:bg-gray-100 transition-colors duration-200 ${
                    row.isUploading || isAssetsLoading ? "opacity-50" : ""
                  } ${highlightedRowIndex === rowIndex ? "bg-blue-100" : ""}`}
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
                      {row.isUploading || isAssetsLoading ? (
                        colIndex === 0 ? (
                          <div className="flex items-center gap-2">
                            {truncateTextFromCenter(row.filename)}
                            <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                          </div>
                        ) : colIndex === columns.length - 1 ? (
                          "Loading"
                        ) : (
                          "-"
                        )
                      ) : (
                        renderCellContent(row, column)
                      )}
                    </td>
                  ))}
                  <td className="py-2 px-4 border-b relative">
                    {actions.length > 0 && (
                      <div className="flex items-center gap-2 action-icons">
                        {actions.map(
                          (item, index) =>
                            (!item.hidden || !item.hidden(row)) && (
                              <span
                                key={index}
                                className="cursor-pointer inline-block transition-all duration-100 hover:scale-110"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  item.onClick(row);
                                }}
                              >
                                <TooltipWrapper
                                  content={item.label}
                                  delay={1000}
                                >
                                  {typeof item.icon === "function"
                                    ? item.icon(row)
                                    : item.icon}
                                </TooltipWrapper>
                              </span>
                            ),
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              </ContextMenuTrigger>
              <ContextMenuContent className="bg-white">
                {actions.map((item, index) => {
                  if (item.hidden && item.hidden(row)) {
                    return null;
                  }
                  return (
                    <ContextMenuItem
                      key={index}
                      className="flex items-center gap-2"
                      onClick={() => item.onClick(row)}
                    >
                      {typeof item.icon === "function"
                        ? item.icon(row)
                        : item.icon}
                      {item.label}
                    </ContextMenuItem>
                  );
                })}
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
                  {row.isUploading || isAssetsLoading ? (
                    colIndex === 0 ? (
                      <div className="flex items-center gap-2">
                        {truncateTextFromCenter(row.filename)}
                        <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                      </div>
                    ) : colIndex === columns.length - 1 ? (
                      "Loading"
                    ) : (
                      "-"
                    )
                  ) : (
                    renderCellContent(row, column)
                  )}
                </td>
              ))}
            </tr>
          ),
        )}
      </tbody>
    </table>
  );
}
