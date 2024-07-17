import React from "react";
import { File as FileIcon } from "lucide-react";
import Tooltip from "./ui/Tooltip";

interface FileIconProps {
  name: string;
  onClick: () => void;
}


const FileIconCard: React.FC<FileIconProps> = ({ name, onClick }) => {
  return (
    <Tooltip content={name}>
      <div
        onClick={onClick}
        className="cursor-pointer w-48 h-48 flex flex-col items-center justify-center bg-gray-50 border rounded shadow hover:bg-gray-100"
      >
        <FileIcon className="h-12 w-12 text-gray-500" />
        <h3 className="font-bold mt-2 text-center text-sm truncate w-full px-2">
          {name}
        </h3>
      </div>
    </Tooltip>
  );
};

export default FileIconCard;
