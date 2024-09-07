import type { Metadata } from "next";
import { Inter } from "next/font/google";
import React from "react";
import { ReactQueryClientProvider } from "@/components/ReactQueryClientProvider";
import { Toaster } from "react-hot-toast";
import "@/app/style/globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PandaETL",
  description:
    "PandaETL is a modern ETL tool for data engineers and non-engineers alike.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ReactQueryClientProvider>
      <html lang="en">
        <head />
        <body className={inter.className}>
          <Toaster position="top-right" />
          {children}
        </body>
      </html>
    </ReactQueryClientProvider>
  );
}
