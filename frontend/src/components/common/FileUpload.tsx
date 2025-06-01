"use client";

import { useState, useRef } from "react";
import { Upload, FileText, X, AlertCircle, CheckCircle } from "lucide-react";

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  maxSize?: number; // bytes
  title?: string;
  description?: string;
  isLoading?: boolean;
  error?: string | null;
  success?: boolean;
  showAsButton?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export default function FileUpload({
  onFileSelect,
  accept = ".csv",
  maxSize = 10 * 1024 * 1024, // 10MB
  title = "ファイルをアップロード",
  description = "CSVファイルをドラッグ&ドロップまたはクリックして選択",
  isLoading = false,
  error = null,
  success = false,
  showAsButton = false,
  className = "",
  children,
}: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelection(files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelection(files[0]);
    }
  };

  const handleFileSelection = (file: File) => {
    // ファイルサイズチェック
    if (file.size > maxSize) {
      alert(
        `ファイルサイズが大きすぎます。${Math.round(maxSize / 1024 / 1024)}MB以下のファイルを選択してください。`,
      );
      return;
    }

    // ファイル形式チェック（簡易）
    if (
      accept &&
      !accept
        .split(",")
        .some((type) => file.name.toLowerCase().endsWith(type.trim()))
    ) {
      alert(
        `対応していないファイル形式です。${accept}ファイルを選択してください。`,
      );
      return;
    }

    setSelectedFile(file);
    onFileSelect(file);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleClear = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  if (showAsButton) {
    return (
      <>
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileInput}
          className="hidden"
        />
        <div
          className={className || "flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"}
          onClick={handleClick}
        >
          {children}
        </div>
      </>
    );
  }

  return (
    <div className="w-full">
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-6 transition-colors cursor-pointer
          ${isDragOver ? "border-blue-400 bg-blue-50 dark:bg-blue-900/20" : "border-gray-300 dark:border-gray-600"}
          ${success ? "border-green-400 bg-green-50 dark:bg-green-900/20" : ""}
          ${error ? "border-red-400 bg-red-50 dark:bg-red-900/20" : ""}
          ${isLoading ? "pointer-events-none opacity-50" : "hover:border-gray-400 dark:hover:border-gray-500"}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileInput}
          className="hidden"
        />

        <div className="text-center">
          {isLoading ? (
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                処理中...
              </p>
            </div>
          ) : success ? (
            <div className="flex flex-col items-center">
              <CheckCircle className="h-8 w-8 text-green-600 mb-2" />
              <p className="text-sm text-green-600 dark:text-green-400">
                アップロード完了
              </p>
            </div>
          ) : (
            <>
              <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">
                {title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {description}
              </p>
            </>
          )}

          {selectedFile && (
            <div className="flex items-center justify-center space-x-2 p-2 bg-gray-100 dark:bg-gray-700 rounded mb-2">
              <FileText className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-700 dark:text-gray-300 truncate max-w-xs">
                {selectedFile.name}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleClear();
                }}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {error && (
            <div className="flex items-center justify-center space-x-2 text-red-600 dark:text-red-400">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <p className="text-xs text-gray-500 dark:text-gray-400">
            最大ファイルサイズ: {Math.round(maxSize / 1024 / 1024)}MB
          </p>
        </div>
      </div>
    </div>
  );
}
