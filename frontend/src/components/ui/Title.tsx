import React from "react";

const Title = ({
  children,
  margin = true,
}: {
  children: React.ReactNode;
  margin?: boolean;
}) => {
  return (
    <h1 className={`text-3xl font-bold ${margin ? "mb-4" : ""}`}>{children}</h1>
  );
};

export default Title;
