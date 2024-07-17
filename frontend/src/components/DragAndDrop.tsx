"use client";
import React, {
  useState,
  useCallback,
  useRef,
  ChangeEvent,
  DragEvent,
  MouseEvent,
} from "react";
import { Upload, File, X } from "lucide-react";

interface DragAndDropProps {
  onFileSelect: (file: File | null) => void;
  accept: string | string[];
}

const DragAndDrop: React.FC<DragAndDropProps> = ({ onFileSelect, accept }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  const onFileChange = useCallback(
    (selectedFile: File | null) => {
      setFile(selectedFile);
      onFileSelect(selectedFile);
    },
    [onFileSelect]
  );

  const handleDragEnter = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (
      dropZoneRef.current &&
      !dropZoneRef.current.contains(e.relatedTarget as Node)
    ) {
      setIsDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        const droppedFile = e.dataTransfer.files[0];
        if (accept.includes(droppedFile.type)) {
          onFileChange(droppedFile);
        }
      }
    },
    [accept, onFileChange]
  );

  const removeFile = useCallback(
    (e: MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      setFile(null);
      onFileSelect(null);
    },
    [onFileSelect]
  );

  const handleClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleInputChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        onFileChange(e.target.files[0]);
      }
    },
    [onFileChange]
  );

  return (
    <div className="w-full">
      <div
        ref={dropZoneRef}
        className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer ${
          isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300"
        } ${
          file ? "bg-gray-900" : "bg-gray-800"
        } transition-all duration-300 ease-in-out`}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        {file ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <File className="w-6 h-6 mr-2 text-blue-500" />
              <span className="text-gray-200">{file.name}</span>
            </div>
            <button
              onClick={removeFile}
              className="p-1 text-red-500 hover:text-red-700 transition-colors duration-300"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <Upload className="w-12 h-12 mx-auto text-gray-400" />
            <p className="text-gray-300">
              Drag and drop your files here, or click to select
            </p>
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept={Array.isArray(accept) ? accept.join(",") : accept}
          onChange={handleInputChange}
          className="hidden"
          id="file-upload"
          required={!file}
        />
      </div>
    </div>
  );
};

export default DragAndDrop;
