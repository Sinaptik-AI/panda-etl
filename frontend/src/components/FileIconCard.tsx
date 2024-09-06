import React from "react";
import { File as FileIcon, FileSpreadsheet } from "lucide-react";
import FinderIconCard from "./FinderIconCard";

interface FileIconProps {
  name: string;
  onClick: () => void;
  type?: "default" | "spreadsheet";
}

const FileIconCard: React.FC<FileIconProps> = ({
  name,
  onClick,
  type = "default",
}) => {
  const icon =
    type === "spreadsheet" ? (
      <FileSpreadsheet className="h-12 w-12 text-gray-500 flex-shrink-0" />
    ) : (
      <FileIcon className="h-12 w-12 text-gray-500 flex-shrink-0" />
    );

  return <FinderIconCard name={name} onClick={onClick} icon={icon} />;
};

export default FileIconCard;
