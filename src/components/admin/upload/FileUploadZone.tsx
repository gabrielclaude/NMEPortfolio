"use client";

import { useCallback, useState } from "react";
import { Upload, FileSpreadsheet, X } from "lucide-react";
import { cn } from "@/lib/utils";

type FileUploadZoneProps = {
  onFileSelect: (file: File) => void;
  accept?: string;
  disabled?: boolean;
};

export function FileUploadZone({
  onFileSelect,
  accept = ".csv,.xlsx,.xls",
  disabled = false,
}: FileUploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (disabled) return;

      const file = e.dataTransfer.files[0];
      if (file) {
        setSelectedFile(file);
        onFileSelect(file);
      }
    },
    [disabled, onFileSelect]
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        setSelectedFile(file);
        onFileSelect(file);
      }
    },
    [onFileSelect]
  );

  const clearFile = useCallback(() => {
    setSelectedFile(null);
  }, []);

  if (selectedFile) {
    return (
      <div className="border-2 border-dashed border-emerald-300 bg-emerald-50 rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <FileSpreadsheet className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">{selectedFile.name}</p>
              <p className="text-sm text-gray-500">
                {(selectedFile.size / 1024).toFixed(1)} KB
              </p>
            </div>
          </div>
          <button
            onClick={clearFile}
            className="p-1 hover:bg-emerald-100 rounded-full transition-colors"
            disabled={disabled}
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        "border-2 border-dashed rounded-xl p-8 text-center transition-colors",
        isDragging
          ? "border-amber-400 bg-amber-50"
          : "border-gray-300 hover:border-gray-400 bg-gray-50",
        disabled && "opacity-50 cursor-not-allowed"
      )}
    >
      <input
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
        id="file-upload"
        disabled={disabled}
      />
      <label
        htmlFor="file-upload"
        className={cn(
          "flex flex-col items-center gap-3",
          !disabled && "cursor-pointer"
        )}
      >
        <div className="p-3 bg-gray-100 rounded-full">
          <Upload className="h-6 w-6 text-gray-500" />
        </div>
        <div>
          <p className="font-medium text-gray-700">
            {isDragging ? "Drop file here" : "Drop your file here, or click to browse"}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Supports CSV and Excel files (.csv, .xlsx, .xls)
          </p>
        </div>
      </label>
    </div>
  );
}
