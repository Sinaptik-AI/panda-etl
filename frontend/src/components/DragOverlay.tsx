"use client";
import React, { useState, useCallback, useEffect } from "react";
import { Upload } from "lucide-react";

interface DragOverlayProps {
  onFileDrop: (files: FileList | null) => void;
  accept: string | string[];
}

const DragOverlay: React.FC<DragOverlayProps> = ({ onFileDrop, accept }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if ((e.target as HTMLElement).classList.contains("drag-overlay")) {
      setIsDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
        const droppedFiles = e.dataTransfer.files;
        onFileDrop(droppedFiles);
      }
    },
    [onFileDrop],
  );

  useEffect(() => {
    const handleWindowDragEnter = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(true);
    };

    window.addEventListener("dragenter", handleWindowDragEnter);

    return () => {
      window.removeEventListener("dragenter", handleWindowDragEnter);
    };
  }, []);

  if (!isDragging) return null;

  return (
    <div
      className="drag-overlay fixed inset-0 bg-gray-900 bg-opacity-70 z-50 flex items-center justify-center transition-all duration-300 ease-in-out"
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <div className="bg-gray-800 p-8 rounded-lg text-center border-2 border-dashed border-primary">
        <Upload className="w-16 h-16 mx-auto text-primary mb-4" />
        <p className="text-xl font-semibold mb-2 text-gray-200">
          Drop your files here
        </p>
        <p className="text-gray-400">Release to upload</p>
      </div>
    </div>
  );
};

export default DragOverlay;
