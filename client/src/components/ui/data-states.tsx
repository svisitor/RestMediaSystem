import React from "react";
import { Loader2, AlertCircle, FileQuestion } from "lucide-react";
import { cn } from "@/lib/utils";

interface DataStateProps {
  className?: string;
  children?: React.ReactNode;
}

/**
 * Loading state component for data fetching operations
 */
export function DataLoading({ className, children }: DataStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center p-8", className)}>
      <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
      <h3 className="text-lg font-medium text-center">
        {children || "جاري تحميل البيانات..."}
      </h3>
    </div>
  );
}

/**
 * Empty state component for when no data is available
 */
export function DataEmpty({ className, children }: DataStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center p-8", className)}>
      <FileQuestion className="h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-medium text-center">
        {children || "لا توجد بيانات متاحة"}
      </h3>
    </div>
  );
}

/**
 * Error state component for data fetching errors
 */
export function DataError({ className, children }: DataStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center p-8", className)}>
      <AlertCircle className="h-12 w-12 text-destructive mb-4" />
      <h3 className="text-lg font-medium text-center">
        {children || "حدث خطأ أثناء تحميل البيانات"}
      </h3>
    </div>
  );
}

/**
 * Wrapper component that handles all data states
 */
interface DataStateWrapperProps {
  isLoading: boolean;
  isError: boolean;
  isEmpty: boolean;
  children: React.ReactNode;
  loadingMessage?: React.ReactNode;
  emptyMessage?: React.ReactNode;
  errorMessage?: React.ReactNode;
  className?: string;
}

export function DataStateWrapper({
  isLoading,
  isError,
  isEmpty,
  children,
  loadingMessage,
  emptyMessage,
  errorMessage,
  className,
}: DataStateWrapperProps) {
  if (isLoading) {
    return <DataLoading className={className}>{loadingMessage}</DataLoading>;
  }

  if (isError) {
    return <DataError className={className}>{errorMessage}</DataError>;
  }

  if (isEmpty) {
    return <DataEmpty className={className}>{emptyMessage}</DataEmpty>;
  }

  return <>{children}</>;
}