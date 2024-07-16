import React, { useRef } from "react";
import { Loader2, Plus as PlusIcon} from "lucide-react";

interface FileIconProps {
  onFileSelect: (file: File | null) => void;
  isLoading: boolean
}

const FileUploadCard: React.FC<FileIconProps> = ({ onFileSelect, isLoading }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files ? event.target.files[0] : null;
    onFileSelect(file);
  };

  return (
    <div className="w-48 h-48 flex items-center justify-center bg-gray-50 border rounded shadow hover:bg-gray-100 relative">
      
      {isLoading? <Loader2 className="w-8 h-8 animate-spin" />:<button
        onClick={handleButtonClick}
        className="absolute rounded-full h-16 w-16 flex items-center justify-center text-2xl"
      >
        +
      </button>
      }
      <input
        type="file"
        ref={fileInputRef}
        accept="application/pdf"
        onChange={handleFileChange}
        style={{ display: "none" }}
      />
    </div>
  );
};

export default FileUploadCard;
