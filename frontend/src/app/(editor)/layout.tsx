import React from "react";
import "@/app/style/globals.css";

export default function CSVLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-screen w-screen bg-white">{children}</div>
  );
}
