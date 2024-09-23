import React, { useState, useRef, useEffect } from "react";
import { FileText, ArrowRight, FileSearch } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/RadioGroup";
import { ProjectData } from "@/interfaces/projects";
import Tooltip from "@/components/ui/Tooltip";
import { Input } from "@/components/ui/Input";

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
  fromTemplate?: boolean;
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
  fromTemplate = false,
}) => {
  const [nameError, setNameError] = useState<string | null>(null);
  const processNameInputRef = useRef<HTMLInputElement>(null);
  const processOptions: ProcessOption[] = [
    { id: "extract", label: "Extract", icon: FileText, disabled: false },
    // {
    //   id: "extractive_summary",
    //   label: "Summary",
    //   icon: FileSearch,
    //   disabled: false,
    // },
    // { id: "highlight", label: "Highlight", icon: Highlighter, disabled: true },
    // { id: "fill-form", label: "Fill Form", icon: FileInput, disabled: true },
    // { id: "key-sentences", label: "Key Sentences", icon: Key, disabled: true },
  ];

  const outputOptions: OutputOption[] = [
    { id: "csv", label: "CSV", disabled: false },
    { id: "json", label: "JSON", disabled: true },
    { id: "xml", label: "XML", disabled: true },
    { id: "pdf", label: "PDF", disabled: true },
  ];

  const selectProcessType = (option: ProcessOption) => {
    if (option.disabled || fromTemplate) return;
    setSelectedProcess(option.id);
  };

  const validateName = () => {
    if (!processName.trim()) {
      setNameError("Process name is required");
      return false;
    }
    setNameError(null);
    return true;
  };

  const handleProceedWithValidation = () => {
    if (validateName()) {
      handleProceed();
    } else {
      processNameInputRef.current?.focus();
    }
  };

  useEffect(() => {
    if (nameError) {
      processNameInputRef.current?.focus();
    }
  }, [nameError]);

  const tooltipContent = "This option cannot be changed when using a template.";

  return (
    <Card className="max-w-2xl">
      <div className="mb-6">
        <h4 className="text-lg font-bold mb-2">Process name</h4>
        <Input
          ref={processNameInputRef}
          type="text"
          value={processName}
          onChange={(e) => {
            setProcessName(e.target.value);
            if (nameError) validateName();
          }}
          placeholder="Enter process name"
          autofocus={true}
          error={nameError}
        />
      </div>

      <p className="text-gray-500">{project?.description}</p>

      <div className="space-y-8">
        <div>
          <h4 className="text-lg font-bold mb-4">Select process</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {processOptions.map((option) => (
              <Tooltip
                key={option.id}
                content={
                  fromTemplate && option.id !== selectedProcess
                    ? tooltipContent
                    : ""
                }
              >
                <Card
                  size="small"
                  className={`cursor-pointer ${
                    option.disabled ||
                    (fromTemplate && option.id !== selectedProcess)
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  } ${
                    selectedProcess === option.id
                      ? "border-indigo-500 border-2"
                      : ""
                  }`}
                  onClick={() => selectProcessType(option)}
                >
                  <option.icon className="w-6 h-6 mb-2" />
                  <h3 className="font-semibold">{option.label}</h3>
                </Card>
              </Tooltip>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-lg font-bold mb-4">Select output</h4>
          <RadioGroup
            value={selectedOutput}
            onValueChange={fromTemplate ? undefined : setSelectedOutput}
            className="flex space-x-4"
          >
            {outputOptions.map((option) => (
              <Tooltip
                key={option.id}
                content={
                  fromTemplate && option.id !== selectedOutput
                    ? tooltipContent
                    : ""
                }
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem
                    value={option.id}
                    id={option.id}
                    disabled={
                      option.disabled ||
                      (fromTemplate && option.id !== selectedOutput)
                    }
                    label={option.label}
                  />
                </div>
              </Tooltip>
            ))}
          </RadioGroup>
        </div>

        <Button onClick={handleProceedWithValidation}>
          Proceed <ArrowRight />
        </Button>
      </div>
    </Card>
  );
};
