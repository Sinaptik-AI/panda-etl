import type { Metadata } from "next";
import { Inter } from "next/font/google";
import React from "react";
import { SidebarProvider } from "@/context/SidebarContext";
import { ScrollProvider } from "@/context/ScrollContext";
import Sidebar from "@/components/ui/Sidebar";
import Navbar from "@/components/ui/Navbar";
import { ReactQueryClientProvider } from "@/components/ReactQueryClientProvider";
import { Toaster } from "react-hot-toast";
import "@/app/style/globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PandaETL",
  description:
    "PandaETL is a modern ETL tool for data engineers and non-engineers alike.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ReactQueryClientProvider>
      <html lang="en">
        <body className={inter.className}>
          <Toaster position="top-right" />
          <SidebarProvider>
            <ScrollProvider>
              <div className="flex h-screen bg-gray-50 text-black">
                <Sidebar />
                <div className="flex-1 flex flex-col overflow-hidden md:ml-64">
                  <Navbar />
                  <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 px-10 py-6">
                    {children}
                  </main>
                </div>
              </div>
            </ScrollProvider>
          </SidebarProvider>
        </body>
      </html>
    </ReactQueryClientProvider>
  );
}
