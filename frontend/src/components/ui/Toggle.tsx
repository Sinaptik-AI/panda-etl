import React from "react";
import { LucideIcon } from "lucide-react";

interface ToggleOption {
  value: string;
  label?: string;
  icon?: LucideIcon;
}

interface ToggleProps {
  options: ToggleOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

const Toggle: React.FC<ToggleProps> = ({
  options,
  value,
  onChange,
  className = "",
}) => {
  return (
    <div className={`flex border rounded-md overflow-hidden ${className}`}>
      {options.map((option) => (
        <button
          key={option.value}
          className={`flex items-center px-3 py-2 transition-colors ${
            value === option.value
              ? "bg-gray-200 text-gray-900"
              : "bg-white text-gray-700 hover:bg-gray-100"
          }`}
          onClick={() => onChange(option.value)}
        >
          {option.icon && <option.icon className="w-5 h-5" />}
          {option.label && <span className="ml-2">{option.label}</span>}
        </button>
      ))}
    </div>
  );
};

export default Toggle;
