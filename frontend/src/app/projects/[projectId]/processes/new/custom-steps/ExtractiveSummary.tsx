import React, { useState, useEffect, KeyboardEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Checkbox } from "@/components/ui/Checkbox";
import { Textarea } from "@/components/ui/Textarea";
import { Input } from "@/components/ui/Input";
import { ProjectData } from "@/interfaces/projects";
import { useRouter } from "next/navigation";
import { StartProcess } from "@/services/processes";
import { useQuery } from "@tanstack/react-query";
import { GetProjectAssets } from "@/services/projects";
import { AssetData } from "@/interfaces/assets";
import { Info, LayoutTemplate, Play } from "lucide-react";
import { ProcessData } from "@/interfaces/processes";
import { ProcessSelectionDrawer } from "@/components/ProcessSelectionDrawer";
import AssetViewer from "@/components/AssetViewer";
import CustomViewsPaginator from "@/components/CustomViewsPaginator";
import Tooltip from "@/components/ui/Tooltip";

interface ExtractiveSummaryProps {
  project: ProjectData;
  setStep: React.Dispatch<React.SetStateAction<number>>;
  templateData?: any;
  processName: string;
  outputType: string;
}

interface ExtractiveSummaryData {
  type: "extractive_summary";
  data: {
    highlight: boolean;
    summary_length: number;
    positive_topics: string[];
    negative_topics: string[];
    transformation_prompt: string;
    show_final_summary: boolean;
    output_type: string;
  };
}

const summaryLengthOptions = [
  { value: "2.5", label: "Short" },
  { value: "5", label: "Medium" },
  { value: "7.5", label: "Long" },
];

