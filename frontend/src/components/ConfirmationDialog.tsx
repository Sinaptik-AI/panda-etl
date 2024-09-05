"use client";
import React, { useState } from "react";
import { AppModal } from "./AppModal";
import { Input } from "./ui/Input";

interface IProps {
  text: string;
  onCancel?: () => void;
  onSubmit?: () => void;
  isLoading?: boolean;
  actionButtonText?: string;
  acceptanceString?: string | null;
}

const ConfirmationDialog = ({
  text,
  onCancel,
  onSubmit,
  isLoading,
  actionButtonText = "Yes",
  acceptanceString = null,
}: IProps) => {
  const [typedData, setTypedData] = useState<string>("");
  const [error, setError] = useState<string>("");

  const handleSubmit = () => {
    if (acceptanceString && acceptanceString !== typedData) {
      setError("Type the requested string to confirm");
      return;
    }
    onSubmit && onSubmit();
  };

  return (
    <AppModal
      closeModal={onCancel}
      actionButtonText={actionButtonText}
      handleSubmit={handleSubmit}
      isLoading={isLoading}
      size="lg"
      title="Confirmation"
    >
      <p className="text-lg text-gray-700 mb-4">{text}</p>
      {acceptanceString && (
        <div className="mb-4">
          <Input
            value={typedData}
            onChange={(e) => setTypedData(e.target.value)}
            placeholder="Type to confirm"
            error={error}
          />
        </div>
      )}
    </AppModal>
  );
};

export default ConfirmationDialog;
