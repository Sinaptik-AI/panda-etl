"use client";
import React from "react";
import Drawer from "./ui/Drawer";
import HighlightPdfViewer from "../ee/components/HighlightPdfViewer";
import { FlattenedSource, Source } from "@/interfaces/processSteps";
import { BASE_STORAGE_URL } from "@/constants";

interface IProps {
  filename: string;
  project_id: number;
  sources: FlattenedSource[];
  isOpen?: boolean;
  onCancel: () => void;
}

const ChatReferenceDrawer = ({
  isOpen = true,
  project_id,
  sources,
  filename,
  onCancel,
}: IProps) => {
  let file_url = null;
  if (isOpen) {
    file_url =
      project_id && filename
        ? `${BASE_STORAGE_URL}/${project_id}/${filename}`
        : null;
    if (!filename) {
      console.error("Filename is required to display the reference");
    }
  }

  return (
    <Drawer isOpen={isOpen} onClose={onCancel} title="Chat Reference">
      {file_url && (
        <HighlightPdfViewer file={file_url} highlightSources={sources} />
      )}
    </Drawer>
  );
};

export default ChatReferenceDrawer;
