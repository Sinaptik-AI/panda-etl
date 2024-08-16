"use client";
import React, { useState } from "react";
import { AppModal } from "./AppModal";
import MultiSelectionTextArea from "./ui/MultiSelectionTextArea";
import { GetAIFieldDescriptions } from "@/services/extract";
import { ExtractionField } from "@/interfaces/extract";
import DragOverlay from "./DragOverlay";
import DragAndDrop from "./DragAndDrop";
import { Input } from "./ui/Input";
import { Button } from "./ui/Button";
import { isValidURL } from "@/lib/utils";

interface IProps {
    project_id: string | undefined;
    onCancel: () => void;
    onSubmit: (type: string, data: string | FileList | null) => Promise<boolean>;
}

const AssetUploadModal = ({
    project_id,
    onSubmit,
    onCancel
}: IProps) => {

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [url, setUrl] = useState<string>("");
    const [inputError, setInputError] = useState<string>("");

    const handleFileSubmit = (fileList: FileList | null) => {
        onSubmit("file", fileList)
    }

    const handleUrlSubmit = async () => {
        if (isValidURL(url)) {
            const status = await onSubmit("url", url)
            if (!status) {
                setInputError("Something went wrong unable to add url")
            }
        }
        else {
            setInputError("Invalid URL! Please enter a valid one.")
        }
    }

    const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUrl(e.target.value)
    }   

  
    return (
        <AppModal
        closeModal={onCancel}
        isLoading={isLoading}
        modalWidth="w-[600px]"
        title="Upload"
        isFooter={false}
        >

            <div className="text-black mb-4">
            Upload file
            </div>

            <DragAndDrop
                onFileSelect={handleFileSubmit}
                accept={[".pdf", "application/pdf"]}
            />

            <div className="mt-4 text-black mb-4">
            Web URL
            </div>
            
            <div className="flex w-full gap-2 justify-start">
                <div className="flex-grow text-black">
                <Input onChange={onInputChange} error={inputError}
                 />
                 </div>

                <div>
                <Button onClick={handleUrlSubmit}>
                    Submit
                </Button>
                </div>
            </div>     

        </AppModal>
    );
    };

export default AssetUploadModal;
