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
import { MAX_FILE_SIZE } from "@/constants";
import toast from "react-hot-toast";

interface DragAndDropProps {
  onFileSelect: (files: FileList | null) => void;
  accept: string | string[];
}

const DragAndDrop: React.FC<DragAndDropProps> = ({ onFileSelect, accept }) => {
  const [files, setFiles] = useState<FileList | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  const onFilesChange = useCallback(
    (selectedFiles: FileList | null) => {
      setFiles(selectedFiles);
      onFileSelect(selectedFiles);
    },
    [onFileSelect],
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

  const handleFiles = (files: FileList) => {
    const acceptedTypes = Array.isArray(accept) ? accept : [accept];
    const validFiles = Array.from(files).filter(
      (file) =>
        file.size <= MAX_FILE_SIZE &&
        acceptedTypes.some((type) => file.type.match(type)),
    );

    const invalidFileFormat = Array.from(files).filter(
      (file) => !acceptedTypes.some((type) => file.type.match(type)),
    );

    const invalidFileSize = Array.from(files).filter(
      (file) => file.size > MAX_FILE_SIZE,
    );

    if (invalidFileSize.length > 0) {
      const invalidFileNames = invalidFileSize
        .map((file) => file.name)
        .join("\n");
      toast.error(
        `Max file size is 20 MB, unable to upload files: \n${invalidFileNames}`,
      );
    }

    if (invalidFileFormat.length > 0) {
      const invalidFileNames = invalidFileFormat
        .map((file) => file.name)
        .join("\n");
      toast.error(
        `Invalid file format, unable to upload files: \n${invalidFileNames}`,
      );
    }

    if (validFiles) {
      onFilesChange(validFiles as unknown as FileList);
    }
  };

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        handleFiles(e.dataTransfer.files);
      }
    },
    [accept, onFilesChange],
  );

  const removeFiles = useCallback(
    (e: MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      setFiles(null);
      onFileSelect(null);
    },
    [onFileSelect],
  );

  const handleClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleInputChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        handleFiles(e.target.files);
      }
    },
    [onFilesChange],
  );

  return (
    <div className="w-full">
      <div
        ref={dropZoneRef}
        className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer ${
          isDragging ? "border-primary bg-blue-50" : "border-gray-300"
        } ${
          files ? "bg-gray-900" : "bg-gray-800"
        } transition-all duration-300 ease-in-out`}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        {files && files.length > 0 ? (
          <div className="space-y-2">
            {Array.from(files).map((file, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center">
                  <File className="w-6 h-6 mr-2 text-primary" />
                  <span className="text-gray-200">{file.name}</span>
                </div>
              </div>
            ))}
            <button
              onClick={removeFiles}
              className="p-1 text-red-500 hover:text-red-700 transition-colors duration-300"
            >
              <X className="w-5 h-5" /> Remove All
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <Upload className="w-12 h-12 mx-auto text-gray-400" />
            <p className="text-gray-300">
              Drag and drop your files here, or click to select
            </p>
            <p className="text-gray-300 text-sm">max file size is 20 MB</p>
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept={Array.isArray(accept) ? accept.join(",") : accept}
          onChange={handleInputChange}
          className="hidden"
          id="file-upload"
          required={!files}
          multiple
        />
      </div>
    </div>
  );
};

export default DragAndDrop;
