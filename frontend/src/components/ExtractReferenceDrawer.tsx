"use client";
import React from "react";
import Drawer from "./ui/Drawer";
import { GetProcessStepReferences } from "@/services/processSteps";
import { useQuery } from "@tanstack/react-query";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { markify_text } from "@/lib/utils";

interface IProps {
  process_step_id: string;
  column_name: string;
  isOpen?: boolean;
  onCancel: () => void;
}

const ExtractReferenceDrawer = ({
  isOpen = true,
  process_step_id,
  column_name,
  onCancel,
}: IProps) => {
  const { data, error, isLoading } = useQuery({
    queryKey: ["processStepReferences", process_step_id],
    queryFn: async () => {
      return await GetProcessStepReferences(process_step_id);
    },
  });

  const output = data?.output_reference?.[0]?.[column_name] ?? null; // hardcoded index 0 need to change for multi

  return (
    <Drawer isOpen={isOpen} onClose={onCancel} title={column_name}>
      <div className="text-black bg-gray-50 p-4 rounded-lg">
        <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
          {output && markify_text(output)}
        </ReactMarkdown>
      </div>
    </Drawer>
  );
};

export default ExtractReferenceDrawer;
