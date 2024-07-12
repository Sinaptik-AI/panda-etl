import React from "react";

const Title = ({ children }: { children: React.ReactNode }) => {
  return <h1 className="text-3xl font-bold mb-4">{children}</h1>;
};

export default Title;
