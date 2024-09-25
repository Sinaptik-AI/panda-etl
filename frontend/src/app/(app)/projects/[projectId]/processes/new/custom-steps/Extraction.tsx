import React, { useEffect, useState } from "react";
import { ProjectData } from "@/interfaces/projects";
import { useQuery } from "@tanstack/react-query";
import { GetProjectAssets } from "@/services/projects";
import { AssetData } from "@/interfaces/assets";
import ExtractionForm from "@/components/ExtractionForm";
import { ExtractionField, ExtractionResult } from "@/interfaces/extract";
import { Extract } from "@/services/extract";
import { StartProcess } from "@/services/processes";
import { useRouter } from "next/navigation";
import AssetViewer from "@/components/AssetViewer";
import CustomViewsPaginator from "@/components/CustomViewsPaginator";
import Drawer from "@/components/ui/Drawer";
import toast from "react-hot-toast";
import { AxiosError } from "axios";

interface ExtractionStepProps {
  project: ProjectData;
  setStep: React.Dispatch<React.SetStateAction<number>>;
  outputType: string;
  templateData?: any;
  processName: string;
  multiFields: boolean;
}

export const ExtractionStep: React.FC<ExtractionStepProps> = ({
  project,
  setStep,
  templateData,
  outputType,
  processName,
  multiFields,
}) => {
  const router = useRouter();
  const [currentAssetPreview, setCurrentAssetPreview] =
    useState<AssetData | null>(null);
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const [fields, setFields] = useState<ExtractionField[]>(
    templateData ?? [{ key: "", description: "", type: "text" }],
  );
  const [extractionFields, setExtractionFields] = useState<ExtractionField[]>(
    [],
  );
  const [extractionResult, setExtractionResult] =
    useState<ExtractionResult | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const { data: assets, isLoading } = useQuery({
    queryKey: ["project", project.id],
    queryFn: async () => {
      const response = await GetProjectAssets(project.id);
      const { data: asset } = response.data;
      return asset as AssetData[];
    },
  });

  const handleSubmit = async (fields: ExtractionField[]) => {
    setExtractionFields(fields);
    if (assets && assets.length !== 0) {
      const { data } = await Extract(
        project.id,
        assets[currentFileIndex].id,
        fields,
      );
      if (Array.isArray(data.data)) {
        setExtractionResult(data.data[0]);
      } else {
        setExtractionResult(data.data);
      }
      setIsPreviewOpen(true);
    }
  };

  const handleProcessStart = async (
    fields: ExtractionField[],
    multiFields: boolean,
  ) => {
    try {
      const { data } = await StartProcess({
        name: processName,
        type: "extract",
        data: {
          fields: fields,
          output_type: outputType,
          multiple_fields: multiFields,
        },
        project_id: project.id,
      });
      router.push(`/projects/${project.id}?tab=processes`);
    } catch (error) {
      if (
        error instanceof AxiosError &&
        "status" in error &&
        error.status === 402
      ) {
        toast.error(error.response?.data.detail);
      }
    }
  };

  const handlePageChange = (index: number) => {
    setCurrentFileIndex(index);
  };

  useEffect(() => {
    if (assets?.length && project) {
      setCurrentAssetPreview(assets?.[currentFileIndex]);
    }
  }, [assets, project, currentFileIndex]);

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ExtractionForm
          onSubmit={handleSubmit}
          onStartProcess={handleProcessStart}
          fields={fields}
          setFields={setFields}
          multiField={multiFields}
          processData={{
            name: processName,
            type: "extract",
            project_id: project.id,
            output_type: outputType,
          }}
        />
        <div className="lg:sticky lg:top-0 lg:self-start">
          <CustomViewsPaginator
            totalElements={assets ? assets.length : 0}
            currentIndex={currentFileIndex}
            onChange={handlePageChange}
          />
          {currentAssetPreview && (
            <AssetViewer project_id={project.id} asset={currentAssetPreview} />
          )}
        </div>
      </div>

      <Drawer
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        title="Extraction preview"
      >
        {extractionResult && (
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <div className="grid grid-cols-1 gap-4">
              {extractionFields.map((field, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded shadow">
                  <h3 className="font-bold mb-2">{field.key}</h3>
                  <p>
                    {Array.isArray(extractionResult[field.key])
                      ? (extractionResult[field.key] as string[]).join(", ")
                      : extractionResult[field.key] || "N/A"}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </Drawer>
    </>
  );
};
