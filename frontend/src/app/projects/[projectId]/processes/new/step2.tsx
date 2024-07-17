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
import APIRequestForm from "@/components/APIRequestForm";
import { APIKeyRequest } from "@/services/user";

interface Step2Props {
  setStep: React.Dispatch<React.SetStateAction<number>>;
}

export const Step2: React.FC<Step2Props> = ({ setStep }) => {

  const [emailSent, setEmailSent] = useState<boolean>(false);

  const sendEmail = async(email: string) => {
    const response = await APIKeyRequest({ email: email});

    if (!response.data) {
      throw new Error("Failed to generate api key");
    }
    setEmailSent(true)

  }


  return (
    <>
      
        { !emailSent && <>
        Please configure your API key to proceed further
        <APIRequestForm onSubmit={sendEmail}/> 
        </>}

        {
          emailSent && <div>
          API key sent to your email address please add in the settings to proceed further
            </div>
        }

    </>
  );
};
