import React from "react";
import { Folder as FolderIcon } from "lucide-react";
import FinderIconCard from "@/components/FinderIconCard";

interface FolderIconCardProps {
  name: string;
  onClick: () => void;
}

const FolderIconCard: React.FC<FolderIconCardProps> = ({ name, onClick }) => {
  return (
    <FinderIconCard
      name={name}
      onClick={onClick}
      icon={<FolderIcon className="h-12 w-12 text-gray-500" />}
    />
  );
};

export default FolderIconCard;
