"use client";
import React, { useState } from "react";
import {
  ProcessData,
  ProcessStatus,
  ProcessSuggestionRequest,
} from "@/interfaces/processes";
import { useQuery } from "@tanstack/react-query";
import { GetProcessSuggestion } from "@/services/processes";
import Drawer from "./ui/Drawer";
import SelectableAccordion from "./ui/SelectableAccordion";
import DateLabel from "./ui/Date";
import Label from "./ui/Label";
import { Button } from "./ui/Button";

const statusLabel = (process: ProcessData) => {
  switch (process.status) {
    case ProcessStatus.COMPLETED:
      return <Label status="success">Completed</Label>;
    case ProcessStatus.FAILED:
      return <Label status="error">Failed</Label>;
    case ProcessStatus.IN_PROGRESS:
      return <Label status="warning">In Progress</Label>;
    case ProcessStatus.PENDING:
      return <Label status="info">Pending</Label>;
    case ProcessStatus.STOPPED:
      return <Label status="default">Stopped</Label>;
    default:
      return "-" + process.status;
  }
};

interface IProps {
  isOpen: boolean;
  processData: ProcessSuggestionRequest;
  onCancel: () => void;
  onSubmit: (process: ProcessData | null) => void;
}

export const ProcessSelectionDrawer = ({
  isOpen,
  processData,
  onCancel,
  onSubmit,
}: IProps) => {
  const [selectedTemplate, setSelectedTemplate] = useState<ProcessData | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);

  const { data: suggestedProcesses, isLoading } = useQuery({
    queryKey: [
      "template-suggestion",
      processData.name,
      processData.type,
      processData.output_type,
      processData.project_id,
    ],
    queryFn: async () => {
      try {
        const response = await GetProcessSuggestion(processData);
        return response.data.data;
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
        return [];
      }
    },
    enabled: !!processData,
  });

  const handleSubmit = () => {
    onSubmit(selectedTemplate);
  };

  const handleChipClick = (template: ProcessData) => {
    setSelectedTemplate(template);
  };

  return (
    <Drawer isOpen={isOpen} onClose={onCancel} title="Suggested templates">
      <div className="flex flex-col h-full">
        <div className="flex-grow mb-6">
          <p className="text-sm">
            Select a template from the suggested processes below.
          </p>
        </div>
        <div className="flex-1 overflow-auto">
          {isLoading ? (
            <p>Loading suggested templates...</p>
          ) : (
            <div className="flex flex-col gap-2">
              {suggestedProcesses?.map(
                (process: ProcessData, index: number) => (
                  <SelectableAccordion
                    key={`process-suggest-${index}`}
                    title={
                      process.name && process.name?.length > 0
                        ? process.name
                        : "extract"
                    }
                    isSelected={
                      selectedTemplate !== null &&
                      selectedTemplate.id === process.id
                    }
                    onSelect={() => handleChipClick(process)}
                  >
                    <div className="space-y-6">
                      <div className="grid grid-cols-3 gap-4">
                        <div className="bg-gray-100 p-4 rounded-lg">
                          <h3 className="text-sm font-semibold text-gray-500 mb-2">
                            ID
                          </h3>
                          <p className="text-lg font-bold">{process.id}</p>
                        </div>
                        <div className="bg-gray-100 p-4 rounded-lg overflow-hidden">
                          <h3 className="text-sm font-semibold text-gray-500 mb-2">
                            Type
                          </h3>
                          <p className="text-sm font-semibold truncate">
                            {process.type}
                          </p>
                        </div>
                        <div className="bg-gray-100 p-4 rounded-lg">
                          <h3 className="text-sm font-semibold text-gray-500 mb-2">
                            Status
                          </h3>
                          <div className="mt-1">{statusLabel(process)}</div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-100 p-4 rounded-lg">
                          <h3 className="text-sm font-semibold text-gray-500 mb-2">
                            Start Time
                          </h3>
                          <DateLabel dateString={process.created_at} />
                        </div>
                        <div className="bg-gray-100 p-4 rounded-lg">
                          <h3 className="text-sm font-semibold text-gray-500 mb-2">
                            Completed at
                          </h3>
                          {process.completed_at ? (
                            <DateLabel dateString={process.completed_at} />
                          ) : (
                            <p className="text-lg font-bold">-</p>
                          )}
                        </div>
                      </div>
                    </div>
                    <div
                      className="mt-4 border rounded-lg p-4 bg-gray-100 overflow-auto"
                      style={{ maxHeight: "400px" }}
                    >
                      <pre className="text-sm text-gray-800 whitespace-pre-wrap">
                        {process.details?.fields
                          ? JSON.stringify(process.details.fields, null, 2)
                          : JSON.stringify(process.details, null, 2)}
                      </pre>
                    </div>
                  </SelectableAccordion>
                ),
              )}
            </div>
          )}
        </div>
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
          <div className="flex justify-end gap-4 mt-2">
            <Button onClick={onCancel} variant="light">
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={selectedTemplate == null || isLoading}
            >
              {isLoading ? "Loading..." : "Select"}
            </Button>
          </div>
        </div>
      </div>
    </Drawer>
  );
};
