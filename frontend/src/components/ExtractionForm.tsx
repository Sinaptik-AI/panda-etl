"use client";
import { useState, FormEvent } from "react";
import {
  ChevronDown,
  ChevronUp,
  Loader2,
  Play,
  Plus,
  ScanEye,
  LayoutTemplate,
  Sparkles,
} from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { ProcessData, ProcessSuggestionRequest } from "@/interfaces/processes";
import { ProcessSelectionDrawer } from "./ProcessSelectionDrawer";
import { ExtractionField } from "@/interfaces/extract";
import AddFieldsAIDrawer from "./AddFieldsAIDrawer";

const FIELD_TYPES = ["text", "number", "date", "list"] as const;

type FieldType = (typeof FIELD_TYPES)[number];

interface Field {
  key: string;
  description: string;
  type: FieldType;
}

interface ExtractionFormProps {
  onSubmit: (fields: Field[]) => Promise<void>;
  onStartProcess: (fields: Field[]) => Promise<void>;
  fields: Field[];
  setFields: React.Dispatch<React.SetStateAction<Field[]>>;
  processData: ProcessSuggestionRequest;
}

export default function ExtractionForm({
  onSubmit,
  onStartProcess,
  fields,
  setFields,
  processData,
}: ExtractionFormProps) {
  const [expandedFields, setExpandedFields] = useState<Record<number, boolean>>(
    { 0: true }
  );
  const [isLoading, setIsLoading] = useState(false);
  const [displayPsModel, setDisplayPsModel] = useState<boolean>(false);
  const [displayAIFieldsModel, setDisplayAIFieldsModel] =
    useState<boolean>(false);
  const [startingProcess, setStartingProcess] = useState<boolean>(false);

  const addField = () => {
    const newField: Field = { key: "", description: "", type: "text" };
    setFields([...fields, newField]);

    if (fields.length > 0 && expandedFields[fields.length - 1]) {
      setExpandedFields((prev) => ({
        ...prev,
        [fields.length - 1]: false,
      }));
    }

    setExpandedFields((prev) => ({
      ...prev,
      [fields.length]: true,
    }));
  };

  const removeField = (index: number) => {
    const newFields = [...fields];
    newFields.splice(index, 1);
    setFields(newFields);

    const newExpandedFields = { ...expandedFields };
    delete newExpandedFields[index];
    setExpandedFields(newExpandedFields);
  };

  const updateField = (
    index: number,
    key: keyof Field,
    value: FieldType | string
  ) => {
    const newFields = [...fields];
    if (key === "key") {
      value = value.replace(/\s+/g, "_").replace(/_+/g, "_").toLowerCase();
    }
    newFields[index][key] = value as any;
    setFields(newFields);
  };

  const is_fields_empty = () => {
    return (
      (fields.length == 1 &&
        fields[0].key == "" &&
        fields[0].description == "") ||
      fields.length == 0
    );
  };

  const onStartBtnClick = async () => {
    try {
      setStartingProcess(true);
      await await onStartProcess(fields);
      setStartingProcess(false);
    } catch (error) {
      console.error("Error start process:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await onSubmit(fields);
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAIFieldsBtn = () => {
    setDisplayAIFieldsModel(true);
  };

  const onAIFieldBtnClose = () => {
    setDisplayAIFieldsModel(false);
  };

  const onCancel = async () => {
    setDisplayPsModel(false);
  };

  const handleAIFieldsSubmit = (data: ExtractionField[]) => {
    if (data.length > 0) {
      if (fields.length == 1) {
        setFields(data);
      } else {
        setFields((prevFields) => [...prevFields, ...data]);
      }
    }
    onAIFieldBtnClose();
  };

  const handleProcessSuggestion = async () => {
    setDisplayPsModel(true);
  };

  const handleProcessTemplate = async (template: ProcessData | null) => {
    if (template) {
      setFields(template.details.fields);
      setDisplayPsModel(false);
    }
  };

  const toggleField = (index: number) => {
    setExpandedFields({ ...expandedFields, [index]: !expandedFields[index] });
  };

  const validateKey = (key: string) => {
    return /^[\p{L}\p{N}_ ]+$/u.test(key);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Fields</h2>
        <div className="flex gap-2">
          <Button
            type="button"
            icon={Sparkles}
            onClick={handleAIFieldsBtn}
            variant="light"
            className="flex items-center text-md"
            iconStyles="w-4 h-4 mr-2"
          >
            Add fields with AI
          </Button>

          <Button
            type="button"
            icon={LayoutTemplate}
            onClick={handleProcessSuggestion}
            variant="light"
            className="flex items-center text-md"
            iconStyles="w-4 h-4 mr-2"
          >
            Use process as templates
          </Button>
        </div>
      </div>
      <div className="space-y-4">
        {fields?.map((field, index) => (
          <div
            key={index}
            className="bg-gray-50 rounded shadow-lg overflow-hidden"
          >
            <div
              className="flex justify-between items-center px-5 py-3 cursor-pointer"
              onClick={() => toggleField(index)}
            >
              <span>{field.key || `Field ${index + 1}`}</span>
              {expandedFields[index] ? (
                <ChevronUp size={20} />
              ) : (
                <ChevronDown size={20} />
              )}
            </div>
            <div
              className={`field-content ${
                expandedFields[index] ? "expanded" : ""
              }`}
            >
              <div className="p-4">
                <Input
                  id={`field-key-${index}`}
                  label="Field Key"
                  value={field.key}
                  onChange={(e) => updateField(index, "key", e.target.value)}
                  required
                />
                {field.key && !validateKey(field.key) && (
                  <p className="text-red-500 text-sm">
                    Key can only contain letters, numbers, and underscores.
                  </p>
                )}
                <Textarea
                  id={`field-description-${index}`}
                  label="Field Description"
                  value={field.description}
                  onChange={(e) =>
                    updateField(index, "description", e.target.value)
                  }
                  rows={3}
                />
                <Select
                  id={`field-type-${index}`}
                  label="Field Type"
                  value={field.type}
                  onChange={(e) =>
                    updateField(index, "type", e.target.value as FieldType)
                  }
                  options={FIELD_TYPES.map((type) => ({
                    value: type,
                    label: type,
                  }))}
                />
                <div className="flex justify-end space-x-2 mt-2">
                  <Button
                    type="button"
                    onClick={() => removeField(index)}
                    variant="danger"
                    outlined={true}
                    className="text-sm"
                  >
                    Remove
                  </Button>
                  <Button
                    type="button"
                    onClick={() => toggleField(index)}
                    variant="primary"
                    className="text-sm"
                  >
                    Save
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}

        <div className="bg-blue-50 rounded-lg shadow-lg border-2 border-blue-200 hover:bg-blue-100 transition-colors duration-300">
          <div
            className="flex justify-between items-center px-5 py-4 cursor-pointer"
            onClick={addField}
          >
            <span className="text-[16px] font-semibold text-primary">
              Add new field
            </span>
            <Plus className="text-primary" size={24} />
          </div>
        </div>
      </div>
      <div className="text-right space-x-4">
        <Button
          type="submit"
          isLoading={isLoading}
          disabled={is_fields_empty()}
          icon={ScanEye}
          variant="light"
        >
          Preview
        </Button>
        <Button
          type="button"
          onClick={onStartBtnClick}
          icon={startingProcess ? Loader2 : Play}
          disabled={is_fields_empty()}
          variant="primary"
        >
          Start Process
        </Button>
      </div>

      {displayPsModel && (
        <ProcessSelectionDrawer
          isOpen={displayPsModel}
          processData={processData}
          onCancel={onCancel}
          onSubmit={handleProcessTemplate}
        />
      )}

      {displayAIFieldsModel && (
        <AddFieldsAIDrawer
          isOpen={displayAIFieldsModel}
          project_id={processData.project_id}
          onSubmit={handleAIFieldsSubmit}
          onCancel={onAIFieldBtnClose}
        />
      )}
    </form>
  );
}
