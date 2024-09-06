import React from "react";
import { Metadata } from "next";
import "@/app/style/globals.css";

export const metadata: Metadata = {
  title: "PandaETL",
  description:
    "Automate your document workflows. Extract, transform, and ask questions to your data effortlessly.",
};

export default function CSVLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-screen w-screen bg-white">{children}</div>
  );
}
