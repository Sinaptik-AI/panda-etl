import React, { InputHTMLAttributes } from "react";

interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({ label, id, ...props }) => {
  return (
    <div className="flex items-center mb-4">
      <input
        id={id}
        type="checkbox"
        className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
        {...props}
      />
      <label
        htmlFor={id}
        className="ml-2 block text-sm font-medium text-gray-700"
      >
        {label}
      </label>
    </div>
  );
};
