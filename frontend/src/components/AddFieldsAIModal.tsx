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
        const { data } = await GetAIFieldDescriptions(project_id, fieldsList)
        setIsLoading(false)
        onSubmit(data.data)
    }
    
    const validateKey = (key: string) => {
       if (!/^[a-zA-Z0-9_]+$/.test(key)){
        return "Field name can only contain characters, numbers and underscore"
       }
       return null
      };
  
    return (
        <AppModal
        closeModal={onCancel}
        actionButtonText="Generate"
        handleSubmit={handleSubmit}
        isLoading={isLoading}
        modalWidth="w-[600px]"
        >
            <MultiSelectionTextArea onUpdate={onUpdate} validate_text={validateKey}/>
        </AppModal>
    );
    };

export default AddFieldsAIModal;
