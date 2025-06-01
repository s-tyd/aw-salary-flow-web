"use client";

interface DataStatusIndicatorProps {
  hasData: boolean;
  className?: string;
}

export default function DataStatusIndicator({
  hasData,
  className = "",
}: DataStatusIndicatorProps) {
  if (hasData) {
    return null;
  }

  return (
    <span
      className={`text-sm px-2 py-1 bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 rounded-md font-medium ${className}`}
    >
      (未)
    </span>
  );
}
