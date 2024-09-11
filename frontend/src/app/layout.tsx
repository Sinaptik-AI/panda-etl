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
    "Automate your document workflows. Extract, transform, and ask questions to your data effortlessly.",
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
