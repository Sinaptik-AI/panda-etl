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
      className="cursor-pointer w-full max-w-48 h-auto aspect-square flex flex-col justify-center bg-white border rounded shadow hover:bg-gray-100 overflow-hidden"
    >
      <Tooltip content={name} delay={1000}>
        <div className="flex flex-col items-center px-2">
          {icon}
          <div className="w-full truncate">
            <h3 className="font-bold mt-2 text-center text-sm truncate w-full px-2">
              {name}
            </h3>
          </div>
        </div>
      </Tooltip>
    </div>
  );
};

export default FinderIconCard;
