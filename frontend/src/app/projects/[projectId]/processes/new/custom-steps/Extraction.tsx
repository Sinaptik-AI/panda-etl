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
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import WebsiteViewer from "@/components/WebsiteViewer";

interface ExtractionStepProps {
  project: ProjectData;
  setStep: React.Dispatch<React.SetStateAction<number>>;
  outputType: string;
  templateData?: any;
  processName: string;
}

export const ExtractionStep: React.FC<ExtractionStepProps> = ({
  project,
  setStep,
  templateData,
  outputType,
  processName,
}) => {
  const router = useRouter();
  const [pdfFileUrl, setPdfFileUrl] = useState<string>("");
  const [url, setUrl] = useState<string | null>(null)
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const [fields, setFields] = useState<ExtractionField[]>(
    templateData ?? [
      {
        key: "",
        description: "",
        type: "text",
      },
    ]
  );
  const [extractionFields, setExtractionFields] = useState<ExtractionField[]>(
    []
  );
  const [extractionResult, setExtractionResult] =
    useState<ExtractionResult | null>(null);

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
      const { data } = await Extract(project.id, assets[currentFileIndex].id, fields);
      if (Array.isArray(data.data)) {
        setExtractionResult(data.data[0]);
      } else {
          setExtractionResult(data.data);
      }
    }
    
  };

  const handleProcessStart = async (fields: ExtractionField[]) => {
    const { data } = await StartProcess({
      name: processName,
      type: "extract",
      data: {
        fields: fields,
        output_type: outputType
      },
      project_id: project.id
    });
    router.push(`/projects/${project.id}?tab=processes`);
  };

  const goToPreviousDocument = () => {
    setCurrentFileIndex((prevIndex) => Math.max(prevIndex - 1, 0));
  };

  const goToNextDocument = () => {
    setCurrentFileIndex((prevIndex) => Math.min(prevIndex + 1, assets? assets.length - 1: 0));
  };

  const handleDocChange = (e: any) => {
    if (e.target.value && e.target.value !== undefined && e.target.value < (assets? assets.length: 0)) {
      setCurrentFileIndex(Math.max(e.target.value - 1, 0))
    }

  }

  useEffect(() => {
    if (assets?.length && project) {
      if (assets?.[currentFileIndex].type == "url") {
        setUrl(assets?.[currentFileIndex].details.url as string)
      } else {
        setPdfFileUrl(
          `${BASE_STORAGE_URL}/${project.id}/${assets?.[currentFileIndex].filename}`
        );
      }
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
          processData={{
            name: processName,
            type: "extract",
            project_id: project.id,
            output_type: outputType,
          }}
        />
        <div className="lg:sticky lg:top-0 lg:self-start">
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
          <div className="flex justify-between items-center w-full mb-4">
            <Button
              onClick={goToPreviousDocument}
              disabled={currentFileIndex === 0}
            >
              <ArrowLeft size={16} />
            </Button>
            <Input
              type="number"
              value={currentFileIndex + 1}
              onChange={handleDocChange}
              min="1"
              max={assets ? assets.length : 1}
              style={{ flex: 1, textAlign: 'center', margin: '0 10px' }}
              noMargin
            />
            <Button
              onClick={goToNextDocument}
              disabled={currentFileIndex === (assets ? assets.length - 1 : 0)}
            >
            <ArrowRight size={16} />
            </Button>
          </div>
          {  assets?.[currentFileIndex].type == "url"?  url && <WebsiteViewer url={url}/> : pdfFileUrl && <PDFViewer url={pdfFileUrl} />}
        </div>
      </div>
    </>
  );
};
