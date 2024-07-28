import React from "react";
import { File as FileIcon } from "lucide-react";
import FinderIconCard from "./FinderIconCard";

interface FileIconProps {
  name: string;
  onClick: () => void;
}

const FileIconCard: React.FC<FileIconProps> = ({ name, onClick }) => {
  return (
    <FinderIconCard
      name={name}
      onClick={onClick}
      icon={<FileIcon className="h-12 w-12 text-gray-500 flex-shrink-0" />}
    />
  );
};

export default FileIconCard;
