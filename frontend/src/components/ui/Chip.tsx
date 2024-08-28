import React from "react";

interface ChipProps {
  label: string;
  onDelete: () => void;
}

const Chip: React.FC<ChipProps> = ({ label, onDelete }) => {
  return (
    <div className="inline-flex items-center bg-blue-200 px-2 py-1 rounded-full m-1">
      <span>{label}</span>
      <button
        onClick={onDelete}
        className="ml-2 rounded-full p-1 text-primary hover:text-primary-dark"
      >
        x
      </button>
    </div>
  );
};

export default Chip;
