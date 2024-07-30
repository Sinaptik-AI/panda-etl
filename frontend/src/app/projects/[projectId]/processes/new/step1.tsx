import React from "react";
import {
  FileText,
  Highlighter,
  FileInput,
  Key,
  ArrowRight,
  FileSearch,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/RadioGroup";
import { ProjectData } from "@/interfaces/projects";

type ProcessOption = {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  disabled: boolean;
};

type OutputOption = {
  id: string;
  label: string;
  disabled: boolean;
};

interface Step1Props {
  project: ProjectData | undefined;
  selectedProcess: string;
  setSelectedProcess: React.Dispatch<React.SetStateAction<string>>;
  selectedOutput: string;
  setSelectedOutput: React.Dispatch<React.SetStateAction<string>>;
  handleProceed: () => void;
  processName: string;
  setProcessName: React.Dispatch<React.SetStateAction<string>>;
}

export const Step1: React.FC<Step1Props> = ({
  project,
  selectedProcess,
  setSelectedProcess,
  selectedOutput,
  setSelectedOutput,
  handleProceed,
  processName,
  setProcessName,
}) => {
  const processOptions: ProcessOption[] = [
    { id: "extract", label: "Extract", icon: FileText, disabled: false },
    {
      id: "extractive_summary",
      label: "Summary",
      icon: FileSearch,
      disabled: false,
    },
    { id: "highlight", label: "Highlight", icon: Highlighter, disabled: true },
    { id: "fill-form", label: "Fill Form", icon: FileInput, disabled: true },
    { id: "key-sentences", label: "Key Sentences", icon: Key, disabled: true },
  ];

  const outputOptions: OutputOption[] = [
    { id: "csv", label: "CSV", disabled: false },
    { id: "json", label: "JSON", disabled: true },
    { id: "xml", label: "XML", disabled: true },
    { id: "pdf", label: "PDF", disabled: true },
  ];

  const selectProcessType = (option: ProcessOption) => {
    if (option.disabled) return;
    setSelectedProcess(option.id);
  };

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h4 className="text-lg font-bold mb-2">Process name</h4>
        <input
          type="text"
          value={processName}
          onChange={(e) => setProcessName(e.target.value)}
          placeholder="Enter process name"
          className="w-full p-2 border rounded"
        />
      </div>

      <p className="text-gray-500">{project?.description}</p>

      <div className="space-y-8">
        <div>
          <h4 className="text-lg font-bold mb-4">Select process</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {processOptions.map((option) => (
              <Card
                key={option.id}
                className={`p-4 cursor-pointer ${
                  option.disabled ? "opacity-50 cursor-not-allowed" : ""
                } ${
                  selectedProcess === option.id
                    ? "border-blue-500 border-2"
                    : ""
                }`}
                onClick={() => selectProcessType(option)}
              >
                <option.icon className="w-8 h-8 mb-2" />
                <h3 className="font-semibold">{option.label}</h3>
              </Card>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-lg font-bold mb-4">Select output</h4>
          <RadioGroup
            value={selectedOutput}
            onValueChange={setSelectedOutput}
            className="flex space-x-4"
          >
            {outputOptions.map((option) => (
              <div key={option.id} className="flex items-center space-x-2">
                <RadioGroupItem
                  value={option.id}
                  id={option.id}
                  disabled={option.disabled}
                  label={option.label}
                />
              </div>
            ))}
          </RadioGroup>
        </div>

        <Button onClick={handleProceed}>
          Proceed <ArrowRight />
        </Button>
      </div>
    </div>
  );
};
