import React, { ButtonHTMLAttributes } from "react";
import { Loader2 } from "lucide-react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  variant?: "primary" | "secondary" | "light" | "danger";
  icon?: React.ForwardRefExoticComponent<any>;
  outlined?: boolean;
  iconStyles?: string;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  isLoading = false,
  variant = "primary",
  icon,
  className = "",
  iconStyles = "w-6 h-6 mr-2",
  disabled,
  outlined = false,
  ...props
}) => {
  const baseStyles =
    "px-4 py-2 rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 shadow-md tranition-all duration-300 ease-in-out font-bold";

  const variantStyles = {
    primary: outlined
      ? "border-2 border-primary bg-primary text-white hover:bg-primary-dark focus:ring-primary"
      : "bg-primary text-white hover:bg-primary-dark focus:ring-primary",
    secondary: outlined
      ? "border-2 border-black bg-black text-white hover:bg-gray-800 focus:ring-gray-500"
      : "bg-black text-white hover:bg-gray-800 focus:ring-gray-500",
    light: outlined
      ? "border-2 border-gray-600 bg-gray-100 text-gray-600 hover:bg-gray-200 focus:ring-gray-500"
      : "bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-500",
    danger: outlined
      ? "border-2 border-red-600 bg-red-100 text-red-600 hover:bg-red-200 focus:ring-red-500"
      : "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
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
      <span className="flex items-center">
        {isLoading ? (
          <>
            <Loader2 className="inline-block w-4 h-4 mr-2 animate-spin" />
            Loading...
          </>
        ) : (
          <>
            {icon && React.createElement(icon, { className: iconStyles })}
            {children}
          </>
        )}
      </span>
    </button>
  );
};
