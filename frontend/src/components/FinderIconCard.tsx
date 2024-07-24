import React from "react";
import Tooltip from "@/components/ui/Tooltip";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/ContextMenu";

interface FinderIconCardProps {
  name: string;
  onClick: () => void;
  icon: React.ReactNode;
  onDelete?: () => void;
}

const FinderIconCard: React.FC<FinderIconCardProps> = ({
  name,
  onClick,
  icon,
  onDelete,
}) => {
  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <div
          onClick={onClick}
          className="cursor-pointer w-full max-w-48 h-auto aspect-square flex flex-col items-center justify-center bg-gray-50 border rounded shadow hover:bg-gray-100"
        >
          {icon}
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

export default FinderIconCard;
