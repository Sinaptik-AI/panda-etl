import type { Metadata } from "next";
import { Inter } from "next/font/google";
import React from "react";
import { ReactQueryClientProvider } from "@/components/ReactQueryClientProvider";
import { Toaster } from "react-hot-toast";
import "@/app/style/globals.css";
import { Provider, ErrorBoundary } from "@rollbar/react";
import { GlobalErrorFallback } from "@/components/ErrorFallback";

const inter = Inter({ subsets: ["latin"] });

const rollbarConfig = {
  accessToken: process.env.NEXT_PUBLIC_ROLLBAR_ACCESS_TOKEN,
  environment: process.env.NODE_ENV ?? "production",
};

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
    <html lang="en">
      <head />
      <body className={inter.className}>
        <Provider config={rollbarConfig}>
          <ErrorBoundary fallbackUI={GlobalErrorFallback}>
            <ReactQueryClientProvider>
              <Toaster position="top-right" />
              {children}
            </ReactQueryClientProvider>
          </ErrorBoundary>
        </Provider>
      </body>
    </html>
  );
}
