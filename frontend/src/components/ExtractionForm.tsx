"use client";
import { useState, FormEvent } from "react";
import { ChevronDown, ChevronUp, Loader2, Play, Plus, ScanEye } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";

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
}

export default function ExtractionForm({ onSubmit, onStartProcess }: ExtractionFormProps) {
  const [fields, setFields] = useState<Field[]>([
    {
      key: "",
      description: "",
      type: "text",
    },
  ]);
  const [expandedFields, setExpandedFields] = useState<Record<number, boolean>>(
    { 0: true }
  );
  const [isLoading, setIsLoading] = useState(false);
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
    return (fields.length == 1 && fields[0].key=="" && fields[0].description=="") || fields.length == 0
  }

  const onStartBtnClick = async () => {
    try {
      setStartingProcess(true)
      await await onStartProcess(fields);
      setStartingProcess(false)
    } catch (error) {
      console.error("Error start process:", error);
    } finally {
      setIsLoading(false);
    }
  }

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

  const toggleField = (index: number) => {
    setExpandedFields({ ...expandedFields, [index]: !expandedFields[index] });
  };

  const validateKey = (key: string) => {
    return /^[a-zA-Z0-9_]+$/.test(key);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Fields</h2>
        <Button
          type="button"
          icon={Plus}
          onClick={addField}
          variant="primary"
          className="flex items-center"
        >
          Add Field
        </Button>
      </div>
      <div className="space-y-4">
        {fields.map((field, index) => (
          <div key={index} className="bg-gray-50 rounded shadow-lg">
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
            {expandedFields[index] && (
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
                <div className="text-right">
                  <Button
                    type="button"
                    onClick={() => removeField(index)}
                    variant="danger"
                    className="mt-2"
                  >
                    Remove
                  </Button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="text-right space-x-4">
        <Button
          type="submit"
          isLoading={isLoading}
          disabled={is_fields_empty()}
          icon={ScanEye}
          variant="secondary"
        >
          Preview
        </Button>
        <Button
          type="button"
          onClick={onStartBtnClick}
          icon={startingProcess? Loader2: Play}
          disabled={is_fields_empty()}
          variant="primary"
        >
          Start Process
        </Button>
      </div>
    </form>
  );
}
