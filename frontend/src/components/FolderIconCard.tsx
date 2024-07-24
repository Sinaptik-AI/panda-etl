import React from "react";
import { Folder as FolderIcon } from "lucide-react";
import FinderIconCard from "@/components/FinderIconCard";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/ContextMenu";

interface FolderIconCardProps {
  name: string;
  onClick: () => void;
  onDelete?: () => void;
}

const FolderIconCard: React.FC<FolderIconCardProps> = ({
  name,
  onClick,
  onDelete,
}) => {
  return (
    <FinderIconCard
      name={name}
      onClick={onClick}
      icon={<FolderIcon className="h-12 w-12 text-gray-500" />}
      onDelete={onDelete}
    />
  );
};

export default FolderIconCard;
