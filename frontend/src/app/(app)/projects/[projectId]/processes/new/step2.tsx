import React, { useEffect, useState } from "react";
import APIRequestForm from "@/components/APIRequestForm";
import { APIKeyRequest, SaveAPIKey } from "@/services/user";
import APISaveForm from "@/components/APISaveForm";
import { Card } from "@/components/ui/Card";

interface Step2Props {
  nextStep: () => void;
}

export const Step2: React.FC<Step2Props> = ({ nextStep }) => {
  const [emailSent, setEmailSent] = useState<boolean>(false);

  const sendEmail = async (email: string) => {
    const response = await APIKeyRequest({ email: email });

    if (!response.data) {
      throw new Error("Failed to generate api key");
    }
    setEmailSent(true);
  };
  const saveAPIKey = async (apiKey: string) => {
    const response = await SaveAPIKey({ api_key: apiKey });

    if (!response.data) {
      throw new Error("Failed to save api key");
    }
    nextStep();
  };

  return (
    <Card className="max-w-2xl">
      {!emailSent && (
        <>
          Please configure your API key to proceed further
          <APIRequestForm onSubmit={sendEmail} />
        </>
      )}
      {emailSent && (
        <div>
          Please check your email inbox for API Key copy and paste the api key
          below to proceed further
          <div className="flex flex-col mt-8">
            <APISaveForm onSubmit={saveAPIKey} />
          </div>
        </div>
      )}
    </Card>
  );
};
