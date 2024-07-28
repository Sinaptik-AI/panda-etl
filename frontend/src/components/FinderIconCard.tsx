import React from "react";
import Tooltip from "@/components/ui/Tooltip";

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
}) => {
  return (
    <div
      onClick={onClick}
      className="cursor-pointer w-full max-w-48 h-auto aspect-square flex flex-col justify-center bg-gray-50 border rounded shadow hover:bg-gray-100 overflow-hidden"
    >
      <div className="flex flex-col items-center px-2">
        {icon}
        <div className="w-full truncate">
          <Tooltip content={name}>
            <h3 className="font-bold mt-2 text-center text-sm truncate w-full px-2">
              {name}
            </h3>
          </Tooltip>
        </div>
      </div>
    </div>
  );
};

export default FinderIconCard;
