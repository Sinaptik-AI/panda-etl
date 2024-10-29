"use client";
import React, { useEffect, useState } from "react";
import { Button } from "./ui/Button";
import { usePathname } from "next/navigation";

interface ErrorFallbackProps {
  error: Error | null;
  resetError: () => void;
}

interface ErrorFallbackBaseProps extends ErrorFallbackProps {
  textColor: string;
}

// Fallback UI component displayed on error
const ErrorFallbackBase = ({
  error,
  resetError,
  textColor,
}: ErrorFallbackBaseProps) => {
  const pathname = usePathname();
  const [initialPathname, setInitialPathname] = useState<string | null>(null);

  useEffect(() => {
    if (initialPathname === null) {
      setInitialPathname(pathname);
    } else if (pathname !== initialPathname && error) {
      resetError();
    }
  }, [pathname, initialPathname, error, resetError]);

  return (
    <div className={`p-8 text-center ${textColor}`}>
      <h1>Oops! Something went wrong.</h1>
      <p>{error?.message || "We're working on fixing this issue."}</p>
      <Button onClick={resetError} className="mt-4">
        Try Again
      </Button>
    </div>
  );
};

export const GlobalErrorFallback = (props: ErrorFallbackProps) => (
  <ErrorFallbackBase {...props} textColor="text-white" />
);

export const ViewErrorFallback = (props: ErrorFallbackProps) => (
  <ErrorFallbackBase {...props} textColor="text-black" />
);
