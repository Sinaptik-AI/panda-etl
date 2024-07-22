"use client";
import React, { useState } from "react";
import Head from "next/head";
import { useParams, useRouter } from "next/navigation";
import Breadcrumb from "@/components/ui/Breadcrumb";
import File from "@/components/FileIconCard";
import { Loader2, PlusIcon } from "lucide-react";
import TabList from "@/components/ui/TabList";
import ProcessesList from "@/components/ProcessesList";
import Title from "@/components/ui/Title";
import Drawer from "@/components/ui/Drawer";
import { Button } from "@/components/ui/Button";
import {
  AddProjectAsset,
  GetProject,
  GetProjectAssets,
  FetchAssetFile,
} from "@/services/projects";
import { ProjectData } from "@/interfaces/projects";
import { useQuery } from "@tanstack/react-query";
import FileUploadCard from "@/components/FileUploadCard";
import PDFViewer from "@/components/PDFViewer";
import DragAndDrop from "@/components/DragAndDrop";
import DragOverlay from "@/components/DragOverlay";

export default function Project() {
  const params = useParams();
  const router = useRouter();
  const id = params.processId as string;

  console.log(id);

  const breadcrumbItems = [
    { label: "Process", href: "/" },
    { label: "Process 1" || "", href: `/process/1}` },
  ];

  return (
    <>
      <Head>
        <title>{`BambooETL - Process 1`}</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Breadcrumb items={breadcrumbItems} classNames="mb-8" />

      {false ? <Loader2 className="w-8 h-8 animate-spin" /> : <></>}
    </>
  );
}
