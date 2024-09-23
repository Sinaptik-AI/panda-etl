"use client";
import React, { useEffect, useState } from "react";
import Head from "next/head";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Breadcrumb from "@/components/ui/Breadcrumb";
import Title from "@/components/ui/Title";
import { ProjectData } from "@/interfaces/projects";
import { GetProject } from "@/services/projects";
import { Step1 } from "./step1";
import { Step2 } from "./step2";
import { GetAPIKey } from "@/services/user";
import { ExtractionStep } from "./custom-steps/Extraction";
import { ExtractiveSummary } from "./custom-steps/ExtractiveSummary";
import { useSearchParams } from "next/navigation";
import { GetProcess } from "@/services/processes";
import PageLoader from "@/components/ui/PageLoader";

export default function NewProcess() {
  const params = useParams();
  const searchParams = useSearchParams();
  const [step, setStep] = useState<number>(1);
  const [selectedProcess, setSelectedProcess] = useState<string>("extract");
  const [selectedOutput, setSelectedOutput] = useState<string>("csv");
  const [processName, setProcessName] = useState<string>("");
  const projectId = params?.projectId as string;

  const templateId = searchParams?.get("template");
  const templateType = searchParams?.get("type");
  const templateOutput = searchParams?.get("output");

  const { data: templateProcess } = useQuery({
    queryKey: ["template-process", templateId],
    queryFn: async () => {
      if (!templateId) return null;
      const response = await GetProcess(templateId);
      return response.data.data.details;
    },
    enabled: !!templateId,
  });

  useEffect(() => {
    if (templateProcess) {
      setSelectedProcess(templateType || templateProcess.type);
      setSelectedOutput(
        templateOutput || templateProcess.output_format || "csv",
      );
    }
  }, [templateProcess, templateType, templateOutput]);

  const { data: project, isLoading } = useQuery({
    queryKey: ["project", projectId],
    queryFn: async () => {
      const response = await GetProject(projectId);
      const { data: project } = response.data;
      return project as ProjectData;
    },
  });

  const { data: apiKey } = useQuery({
    queryKey: ["apiKey"],
    queryFn: async () => {
      const response = await GetAPIKey();
      console.log(response);
      return response.data.api_key;
    },
    staleTime: 0,
    refetchOnMount: true,
  });

  const breadcrumbItems = [
    { label: "Projects", href: "/" },
    { label: project?.name || "", href: `/projects/${project?.id}` },
    { label: "New Process", href: `/projects/${project?.id}/processes/new` },
  ];

  const nextStep = () => {
    if (step === 1 && apiKey) {
      setStep(step + 2);
    } else {
      setStep(step + 1);
    }
  };

  const getProcessTitle = () => {
    if (step > 2) {
      if (selectedProcess === "extract") {
        return "New extraction";
      } else if (selectedProcess === "extractive_summary") {
        return "New extractive summary";
      }
    }

    return "New process";
  };

  return (
    <>
      <Head>
        <title>{`PandaETL - ${getProcessTitle()}`}</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="flex justify-between items-start mb-8">
        <Breadcrumb items={breadcrumbItems} />
      </div>

      <Title>{getProcessTitle()}</Title>

      {isLoading ? (
        <PageLoader />
      ) : step === 1 ? (
        <Step1
          project={project}
          selectedProcess={selectedProcess}
          setSelectedProcess={setSelectedProcess}
          selectedOutput={selectedOutput}
          setSelectedOutput={setSelectedOutput}
          processName={processName}
          setProcessName={setProcessName}
          handleProceed={nextStep}
          fromTemplate={!!templateProcess}
        />
      ) : step === 2 ? (
        <Step2 nextStep={nextStep} />
      ) : (
        project &&
        (selectedProcess === "extract" ? (
          <ExtractionStep
            setStep={setStep}
            project={project}
            outputType={selectedOutput}
            templateData={templateProcess?.fields}
            multiFields={templateProcess?.multiple_fields}
            processName={processName}
          />
        ) : selectedProcess === "extractive_summary" ? (
          <ExtractiveSummary
            setStep={setStep}
            project={project}
            outputType={selectedOutput}
            templateData={templateProcess}
            processName={processName}
          />
        ) : null)
      )}
    </>
  );
}
