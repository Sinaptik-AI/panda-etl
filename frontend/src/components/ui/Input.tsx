import React, { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string | null;
  noMargin?: boolean;
  containerStyle?: string;
  autofocus?: boolean; // Add autofocus prop
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    { label, id, error, noMargin, containerStyle, autofocus, ...props },
    ref,
  ) => {
    return (
      <div
        className={!noMargin ? "mb-4" : containerStyle ? containerStyle : ""}
      >
        {label && (
          <label
            htmlFor={id}
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {label}
          </label>
        )}
        <input
          id={id}
          ref={ref}
          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none ${
            error
              ? "border-red-500 focus:ring-red-500 focus:border-red-500"
              : "border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
          }`}
          autoFocus={autofocus}
          {...props}
        />
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>
    );
  },
);

Input.displayName = "Input";
