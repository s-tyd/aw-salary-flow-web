"use client";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  fullScreen?: boolean;
  message?: string;
}

export default function LoadingSpinner({
  size = "lg",
  fullScreen = false,
  message,
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-12 w-12",
    lg: "h-16 w-16",
  };

  const containerClasses = fullScreen 
    ? "min-h-screen flex items-center justify-center"
    : "flex items-center justify-center py-8";

  return (
    <div className={containerClasses}>
      <div className="text-center">
        <div
          className={`animate-spin rounded-full ${sizeClasses[size]} border-b-2 border-blue-600 mx-auto`}
        ></div>
        {message && (
          <p className="mt-4 text-gray-600 dark:text-gray-400 text-sm">{message}</p>
        )}
      </div>
    </div>
  );
}
