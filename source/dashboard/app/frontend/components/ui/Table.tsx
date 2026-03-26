import React from "react";
import { cn } from "@/lib/utils";

export interface ColumnDef<T> {
  header: string;
  accessor: keyof T | ((row: T) => React.ReactNode);
  align?: "left" | "center" | "right";
  className?: string;
}

interface TableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  onRowClick?: (row: T, index: number) => void;
  className?: string;
}

const alignClasses: Record<string, string> = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
};

function getCellValue<T>(row: T, accessor: ColumnDef<T>["accessor"]): React.ReactNode {
  if (typeof accessor === "function") {
    return accessor(row);
  }
  return row[accessor] as React.ReactNode;
}

export function Table<T>({ columns, data, onRowClick, className }: TableProps<T>) {
  return (
    <div className="overflow-x-auto">
      <table className={cn("w-full text-left border-collapse", className)}>
        <thead>
          <tr className="bg-surface-hover/50">
            {columns.map((col, colIdx) => (
              <th
                key={colIdx}
                className={cn(
                  "p-4 text-xs text-text-secondary uppercase tracking-wider font-normal",
                  alignClasses[col.align ?? "left"],
                  col.className,
                )}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="text-sm divide-y divide-border">
          {data.map((row, rowIdx) => (
            <tr
              key={rowIdx}
              className={cn(
                "hover:bg-surface-hover/30 transition-colors",
                onRowClick && "cursor-pointer",
              )}
              onClick={onRowClick ? () => onRowClick(row, rowIdx) : undefined}
            >
              {columns.map((col, colIdx) => (
                <td
                  key={colIdx}
                  className={cn(
                    "p-4",
                    alignClasses[col.align ?? "left"],
                    col.className,
                  )}
                >
                  {getCellValue(row, col.accessor)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
