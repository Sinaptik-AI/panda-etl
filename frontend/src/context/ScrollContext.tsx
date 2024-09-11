"use client";
import React, { createContext, useContext, useCallback } from "react";

interface ScrollContextType {
  scrollTo: (top: number) => void;
}

const ScrollContext = createContext<ScrollContextType | undefined>(undefined);

export const ScrollProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const scrollTo = useCallback((top: number) => {
    const main = document.querySelector("main");
    console.log(main);
    if (main) {
      console.log("Scrolled", top);
      main.scrollTo({
        top,
        behavior: "smooth",
      });
    }
  }, []);

  return (
    <ScrollContext.Provider value={{ scrollTo }}>
      {children}
    </ScrollContext.Provider>
  );
};

export const useScroll = (): ScrollContextType => {
  const context = useContext(ScrollContext);
  if (!context) {
    throw new Error("useScroll must be used within a ScrollProvider");
  }
  return context;
};
