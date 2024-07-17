"use client";
import React, { useState } from "react";
import Head from "next/head";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Breadcrumb from "@/components/ui/Breadcrumb";
import { Loader2 } from "lucide-react";
import Title from "@/components/ui/Title";
import { ProjectData } from "@/interfaces/projects";
import { GetProject } from "@/services/projects";
import { Step1 } from "./step1";
import { Step2 } from "./step2";
import { Step3 } from "./step3";
import { GetAPIKey } from "@/services/user";

export default function NewProcess() {
  const params = useParams();
  const [step, setStep] = useState<number>(1);
  const [selectedProcess, setSelectedProcess] = useState<string>("extract");
  const [selectedOutput, setSelectedOutput] = useState<string>("csv");
  const projectId = params.projectId as string;

  const { data: project, isLoading } = useQuery({
    queryKey: ["project", projectId],
    queryFn: async () => {
      const response = await GetProject(projectId);
      const { data: project } = response.data;
      return project as ProjectData;
    },
  });

  const { data: apiKey } = useQuery({
    queryKey: [],
    queryFn: async () => {
      const response = await GetAPIKey();
      const { data: key } = response.data;
      return key;
    },
  });
  
  const breadcrumbItems = [
    { label: "Projects", href: "/" },
    { label: project?.name || "", href: `/projects/${project?.id}` },
    { label: "New Process", href: `/projects/${project?.id}/processes/new` },
  ];

  const nextStep = () => {
    if (step === 1 && apiKey) {
      setStep(step + 2)
    } else {
      setStep(step + 1);
    }
  };

  return (
    <>
      <Head>
        <title>{`BambooETL - New process`}</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="flex justify-between items-start mb-8">
        <Breadcrumb items={breadcrumbItems} />
      </div>

      <Title>New process</Title>

      {isLoading ? (
        <Loader2 className="w-8 h-8 animate-spin" />
      ) : step === 1 ? (
        <Step1
          project={project}
          selectedProcess={selectedProcess}
          setSelectedProcess={setSelectedProcess}
          selectedOutput={selectedOutput}
          setSelectedOutput={setSelectedOutput}
          handleProceed={nextStep}
        />
      ) : step === 2? (
      <Step2 nextStep={nextStep} />
      ): project && <Step3 setStep={setStep} project={project} />}
    </>
  );
}
