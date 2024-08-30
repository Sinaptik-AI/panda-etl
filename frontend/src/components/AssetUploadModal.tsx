"use client";
import React, { useState } from "react";

import DragAndDrop from "./DragAndDrop";
import { Button } from "./ui/Button";
import { isValidURL } from "@/lib/utils";
import Drawer from "./ui/Drawer";
import TabList from "./ui/TabList";

interface IProps {
  project_id: string | undefined;
  onCancel: () => void;
  onSubmit: (
    type: string,
    data: string[] | FileList | null
  ) => Promise<boolean>;
  isOpen: boolean;
}

const projectTabs = [
  { id: "files", label: "Files" },
  { id: "url", label: "URL" },
];

const AssetUploadModal = ({ onSubmit, onCancel, isOpen = true }: IProps) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [textAreaInput, setTextAreaInput] = useState<string>("");
  const [inputError, setInputError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("files");

  const handleFileSubmit = (fileList: FileList | null) => {
    onSubmit("file", fileList);
  };

  const handleUrlSubmit = async () => {
    setIsLoading(true);
    setInputError(null);

    const urls = textAreaInput
      .split("\n")
      .map((url) => url.trim())
      .filter((url) => url !== "");

    for (const url of urls) {
      if (!isValidURL(url)) {
        setInputError(`Invalid URL found: ${url}. Please enter valid URLs.`);
        setIsLoading(false);
        return;
      }
    }

    try {
      const status = await onSubmit("url", urls);
      if (!status) {
        setInputError("Something went wrong, unable to add URLs.");
      }
    } catch (error) {
      setInputError("An error occurred while submitting the URLs.");
    }

    setTextAreaInput("");
    setIsLoading(false);
  };

  const onInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTextAreaInput(e.target.value);
  };

  return (
    <Drawer isOpen={isOpen} onClose={onCancel} title={"Add docs"}>
      <TabList
        tabs={projectTabs}
        onTabChange={(tabId) => setActiveTab(tabId)}
        defaultActiveTab={activeTab}
      />
      {activeTab === "files" && (
        <>
          <DragAndDrop
            onFileSelect={handleFileSubmit}
            accept={[".pdf", "application/pdf"]}
          />
        </>
      )}

      {activeTab === "url" && (
        <>
          <div className="mt-4 text-black mb-4">Website URL</div>

          <div className="flex w-full gap-2 justify-start">
            <div className="flex-grow text-black">
              <textarea
                onChange={onInputChange}
                value={textAreaInput}
                className="w-full p-2 border border-gray-300 rounded"
                placeholder="Paste each URL on a new line"
              />
            </div>
            {inputError && (
              <p className="mt-1 text-sm text-red-600">{inputError}</p>
            )}
            <div>
              <Button onClick={handleUrlSubmit} isLoading={isLoading}>
                Submit
              </Button>
            </div>
          </div>
        </>
      )}
    </Drawer>
  );
};

export default AssetUploadModal;
