import React from "react";

interface ChipProps {
  label: string;
  onDelete: () => void;
}

const Chip: React.FC<ChipProps> = ({ label, onDelete }) => {
  return (
    <div className="inline-flex items-center bg-blue-100 hover:bg-blue-200 text-blue-800 px-3 py-1.5 rounded-full m-1 transition-colors duration-200 ease-in-out shadow-sm">
      <span className="text-sm font-medium">{label}</span>
      <button
        onClick={onDelete}
        className="ml-2 rounded-full p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-300 transition-colors duration-200 ease-in-out"
        aria-label="Remove"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>
    </div>
  );
};

export default Chip;
