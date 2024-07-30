import React from "react";

interface LabelStatus {
  status: "success" | "error" | "warning" | "info" | "default";
  children?: React.ReactNode;
}

const Label: React.FC<LabelStatus> = ({ status, children }) => {
  let bgColor = "";
  let textColor = "";

  switch (status) {
    case "success":
      bgColor = "bg-green-100";
      textColor = "text-green-800";
      break;
    case "error":
      bgColor = "bg-red-100";
      textColor = "text-red-800";
      break;
    case "warning":
      bgColor = "bg-yellow-100";
      textColor = "text-yellow-800";
      break;
    case "info":
      bgColor = "bg-blue-100";
      textColor = "text-blue-800";
    default:
      bgColor = "bg-gray-100";
      textColor = "text-gray-800";
      break;
  }

  return (
    <span
      className={`inline-block rounded-full px-3 py-1 text-sm font-semibold ${bgColor} ${textColor}`}
    >
      {children ? children : status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

export default Label;
