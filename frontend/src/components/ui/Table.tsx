import React from "react";

interface Column<T> {
  header: string;
  accessor: keyof T | ((data: T) => React.ReactNode);
}

interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  className?: string;
}

export function Table<T>({ data, columns, className = "" }: TableProps<T>) {
  return (
    <table className={`min-w-full bg-white ${className} shadow rounded`}>
      <thead>
        <tr>
          {columns.map((column, index) => (
            <th key={index} className="py-2 px-4 border-b">
              {column.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, rowIndex) => (
          <tr key={rowIndex}>
            {columns.map((column, colIndex) => (
              <td key={colIndex} className="py-2 px-4 border-b">
                {typeof column.accessor === "function"
                  ? column.accessor(row)
                  : (row[column.accessor] as React.ReactNode) ?? "-"}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
