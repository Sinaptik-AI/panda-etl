"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import APIRequestForm from "@/components/APIRequestForm";
import APISaveForm from "@/components/APISaveForm";
import { APIKeyRequest, SaveAPIKey } from "@/services/user";
import { toast } from "react-hot-toast";
import LogoDark from "@/icons/LogoDark";

const ApiKeySetup: React.FC = () => {
  const [emailSent, setEmailSent] = useState<boolean>(false);
  const router = useRouter();

  const sendEmail = async (email: string) => {
    try {
      const response = await APIKeyRequest({ email: email });
      if (!response.data) {
        throw new Error("Failed to generate API key");
      }
      setEmailSent(true);
      toast.success("API key request sent. Please check your email.");
    } catch (error) {
      console.error("Error requesting API key:", error);
      toast.error("Failed to request API key. Please try again.");
    }
  };

  const saveAPIKey = async (apiKey: string) => {
    try {
      const response = await SaveAPIKey({ api_key: apiKey });
      if (!response.data) {
        throw new Error("Failed to save API key");
      }
      toast.success("API key saved successfully");
      router.push("/"); // Redirect to the main app
    } catch (error) {
      console.error("Error saving API key:", error);
      toast.error("Failed to save API key. Please try again.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 text-gray-800">
      <Card className="max-w-2xl w-full p-8 shadow-lg">
        <div className="flex flex-col items-center">
          <LogoDark width="120" height="120" />
        </div>

        <h1 className="text-3xl font-bold text-center mb-1">API key setup</h1>
        {!emailSent ? (
          <>
            <p className="text-lg text-center mb-8">
              Please configure your API key to proceed further
            </p>
            <APIRequestForm onSubmit={sendEmail} />
          </>
        ) : (
          <>
            <p className="text-lg text-center mb-8">
              Please check your email inbox for the API Key. Copy and paste the
              API key below to proceed further.
            </p>
            <APISaveForm onSubmit={saveAPIKey} />
          </>
        )}
      </Card>
    </div>
  );
};

export default ApiKeySetup;
