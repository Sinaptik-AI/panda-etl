"use client";
import { useState, FormEvent, ChangeEvent } from "react";
import { ChevronDown, ChevronUp, Loader2, Plus } from "lucide-react";

const FIELD_TYPES = ["text", "number", "date", "list"] as const;

type FieldType = (typeof FIELD_TYPES)[number];

interface Field {
  key: string;
  description: string;
  type: FieldType;
}

interface ExtractionFormProps {
  onSubmit: (fields: Field[]) => Promise<void>;
}

export default function ExtractionForm({ onSubmit }: ExtractionFormProps) {
  const [fields, setFields] = useState<Field[]>([]);
  const [expandedFields, setExpandedFields] = useState<Record<number, boolean>>(
    {}
  );
  const [isLoading, setIsLoading] = useState(false);

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
    newFields[index][key] = value;
    setFields(newFields);
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
        <button
          type="button"
          onClick={addField}
          className="p-2 bg-blue-500 text-white rounded flex items-center"
        >
          <Plus size={20} className="mr-1" />
          Add Field
        </button>
      </div>
      <div className="space-y-4">
        {fields.map((field, index) => (
          <div key={index} className="bg-gray-50 rounded shadow-lg">
            <div
              className="flex justify-between items-center p-2 cursor-pointer"
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
                <div className="mb-2">
                  <input
                    type="text"
                    placeholder="Field key"
                    value={field.key}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      updateField(index, "key", e.target.value)
                    }
                    className="mb-1 p-2 w-full text-gray-900 bg-light-900"
                    required
                  />
                  {field.key && !validateKey(field.key) && (
                    <p className="text-red-500 text-sm">
                      Key can only contain letters, numbers, and underscores.
                    </p>
                  )}
                </div>
                <textarea
                  placeholder="Field description"
                  value={field.description}
                  onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                    updateField(index, "description", e.target.value)
                  }
                  className="mb-2 p-2 w-full h-24 text-gray-900 bg-light-900"
                />
                <select
                  value={field.type}
                  onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                    updateField(index, "type", e.target.value)
                  }
                  className="mb-2 p-2 w-full text-gray-900 bg-light-900"
                >
                  {FIELD_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
                <div className="text-right">
                  <button
                    type="button"
                    onClick={() => removeField(index)}
                    className="p-2 bg-red-500 text-white rounded mt-2"
                  >
                    Remove
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      <button
        type="submit"
        className={`p-2 text-white rounded flex items-center justify-center w-full ${
          fields.length === 0 || isLoading
            ? "bg-gray-500 cursor-not-allowed"
            : "bg-green-500"
        }`}
        disabled={fields.length === 0 || isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          "Extract Data"
        )}
      </button>
    </form>
  );
}
