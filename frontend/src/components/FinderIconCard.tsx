import React from "react";

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
    <div
      onClick={onClick}
      className="cursor-pointer w-48 h-48 flex flex-col items-center justify-center bg-gray-50 border rounded shadow hover:bg-gray-100"
    >
      {icon}
      <h3 className="font-bold mt-2 text-center text-sm">{name}</h3>
    </div>
  );
};

export default FinderIconCard;
