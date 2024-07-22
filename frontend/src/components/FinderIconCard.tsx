import React from "react";
import Tooltip from "@/components/ui/Tooltip";

interface FinderIconCardProps {
  name: string;
  onClick: () => void;
  icon: React.ReactNode;
}

const FinderIconCard: React.FC<FinderIconCardProps> = ({
  name,
  onClick,
  icon,
}) => {
  return (
    <Tooltip content={name}>
      <div
        onClick={onClick}
        className="cursor-pointer w-full max-w-48 h-auto aspect-square flex flex-col items-center justify-center bg-gray-50 border rounded shadow hover:bg-gray-100"
      >
        {icon}
        <h3 className="font-bold mt-2 text-center text-sm truncate w-full px-2">
          {name}
        </h3>
      </div>
    </Tooltip>
  );
};

export default FinderIconCard;
