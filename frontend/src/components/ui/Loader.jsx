import * as React from "react";
import { cn } from "@/lib/utils";

const Loader = React.forwardRef(({ className, size = "default", ...props }, ref) => {
  const sizeClasses = {
    sm: "h-4 w-4 border-2",
    default: "h-8 w-8 border-3",
    lg: "h-12 w-12 border-4",
  };

  return (
    <div
      ref={ref}
      className={cn(
        "inline-block animate-spin rounded-full border-solid border-blue-600 border-t-transparent",
        sizeClasses[size],
        className
      )}
      {...props}
    />
  );
});
Loader.displayName = "Loader";

// Full page loader
const FullPageLoader = ({ message = "Loading..." }) => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm">
      <Loader size="lg" />
      <p className="mt-4 text-sm text-gray-500">{message}</p>
    </div>
  );
};

// Skeleton loader for cards
const CardSkeleton = ({ count = 1 }) => {
  return (
    <div className="space-y-4">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-gray-200 animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse" />
              <div className="h-3 w-1/2 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <div className="h-3 w-full bg-gray-200 rounded animate-pulse" />
            <div className="h-3 w-5/6 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
};

// Table skeleton
const TableSkeleton = ({ rows = 5, columns = 4 }) => {
  return (
    <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              {[...Array(columns)].map((_, i) => (
                <th key={i} className="px-4 py-3 text-left">
                  <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...Array(rows)].map((_, i) => (
              <tr key={i} className="border-t border-gray-100">
                {[...Array(columns)].map((_, j) => (
                  <td key={j} className="px-4 py-3">
                    <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export { Loader, FullPageLoader, CardSkeleton, TableSkeleton };