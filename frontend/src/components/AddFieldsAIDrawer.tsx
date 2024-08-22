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
    isOpen=true,
    project_id,
    onSubmit,
    onCancel
}: IProps) => {

    const [fieldsList, setFieldList] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const onUpdate = (items: string[]) => {
        setFieldList(items)
    }

    const handleSubmit = async () => {
        setIsLoading(true)
        setError(null)

        const standardizedFieldsList = fieldsList.map(field => field.replace(/\s+/g, '_'));

        if (standardizedFieldsList.length > 0) {
            try{
                const { data } = await GetAIFieldDescriptions(project_id, standardizedFieldsList)
                setIsLoading(false)
                onSubmit(data.data)
            } 
            catch(e) {
                setIsLoading(false)
                setError(e instanceof Error ? e.message : String(e));
            } 
        } else {
            setIsLoading(false)
            onSubmit([])
        }
        
    }
    
    const validateKey = (key: string) => {
        if (!/^[\w\s\u00C0-\u024F\u1E00-\u1EFF]+$/.test(key)) {
            return "Field name can only contain letters, numbers, spaces, and underscores, including accents.";
        }
        return null;
      };
  
    return (
        <Drawer
            isOpen={isOpen}
            onClose={onCancel}
            title={"Add Fields with AI"}
            >
            <div className="text-gray-700 mb-4">
            Add the names of the fields you want to extract and let our magic AI help you out.
            </div>
            <MultiSelectionTextArea placeholder="Type in fields. Separate them with a comma and press enter" 
                    onUpdate={onUpdate} validate_text={validateKey}/>

            
            <div className="flex sticky bottom-0 bg-white border-t border-gray-200 p-4 gap-4 justify-center">

                <div className="flex flex-col gap-4 justify-center">
                {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
                <div className="flex gap-4">
                    <Button
                        onClick={onCancel}
                        variant="danger"
                        outlined
                    >
                        Cancel
                    </Button>

                    <Button
                        onClick={handleSubmit}
                        isLoading={isLoading}
                        >
                        Save
                    </Button>
                </div>
                </div>
                

                </div>

        </Drawer>
        
    );
    };

export default AddFieldsAIDrawer;
