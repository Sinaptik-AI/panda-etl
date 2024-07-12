import React, { ReactNode } from "react";

interface FormFieldProps {
  label: string;
  id: string;
  children: ReactNode;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  id,
  children,
}) => {
  return (
    <div className="mb-4">
      <label
        htmlFor={id}
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        {label}
      </label>
      {children}
    </div>
  );
};
