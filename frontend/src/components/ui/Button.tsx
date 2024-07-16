import React, { ButtonHTMLAttributes } from "react";
import { Loader2 } from "lucide-react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  variant?: "primary" | "secondary" | "danger";
  icon?: React.ForwardRefExoticComponent<any>;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  isLoading = false,
  variant = "primary",
  icon,
  className = "",
  disabled,
  ...props
}) => {
  const baseStyles =
    "px-4 py-2 rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 flex items-center";

  const variantStyles = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
    secondary:
      "bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-500",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
  };

  const buttonStyles = `${baseStyles} ${variantStyles[variant]} ${className} ${
    disabled || isLoading ? "opacity-50 cursor-not-allowed" : ""
  }`;

  return (
    <button
      className={buttonStyles}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="inline-block w-4 h-4 mr-2" />
          Loading...
        </>
      ) : (
        <>
          {icon && React.createElement(icon, { className: "w-6 h-6 mr-2" })}
          {children}
        </>
      )}
    </button>
  );
};
