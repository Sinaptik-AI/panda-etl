import React, { useEffect, useState } from "react";
import { ProjectData } from "@/interfaces/projects";
import { useQuery } from "@tanstack/react-query";
import { GetProjectAssets } from "@/services/projects";
import { AssetData } from "@/interfaces/assets";
import ExtractionForm from "@/components/ExtractionForm";
import { ExtractionField, ExtractionResult } from "@/interfaces/extract";
import PDFViewer from "@/components/PDFViewer";
import { BASE_STORAGE_URL } from "@/constants";
import { Extract } from "@/services/extract";
import { StartProcess } from "@/services/processes";
import { useRouter } from "next/navigation";

interface ExtractionStepProps {
  project: ProjectData;
  setStep: React.Dispatch<React.SetStateAction<number>>;
}

export const ExtractionStep: React.FC<ExtractionStepProps> = ({
  project,
  setStep,
}) => {
  const router = useRouter();
  const [pdfFileUrl, setPdfFileUrl] = useState<string>("");
  const [extractionFields, setExtractionFields] = useState<ExtractionField[]>(
    []
  );
  const [extractionResult, setExtractionResult] =
    useState<ExtractionResult | null>(null);

  const { data: assets, isLoading } = useQuery({
    queryKey: ["project", project.id],
    queryFn: async () => {
      const response = await GetProjectAssets(project.id, 1, 1);
      const { data: asset } = response.data;
      return asset as AssetData[];
    },
  });

  const handleSubmit = async (fields: ExtractionField[]) => {
    setExtractionFields(fields);
    const { data } = await Extract(project.id, fields);
    setExtractionResult(data.data);
  };

  const handleProcessStart = async (fields: ExtractionField[]) => {
    const { data } = await StartProcess({
      type: "extract",
      details: {
        fields: fields,
      },
      project_id: project.id,
    });
    router.push(`/projects/${project.id}?tab=processes`);
  };

  useEffect(() => {
    if (assets?.length && project) {
      setPdfFileUrl(
        `${BASE_STORAGE_URL}/${project.id}/${assets?.[0].filename}`
      );
    }
  }, [assets, project]);

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ExtractionForm
          onSubmit={handleSubmit}
          onStartProcess={handleProcessStart}
        />
        <div className="mt-1">
          {extractionResult && (
            <>
              <h2 className="text-2xl font-bold mb-5">Extraction preview</h2>
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
            </>
          )}

          <h2 className="text-2xl font-bold mb-5">PDF preview</h2>
          {pdfFileUrl && <PDFViewer url={pdfFileUrl} />}
        </div>
      </div>
    </>
  );
};
