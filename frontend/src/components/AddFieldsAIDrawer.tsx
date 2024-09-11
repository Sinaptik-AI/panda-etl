"use client";
import React, { useState } from "react";
import MultiSelectionTextArea from "./ui/MultiSelectionTextArea";
import { GetAIFieldDescriptions } from "@/services/extract";
import { ExtractionField } from "@/interfaces/extract";
import Drawer from "./ui/Drawer";
import { Button } from "./ui/Button";

interface IProps {
  project_id: string;
  isOpen?: boolean;
  onCancel: () => void;
  onSubmit: (data: ExtractionField[]) => void;
}

const AddFieldsAIDrawer = ({
  isOpen = true,
  project_id,
  onSubmit,
  onCancel,
}: IProps) => {
  const [fieldsList, setFieldList] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const onUpdate = (items: string[]) => {
    setFieldList(items);
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setError(null);

    const standardizedFieldsList = fieldsList.map((field) =>
      field.replace(/\s+/g, "_"),
    );

    if (standardizedFieldsList.length > 0) {
      try {
        const { data } = await GetAIFieldDescriptions(
          project_id,
          standardizedFieldsList,
        );
        setIsLoading(false);
        onSubmit(data.data);
      } catch (e) {
        setIsLoading(false);
        setError(e instanceof Error ? e.message : String(e));
      }
    } else {
      setIsLoading(false);
      onSubmit([]);
    }
  };

  const validateKey = (key: string) => {
    if (!/^[\w\s\u00C0-\u024F\u1E00-\u1EFF]+$/.test(key)) {
      return "Field name can only contain letters, numbers, spaces, and underscores, including accents.";
    }
    return null;
  };

  return (
    <Drawer isOpen={isOpen} onClose={onCancel} title="Add fields with AI">
      <div className="flex flex-col h-full">
        <div className="flex-grow mb-6">
          <p className="text-sm">
            Add the names of the fields you want to extract and let our magic AI
            help you out. Separate fields with a comma and press enter.
          </p>
        </div>
        <MultiSelectionTextArea
          placeholder="e.g., Invoice Number, Date, Total Amount"
          onUpdate={onUpdate}
          validate_text={validateKey}
        />

        <div className="sticky bottom-0 bg-white">
          {error && (
            <div
              className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4"
              role="alert"
            >
              <p className="font-bold">Error</p>
              <p>{error}</p>
            </div>
          )}
          <div className="flex justify-end gap-4">
            <Button onClick={onCancel} variant="light">
              Cancel
            </Button>
            <Button onClick={handleSubmit} isLoading={isLoading}>
              {isLoading ? "Processing..." : "Add Fields"}
            </Button>
          </div>
        </div>
      </div>
    </Drawer>
  );
};

export default AddFieldsAIDrawer;
