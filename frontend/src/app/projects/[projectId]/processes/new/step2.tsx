import React from "react";
import { ProjectData } from "@/interfaces/projects";
import { useQuery } from "@tanstack/react-query";
import { GetProjectAssets } from "@/services/projects";
import { AssetData } from "@/interfaces/assets";
import ExtractionForm from "@/components/ExtractionForm";
import { ExtractionField } from "@/interfaces/extract";
import PDFViewer from "@/components/PDFViewer";
import { BASE_STORAGE_URL } from "@/constants";

interface Step2Props {
  project: ProjectData;
  setStep: React.Dispatch<React.SetStateAction<number>>;
}

export const Step2: React.FC<Step2Props> = ({ project, setStep }) => {
  const { data: assets, isLoading } = useQuery({
    queryKey: ["project", project.id],
    queryFn: async () => {
      const response = await GetProjectAssets(project.id);
      const { data: asset } = response.data;
      return asset as AssetData[];
    },
  });

  const handleSubmit = (data: ExtractionField[]) => {
    console.log(data);
  };

  const pdfFileUrl = `${BASE_STORAGE_URL}/${assets?.[0].filename}`;

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ExtractionForm onSubmit={handleSubmit} />
        <div>
          <h2 className="text-2xl font-bold mb-4">PDF Preview</h2>
          <PDFViewer url={pdfFileUrl} />
        </div>
      </div>
    </>
  );
};
