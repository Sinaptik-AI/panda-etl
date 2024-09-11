"use client";
import React, { useState } from "react";

import DragAndDrop from "./DragAndDrop";
import { Button } from "./ui/Button";
import { isValidURL } from "@/lib/utils";
import Drawer from "./ui/Drawer";
import TabList from "./ui/TabList";
import { Textarea } from "@/components/ui/Textarea";

interface IProps {
  project_id: string | undefined;
  onCancel: () => void;
  onSubmit: (
    type: string,
    data: string[] | FileList | null,
  ) => Promise<boolean>;
  isOpen: boolean;
}

const projectTabs = [
  { id: "files", label: "Files" },
  { id: "url", label: "Webpages" },
];

const AssetUploadModal = ({ onSubmit, onCancel, isOpen = true }: IProps) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [textAreaInput, setTextAreaInput] = useState<string>("");
  const [inputError, setInputError] = useState<string>("");
  const [activeTab, setActiveTab] = useState<string>("files");

  const handleFileSubmit = (fileList: FileList | null) => {
    onSubmit("file", fileList);
  };

  const handleUrlSubmit = async () => {
    setIsLoading(true);
    setInputError("");

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

    if (inputError) {
      setInputError("");
    }
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
        <div className="flex flex-col space-y-6 mt-6">
          <div>
            <h2 className="text-xl font-semibold mb-2">
              Add webpages to your project
            </h2>
            <p className="text-sm text-gray-600">
              Enter one webpage URL per line in the text area below.
            </p>
          </div>

          <div>
            <Textarea
              onChange={onInputChange}
              value={textAreaInput}
              noMargin={true}
              placeholder="https://example.com"
              counter={`
                  ${
                    textAreaInput.split("\n").filter((url) => url.trim() !== "")
                      .length
                  } URLs`}
              error={inputError}
            />

            <div className="flex justify-end">
              <Button onClick={handleUrlSubmit} isLoading={isLoading}>
                Add webpages
              </Button>
            </div>
          </div>
        </div>
      )}
    </Drawer>
  );
};

export default AssetUploadModal;
