"use client";
import React, { useEffect } from "react";
import { Button } from "./ui/Button";
import { useRouter } from "next/navigation";

// Define the props that the ErrorFallback will receive
interface ErrorFallbackProps {
  error: Error | null; // The error that caused the fallback
  resetError: () => void; // Function to reset the error state
}

// Fallback UI component displayed on error
export const GlobalErrorFallback = ({
  error,
  resetError,
}: ErrorFallbackProps) => {
  const router = useRouter();

  //   useEffect(() => {
  //     const handleRouteChange = () => {
  //       resetError(); // Reset error state on route change
  //     };

  //     // Handle route change by overriding the router push method
  //     const originalPush = router.push;
  //     router.push = (...args) => {
  //       handleRouteChange(); // Call the reset function
  //       return originalPush(...args);
  //     };

  //     // Cleanup function to restore original router push method
  //     return () => {
  //       router.push = originalPush;
  //     };
  //   }, [resetError, router]);

  return (
    <div className="p-8 text-center text-white">
      <h1>Oops! Something went wrong.</h1>
      <p>{error?.message || "We're working on fixing this issue."}</p>
      <Button onClick={resetError} className="mt-4">
        Try Again
      </Button>
    </div>
  );
};

export const ViewErrorFallback = ({
  error,
  resetError,
}: ErrorFallbackProps) => {
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
    <div className="p-8 text-center text-black">
      <h1>Oops! Something went wrong.</h1>
      <p>{error?.message || "We're working on fixing this issue."}</p>
      <Button onClick={resetError} className="mt-4">
        Try Again
      </Button>
    </div>
  );
};
