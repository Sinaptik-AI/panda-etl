import React, { useEffect, useState } from "react";
import { truncateTextFromCenter } from "@/lib/utils";
import { X } from "lucide-react";

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  position?: "left" | "right";
  width?: string;
  size?: "default" | "full";
}

const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  children,
  title,
  position = "right",
  width = "650px",
  size = "default",
}) => {
  const [isRendered, setIsRendered] = useState(isOpen);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsRendered(true);
      setTimeout(() => setIsAnimating(true), 50);
    } else {
      setIsAnimating(false);
      const timer = setTimeout(() => setIsRendered(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isRendered) {
    return null;
  }

  const drawerStyle = {
    width: size === "full" ? "100%" : width,
  };

  return (
    <div
      className={`fixed inset-0 overflow-hidden z-50 ${
        isAnimating ? "" : "pointer-events-none"
      }`}
    >
      <div className="absolute inset-0 overflow-hidden">
        <div
          className={`absolute inset-0 bg-black transition-opacity duration-300 ease-in-out backdrop-blur-sm ${
            isAnimating ? "bg-opacity-50" : "bg-opacity-0"
          }`}
          onClick={onClose}
        />
        <section
          className={`absolute inset-y-0  max-w-full flex outline-none`}
          aria-labelledby="slide-over-heading"
          style={{
            [position]: 0,
          }}
        >
          <div
            style={drawerStyle}
            className={`transform transition-transform duration-300 ease-in-out ${
              isAnimating
                ? "translate-x-0"
                : position === "left"
                  ? "-translate-x-full"
                  : "translate-x-full"
            }`}
          >
            <div className="h-full flex flex-col bg-white shadow-xl overflow-y-scroll">
              <div className="px-4 sm:px-6 py-6 flex items-start justify-between">
                <h2
                  id="slide-over-heading"
                  className="text-lg font-medium text-gray-900"
                >
                  {truncateTextFromCenter(title, 40)}
                </h2>
                <div className="ml-3 h-7 flex items-center">
                  <button
                    onClick={onClose}
                    className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <span className="sr-only">Close panel</span>
                    <X className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>
              </div>
              <div className="relative flex-1 px-4 sm:px-6">
                <div
                  className={`transition-opacity duration-300 ease-in-out ${
                    isAnimating ? "opacity-100" : "opacity-0"
                  }`}
                >
                  {children}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Drawer;
