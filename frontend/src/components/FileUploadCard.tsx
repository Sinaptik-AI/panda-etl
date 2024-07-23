import React, { useRef } from "react";
import { Loader2 } from "lucide-react";

interface FileUploadCardProps {
  onFileSelect: (file: FileList | null) => void;
  isLoading: boolean;
}

const FileUploadCard: React.FC<FileUploadCardProps> = ({
  onFileSelect,
  isLoading,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    onFileSelect(files);
  };

  return (
    <div className="relative cursor-pointer w-full max-w-48 h-auto aspect-square flex flex-col items-center justify-center bg-gray-50 border rounded shadow hover:bg-gray-100">
      {isLoading ? (
        <Loader2 className="w-8 h-8 animate-spin" />
      ) : (
        <button
          onClick={handleButtonClick}
          className="absolute rounded-full h-16 w-16 flex items-center justify-center text-2xl"
        >
          +
        </button>
      )}
      <input
        type="file"
        ref={fileInputRef}
        accept="application/pdf"
        onChange={handleFileChange}
        multiple
        style={{ display: "none" }}
      />
    </div>
  );
};

export default FileUploadCard;
