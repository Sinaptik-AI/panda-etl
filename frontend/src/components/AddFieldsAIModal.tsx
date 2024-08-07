"use client";
import React, { useState } from "react";
import { AppModal } from "./AppModal";
import MultiSelectionTextArea from "./ui/MultiSelectionTextArea";
import { GetAIFieldDescriptions } from "@/services/extract";
import { ExtractionField } from "@/interfaces/extract";

interface IProps {
    project_id: string;
    onCancel: () => void;
    onSubmit: (data: ExtractionField[]) => void;
}

const AddFieldsAIModal = ({
    project_id,
    onSubmit,
    onCancel
}: IProps) => {

    const [fieldsList, setFieldList] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const onUpdate = (items: string[]) => {
        setFieldList(items)
    }

    const handleSubmit = async () => {
        setIsLoading(true)

        const standardizedFieldsList = fieldsList.map(field => field.replace(/\s+/g, '_'));

        if (standardizedFieldsList.length > 0) {
            const { data } = await GetAIFieldDescriptions(project_id, standardizedFieldsList)
            setIsLoading(false)
            onSubmit(data.data)
        } else {
            setIsLoading(false)
            onSubmit([])
        }
        
    }
    
    const validateKey = (key: string) => {
        if (!/^[\p{L}\p{N}_ ]+$/u.test(key)) {
          return "Field name can only contain letters, numbers, spaces, and underscores, including accents.";
        }
        return null;
      };
  
    return (
        <AppModal
        closeModal={onCancel}
        actionButtonText="Generate"
        handleSubmit={handleSubmit}
        isLoading={isLoading}
        modalWidth="w-[600px]"
        title="Add Fields with AI"
        >
            <div className="text-gray-700 mb-4">
            Add the names of the fields you want to extract and let our magic AI help you out.
            </div>
            <MultiSelectionTextArea placeholder="Type in fields. Separate them with a comma and press enter" 
                    onUpdate={onUpdate} validate_text={validateKey}/>
        </AppModal>
    );
    };

export default AddFieldsAIModal;
