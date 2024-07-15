"use client";
import Head from "next/head";
import { useParams } from "next/navigation";
import Breadcrumb from "@/components/ui/Breadcrumb";
import { Loader2 } from "lucide-react";
import Title from "@/components/ui/Title";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/RadioGroup";
import {
  FileText,
  Highlighter,
  FileInput,
  Key,
  ArrowRight,
} from "lucide-react";
import axios from "axios";
import { ProjectData } from "@/interfaces/projects";
import { GetProject } from "@/services/projects";

const processOptions = [
  { id: "extract", label: "Extract", icon: FileText, disabled: false },
  { id: "highlight", label: "Highlight", icon: Highlighter, disabled: true },
  { id: "fill-form", label: "Fill Form", icon: FileInput, disabled: true },
  { id: "key-sentences", label: "Key Sentences", icon: Key, disabled: true },
];

const outputOptions = [
  { id: "csv", label: "CSV", disabled: false },
  { id: "json", label: "JSON", disabled: true },
  { id: "xml", label: "XML", disabled: true },
  { id: "pdf", label: "PDF", disabled: true },
];

export default function NewProcess() {
  const params = useParams();
  const [selectedProcess, setSelectedProcess] = useState("extract");
  const [selectedOutput, setSelectedOutput] = useState("csv");
  const projectId = params.projectId as string;
  const [isLoading, setIsLoading] = useState(true);
  const [project, setProject] = useState<ProjectData | null>(null);

  useEffect(() => {
    GetProject(projectId).then((response) => {
      const { data: project } = response.data;
      setProject(project);
      setIsLoading(false);
    });
  }, []);

  const breadcrumbItems = [
    { label: "Projects", href: "/" },
    { label: project?.name || "", href: `/projects/${project?.id}` },
    { label: "New Process", href: `/projects/${project?.id}/processes/new` },
  ];

  const selectProcessType = (option: (typeof processOptions)[0]) => {
    if (option.disabled) return;
    setSelectedProcess(option.id);
  };

  const handleProceed = () => {
    console.log("Proceeding with:", {
      process: selectedProcess,
      output: selectedOutput,
    });
  };

  return (
    <>
      <Head>
        {<title>{`BambooETL - ${project?.name}`}</title>}
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="flex justify-between items-start mb-8">
        <Breadcrumb items={breadcrumbItems} />
      </div>

      <div className="max-w-2xl">
        <Title>{project?.name}</Title>

        {isLoading ? (
          <Loader2 className="w-8 h-8 animate-spin" />
        ) : (
          <>
            <p className="text-gray-500">{project?.description}</p>

            <div className="space-y-8">
              <div>
                <h4 className="text-lg font-bold mb-4">Select process</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {processOptions.map((option) => (
                    <Card
                      key={option.id}
                      className={`p-4 cursor-pointer ${
                        option.disabled ? "opacity-50 cursor-not-allowed" : ""
                      } ${
                        selectedProcess === option.id
                          ? "border-blue-500 border-2"
                          : ""
                      }`}
                      onClick={() => selectProcessType(option)}
                    >
                      <option.icon className="w-8 h-8 mb-2" />
                      <h3 className="font-semibold">{option.label}</h3>
                    </Card>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-lg font-bold mb-4">Select output</h4>
                <RadioGroup
                  value={selectedOutput}
                  onValueChange={setSelectedOutput}
                  className="flex space-x-4"
                >
                  {outputOptions.map((option) => (
                    <div
                      key={option.id}
                      className="flex items-center space-x-2"
                    >
                      <RadioGroupItem
                        value={option.id}
                        id={option.id}
                        disabled={option.disabled}
                        label={option.label}
                      />
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <Button onClick={handleProceed}>
                Proceed <ArrowRight />
              </Button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
