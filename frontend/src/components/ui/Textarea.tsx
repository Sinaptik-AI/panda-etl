import React, { TextareaHTMLAttributes } from "react";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  noMargin?: boolean;
  counter?: string;
  containerStyle?: string;
}

export const Textarea: React.FC<TextareaProps> = ({
  label,
  id,
  error,
  noMargin,
  containerStyle,
  counter,
  ...props
}) => {
  return (
    <div className={!noMargin ? "mb-4" : containerStyle ? containerStyle : ""}>
      {label && (
        <label
          htmlFor={id}
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
        </label>
      )}
      <div className="relative">
        <textarea
          id={id}
          className={`w-full p-4 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none h-40 text-sm ${
            error ? "border-red-500 bg-red-50" : "border-gray-300"
          }`}
          {...props}
        />
        <div className="absolute bottom-3 right-3 text-xs text-gray-400">
          {counter}
        </div>
      </div>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};
