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
  acceptanceString = null 
}: IProps) => {

  const [typedData, setTypedData] = useState<string>("");
  const [error, setError] = useState<string>("");

  const handleSubmit = ()  => {

    if (acceptanceString && acceptanceString !== typedData) {
      setError("Type the requested string to confirm")
      return
    }
    onSubmit && onSubmit()
  }

  return (
    <AppModal
      closeModal={onCancel}
      actionButtonText={actionButtonText}
      handleSubmit={handleSubmit}
      isLoading={isLoading}
      modalWidth="w-[600px]"
    >
      
      <h4 className="my-4 sm:text-sm md:text-lg text-center text-black">
        {text}
      </h4>
      {
        acceptanceString && <div className="text-black"><Input
        value={typedData}
        onChange={(e) => setTypedData(e.target.value)}
        placeholder="Type to confirm"
      />
      </div>
      }
      {
        acceptanceString && error && <p className="mt-1 text-sm text-red-600">{error}</p>
      }
    </AppModal>
  );
};

export default ConfirmationDialog;
