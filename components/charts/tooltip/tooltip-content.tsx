"use client";

import type { ReactNode } from "react";
import { intFmt } from "../chart-formatters";

export interface TooltipRow {
  color: string;
  label: string;
  value: string | number;
}

export interface TooltipContentProps {
  title?: string;
  rows: TooltipRow[];
  /** Optional additional content (e.g., markers) */
  children?: ReactNode;
}

export function TooltipContent({ title, rows, children }: TooltipContentProps) {
  return (
    <div className="overflow-hidden px-3.5 py-3">
      <div>
        {title && (
          <div className="mb-2.5 text-left text-[0.6875rem] font-medium tracking-wide text-chart-tooltip-muted">
            {title}
          </div>
        )}
        <div className="space-y-2">
          {rows.map((row) => (
            <div
              className="flex items-center justify-between gap-6"
              key={`${row.label}-${row.color}`}
            >
              <div className="flex min-w-0 items-center gap-2">
                <span
                  className="size-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: row.color }}
                />
                <span className="truncate text-xs text-chart-tooltip-muted">
                  {row.label}
                </span>
              </div>
              <span className="font-semibold text-sm tabular-nums text-chart-tooltip-foreground">
                {typeof row.value === "number" ? intFmt(row.value) : row.value}
              </span>
            </div>
          ))}
        </div>

        {children && (
          <div className="mt-2.5 transition-opacity duration-200 ease-out">
            {children}
          </div>
        )}
      </div>
    </div>
  );
}

TooltipContent.displayName = "TooltipContent";

export default TooltipContent;
