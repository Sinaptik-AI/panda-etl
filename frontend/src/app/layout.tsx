import type { Metadata } from "next";
import { Inter } from "next/font/google";
import React from "react";
import { SidebarProvider } from "@/context/SidebarContext";
import Sidebar from "@/components/ui/Sidebar";
import Navbar from "@/components/ui/Navbar";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "BambooETL",
  description:
    "BambooETL is a modern ETL tool for data engineers and non-engineers alike.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SidebarProvider>
          <div className="flex h-screen bg-gray-100 text-black">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden md:ml-64">
              <Navbar />
              <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 px-10 py-6">
                {children}
              </main>
            </div>
          </div>
        </SidebarProvider>
      </body>
    </html>
  );
}