export const ExtractiveSummary: React.FC<ExtractiveSummaryProps> = ({
  project,
  setStep,
  templateData,
  processName,
  outputType,
}) => {
  const router = useRouter();
  const [displayPsModel, setDisplayPsModel] = useState<boolean>(false);
  const [currentAssetPreview, setCurrentAssetPreview] =
    useState<AssetData | null>(null);
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const [formData, setFormData] = useState<ExtractiveSummaryData>({
    type: "extractive_summary",
    data: {
      highlight: false,
      summary_length: 5.0,
      positive_topics: [],
      negative_topics: [],
      transformation_prompt: "",
      show_final_summary: false,
      output_type: outputType,
    },
  });

  useEffect(() => {
    if (templateData) {
      setFormData((prev) => ({
        ...prev,
        data: {
          ...prev.data,
          summary_length: templateData.summary_length || 5.0,
          highlight: templateData.highlight || false,
          positive_topics: templateData.positive_topics || [],
          negative_topics: templateData.negative_topics || [],
          show_final_summary: templateData.show_final_summary || false,
          transformation_prompt: templateData.transformation_prompt || "",
        },
      }));
    }
  }, [templateData]);

  const [positiveInput, setPositiveInput] = useState("");
  const [negativeInput, setNegativeInput] = useState("");

  const { data: assets, isLoading } = useQuery({
    queryKey: ["project", project.id],
    queryFn: async () => {
      const response = await GetProjectAssets(project.id);
      const { data: asset } = response.data;
      return asset as AssetData[];
    },
  });

  useEffect(() => {
    if (assets?.length && project) {
      setCurrentAssetPreview(assets[currentFileIndex]);
    }
  }, [assets, project, currentFileIndex]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      data: { ...prev.data, [name]: value },
    }));
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setFormData((prev) => ({
      ...prev,
      data: { ...prev.data, summary_length: parseFloat(value) },
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      data: { ...prev.data, [name]: checked },
    }));
  };

  const handleTopicKeyDown = (
    e: KeyboardEvent<HTMLInputElement>,
    type: "positive" | "negative"
  ) => {
    if (e.key === "Enter" && e.currentTarget.value.trim() !== "") {
      e.preventDefault();
      const newTopic = e.currentTarget.value.trim();
      setFormData((prev) => ({
        ...prev,
        data: {
          ...prev.data,
          [type === "positive" ? "positive_topics" : "negative_topics"]: [
            ...prev.data[
              type === "positive" ? "positive_topics" : "negative_topics"
            ],
            newTopic,
          ],
        },
      }));
      if (type === "positive") {
        setPositiveInput("");
      } else {
        setNegativeInput("");
      }
    }
  };

  const removeTopic = (type: "positive" | "negative", index: number) => {
    setFormData((prev) => ({
      ...prev,
      data: {
        ...prev.data,
        [type === "positive" ? "positive_topics" : "negative_topics"]:
          prev.data[
            type === "positive" ? "positive_topics" : "negative_topics"
          ].filter((_, i) => i !== index),
      },
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleProcessStart({
      ...formData,
      data: {
        ...formData.data,
        transformation_prompt: formData.data.show_final_summary
          ? formData.data.transformation_prompt
          : "",
      },
    });
  };

  const handleProcessStart = async (data: ExtractiveSummaryData) => {
    const { data: processData } = await StartProcess({
      name: processName,
      type: "extractive_summary",
      data: data.data,
      project_id: project.id,
    });

    router.push(`/projects/${project.id}?tab=processes`);
  };

  const handleProcessTemplate = async (template: ProcessData | null) => {
    if (template) {
      setFormData({
        type: "extractive_summary",
        data: template.details as {
          highlight: boolean;
          summary_length: number;
          positive_topics: string[];
          negative_topics: string[];
          transformation_prompt: string;
          show_final_summary: boolean;
          output_type: string;
        },
      });
      setDisplayPsModel(false);
    }
  };

  const onCancel = async () => {
    setDisplayPsModel(false);
  };

  const handleProcessSuggestion = async () => {
    setDisplayPsModel(true);
  };

  const handlePageChange = (index: number) => {
    setCurrentFileIndex(index);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <form
        onSubmit={handleSubmit}
        className="space-y-6 bg-white p-6 rounded-lg shadow"
      >
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
        <Select
          label="Summary length"
          id="summary_length"
          name="summary_length"
          options={summaryLengthOptions}
          value={formData.data.summary_length.toString()}
          onChange={handleSelectChange}
        />

        <div className="flex items-top space-x-2">
          <Checkbox
            name="highlight"
            label="Highlight key sentences"
            checked={formData.data.highlight}
            onChange={handleCheckboxChange}
          />
          <Tooltip content="You can only highlight text in standard PDFs. Highlighting isn’t available for scanned documents or websites">
            <Info className="mb-1 w-4 h-4 inline-block text-primary" />
          </Tooltip>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Focus Topics
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {formData.data.positive_topics.map((topic, index) => (
              <span
                key={index}
                className="bg-blue-100 text-primary text-xs font-medium px-2.5 py-0.5 rounded-full flex items-center"
              >
                {topic}
                <button
                  type="button"
                  onClick={() => removeTopic("positive", index)}
                  className="ml-1 text-primary hover:text-primary-dark"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <Input
            value={positiveInput}
            onChange={(e) => setPositiveInput(e.target.value)}
            onKeyDown={(e) => handleTopicKeyDown(e, "positive")}
            placeholder="Type and press Enter to add"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Negative Topics
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {formData.data.negative_topics.map((topic, index) => (
              <span
                key={index}
                className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full flex items-center"
              >
                {topic}
                <button
                  type="button"
                  onClick={() => removeTopic("negative", index)}
                  className="ml-1 text-red-600 hover:text-red-800"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <Input
            value={negativeInput}
            onChange={(e) => setNegativeInput(e.target.value)}
            onKeyDown={(e) => handleTopicKeyDown(e, "negative")}
            placeholder="Type and press Enter to add"
          />
        </div>

        <div>
          <Checkbox
            name="show_final_summary"
            label="Generate comprehensive final summary"
            checked={formData.data.show_final_summary}
            onChange={handleCheckboxChange}
          />

          {formData.data.show_final_summary && (
            <div>
              <Textarea
                name="transformation_prompt"
                label="Final summary instructions"
                value={formData.data.transformation_prompt}
                onChange={handleInputChange}
                rows={4}
              />
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <Button type="submit" icon={Play}>
            Start Process
          </Button>
        </div>
      </form>

      <div className="mt-1">
        <h2 className="text-2xl font-bold mb-5">Preview</h2>
        <CustomViewsPaginator
          totalElements={assets ? assets.length : 0}
          currentIndex={currentFileIndex}
          onChange={handlePageChange}
        />
        {currentAssetPreview && (
          <AssetViewer project_id={project.id} asset={currentAssetPreview} />
        )}
      </div>
      {displayPsModel && (
        <ProcessSelectionDrawer
          isOpen={displayPsModel}
          processData={{
            name: processName,
            type: "extractive_summary",
            project_id: project.id,
            output_type: outputType,
          }}
          onCancel={onCancel}
          onSubmit={handleProcessTemplate}
        />
      )}
    </div>
  );
};

export default ExtractiveSummary;
