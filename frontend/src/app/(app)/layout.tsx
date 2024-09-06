import React from "react";
import { SidebarProvider } from "@/context/SidebarContext";
import { ScrollProvider } from "@/context/ScrollContext";
import Sidebar from "@/components/ui/Sidebar";
import Navbar from "@/components/ui/Navbar";
import "@/app/style/globals.css";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
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
  );
}
