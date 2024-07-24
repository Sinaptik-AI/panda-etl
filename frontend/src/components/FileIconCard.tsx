import React from "react";
import { File as FileIcon } from "lucide-react";
import Tooltip from "./ui/Tooltip";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/ContextMenu";

interface FileIconProps {
  name: string;
  onClick: () => void;
  onDelete?: () => void;
}

const FileIconCard: React.FC<FileIconProps> = ({ name, onClick, onDelete }) => {
  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <div
          onClick={onClick}
          className="cursor-pointer w-full max-w-48 h-auto aspect-square flex flex-col items-center justify-center bg-gray-50 border rounded shadow hover:bg-gray-100"
        >
          <FileIcon className="h-12 w-12 text-gray-500" />
          <Tooltip content={name}>
            <h3 className="font-bold mt-2 text-center text-sm truncate w-full px-2">
              {name}
            </h3>
          </Tooltip>
        </div>
      </ContextMenuTrigger>

      <ContextMenuContent className="bg-white">
        <ContextMenuItem
          className="hover:bg-blue-600 hover:text-white text-black"
          onClick={onDelete}
        >
          Delete
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
};

export default FileIconCard;
