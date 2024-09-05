import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
  size?: "default" | "small" | "nopadding";
}

export const Card: React.FC<CardProps> = ({
  children,
  className = "",
  onClick,
  size = "default",
}) => {
  const sizeClasses =
    size === "small" ? "p-4" : size === "nopadding" ? "" : "py-6 p-5";

  return (
    <div
      className={`bg-white shadow-md hover:shadow-lg rounded-lg transition-all duration-300 ${sizeClasses} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};
