import React from "react";

interface ChipProps {
  label: string;
  onDelete: () => void;
  color?: "blue" | "green" | "red" | "yellow" | "purple";
  size?: "default" | "small";
}

const colorClasses = {
  blue: {
    chip: "bg-blue-100 hover:bg-blue-200 text-blue-800",
    button:
      "text-blue-600 hover:text-blue-800 hover:bg-blue-200 focus:ring-blue-300",
  },
  green: {
    chip: "bg-green-100 hover:bg-green-200 text-green-800",
    button:
      "text-green-600 hover:text-green-800 hover:bg-green-200 focus:ring-green-300",
  },
  red: {
    chip: "bg-red-100 hover:bg-red-200 text-red-800",
    button:
      "text-red-600 hover:text-red-800 hover:bg-red-200 focus:ring-red-300",
  },
  yellow: {
    chip: "bg-yellow-100 hover:bg-yellow-200 text-yellow-800",
    button:
      "text-yellow-600 hover:text-yellow-800 hover:bg-yellow-200 focus:ring-yellow-300",
  },
  purple: {
    chip: "bg-purple-100 hover:bg-purple-200 text-purple-800",
    button:
      "text-purple-600 hover:text-purple-800 hover:bg-purple-200 focus:ring-purple-300",
  },
};

const sizeClasses = {
  default: {
    chip: "px-3 py-1.5 m-1",
    text: "text-sm",
    button: "ml-2 p-1",
    icon: "h-4 w-4",
  },
  small: {
    chip: "px-2 py-1 my-0.5",
    text: "text-xs",
    button: "ml-1 p-0.5",
    icon: "h-3 w-3",
  },
};

const Chip: React.FC<ChipProps> = ({
  label,
  onDelete,
  color = "blue",
  size = "default",
}) => {
  const colorClass = colorClasses[color];
  const sizeClass = sizeClasses[size];

  return (
    <div
      className={`inline-flex items-center ${colorClass.chip} ${sizeClass.chip} rounded-full transition-colors duration-200 ease-in-out shadow-sm`}
    >
      <span className={`font-medium ${sizeClass.text}`}>{label}</span>
      <button
        onClick={onDelete}
        className={`rounded-full ${colorClass.button} ${sizeClass.button} focus:outline-none focus:ring-2 transition-colors duration-200 ease-in-out`}
        aria-label="Remove"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={sizeClass.icon}
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
