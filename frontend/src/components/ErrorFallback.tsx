"use client";
import React, { useEffect } from "react";
import { Button } from "./ui/Button";
import { useRouter } from "next/navigation";

// Define the props that the ErrorFallback will receive
interface ErrorFallbackProps {
  error: Error | null;
  resetError: () => void;
}

// Fallback UI component displayed on error
interface ErrorFallbackBaseProps extends ErrorFallbackProps {
  textColor: string;
}

const ErrorFallbackBase = ({
  error,
  resetError,
  textColor,
}: ErrorFallbackBaseProps) => {
  const router = useRouter();

  useEffect(() => {
    const handleRouteChange = () => {
      resetError(); // Reset error state on route change
    };

    // Handle route change by overriding the router push method
    const originalPush = router.push;
    router.push = (...args) => {
      handleRouteChange(); // Call the reset function
      return originalPush(...args);
    };

    // Cleanup function to restore original router push method
    return () => {
      router.push = originalPush;
    };
  }, [resetError, router]);

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
