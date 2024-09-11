"use client";
import React from "react";
import { createPortal } from "react-dom";
import { X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

interface IProps {
  closeModal?: () => void;
  handleSubmit?: () => void;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  actionButtonText?: string;
  isLoading?: boolean;
  isFooter?: boolean;
  title?: string;
}

const modalSizes = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  full: "max-w-full",
};

export const AppModal = ({
  closeModal,
  children,
  size = "md",
  handleSubmit,
  actionButtonText,
  isLoading,
  isFooter = true,
  title = "",
}: IProps) => {
  const modalWidth = modalSizes[size] || modalSizes.md;

  return (
    <>
      {createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm text-black">
          <Card className={`relative ${modalWidth}`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-500 focus:outline-none"
              >
                <X size={24} />
              </button>
            </div>
            <div className="mb-6">{children}</div>
            {isFooter && (
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  disabled={isLoading}
                  onClick={closeModal}
                  variant="light"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  ) : null}
                  {actionButtonText}
                </Button>
              </div>
            )}
          </Card>
        </div>,
        document.body,
      )}
    </>
  );
};
