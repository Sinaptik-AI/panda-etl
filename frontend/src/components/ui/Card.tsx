import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = "" }) => {
  return (
    <div className={`bg-white shadow rounded-lg ${className}`}>{children}</div>
  );
};

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export const CardHeader: React.FC<CardHeaderProps> = ({
  children,
  className = "",
}) => {
  return (
    <div className={`px-4 py-5 border-b border-gray-200 sm:px-6 ${className}`}>
      {children}
    </div>
  );
};

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

export const CardContent: React.FC<CardContentProps> = ({
  children,
  className = "",
}) => {
  return <div className={`px-4 py-5 sm:p-6 ${className}`}>{children}</div>;
};

export const CardTitle: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <h3 className="text-lg leading-6 font-medium text-gray-900">{children}</h3>
  );
};

export const CardDescription: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return <p className="mt-1 max-w-2xl text-sm text-gray-500">{children}</p>;
};
