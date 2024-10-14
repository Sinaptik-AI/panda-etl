"use client";
import React from "react";
import Drawer from "./ui/Drawer";
import { GetProcessStepReferences } from "@/services/processSteps";
import { useQuery } from "@tanstack/react-query";
import HighlightPdfViewer from "../ee/components/HighlightPdfViewer";
import { FlattenedSource, Source } from "@/interfaces/processSteps";
import { BASE_STORAGE_URL } from "@/constants";

interface IProps {
  process_step_id: string;
  column_name: string;
  filename: string;
  index: number;
  isOpen?: boolean;
  onCancel: () => void;
}

const ExtractReferenceDrawer = ({
  isOpen = true,
  process_step_id,
  column_name,
  filename,
  index,
  onCancel,
}: IProps) => {
  const { data, error, isLoading } = useQuery({
    queryKey: ["processStepReferences", process_step_id],
    queryFn: async () => {
      return await GetProcessStepReferences(process_step_id);
    },
  });

  const output = data?.output_reference?.[index]?.[column_name] ?? null;

  const filtered_output = data?.output_reference?.[index].filter(
    (item: Source) => item.name == column_name
  );

  const filteredSourceDetails: FlattenedSource[] = [];

  filtered_output?.forEach((item: Source) => {
    const { sources, page_numbers } = item;

    // Iterate through sources and page_numbers together
    for (let i = 0; i < sources.length; i++) {
      // Ensure the index exists in page_numbers
      if (i < page_numbers.length) {
        filteredSourceDetails.push({
          source: sources[i],
          page_number: page_numbers[i],
        });
      }
    }
  });

  const file_url =
    data?.project_id && filename
      ? `${BASE_STORAGE_URL}/${data?.project_id}/${filename}`
      : null;
  if (!filename) {
    console.error("Filename is required to display the reference");
  }

  return (
    <Drawer isOpen={isOpen} onClose={onCancel} title={column_name}>
      {file_url && (
        <HighlightPdfViewer
          file={file_url}
          highlightSources={filteredSourceDetails}
        />
      )}
    </Drawer>
  );
};

export default ExtractReferenceDrawer;
