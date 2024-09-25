"use client";
import React, { useEffect, useState } from "react";
import Head from "next/head";
import Breadcrumb from "@/components/ui/Breadcrumb";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Loader2 } from "lucide-react";
import TabList from "@/components/ui/TabList";
import Title from "@/components/ui/Title";
import { useGetAPIKey, useUpdateAPIKey } from "@/hooks/useUser";
import { Card } from "@/components/ui/Card";
import { useQuery } from "@tanstack/react-query";
import { GetUserUsageData } from "@/services/user";
import { ApiUsage } from "@/interfaces/user";

interface SettingsGroup {
  id: string;
  label: string;
  component: React.ReactNode;
}

const ApiKeysSettings: React.FC = () => {
  const [apiKey, setApiKey] = useState<string>("xxx-xxx-xxx-xxx");
  const { data: apiKeyResponse } = useGetAPIKey();
  const { mutateAsync: updateAPIKey, isPending } = useUpdateAPIKey();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    updateAPIKey(
      { api_key: apiKey },
      {
        onSuccess(response: any) {
          alert(response?.data?.message);
        },
        onError(error) {
          console.log(error);
        },
      },
    );
  };

  useEffect(() => {
    if (apiKeyResponse) {
      setApiKey(apiKeyResponse?.data?.api_key);
    }
  }, [apiKeyResponse]);

  return (
    <Card>
      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          label={"API key"}
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
        />
        <Button
          type="submit"
          disabled={isPending}
          className="w-full flex items-center justify-center"
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Updating...
            </>
          ) : (
            "Save Changes"
          )}
        </Button>
      </form>
    </Card>
  );
};

const ApiUsageSettings: React.FC = () => {
  const [apiUsage, setApiUsage] = useState<ApiUsage>({
    credits_used: 100,
    total_credits: 100,
  });

  const { data: usageData, isLoading } = useQuery({
    queryKey: ["userUsage"],
    queryFn: GetUserUsageData,
  });

  console.log(usageData);

  useEffect(() => {
    if (usageData?.data?.data) {
      setApiUsage(usageData.data.data);
    }
  }, [usageData]);

  if (isLoading) {
    return <div>Loading usage data...</div>;
  }

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        API Usage
      </label>
      <div className="flex flex-col items-center mt-1 gap-4">
        <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
          <div
            className="bg-primary h-2.5 rounded-full"
            style={{
              width: `${((apiUsage.total_credits - apiUsage.credits_used) / apiUsage.total_credits) * 100}%`,
            }}
          ></div>
        </div>
        <p className="ml-2 text-sm text-gray-500">
          {apiUsage.total_credits - apiUsage.credits_used} /{" "}
          {apiUsage.total_credits}
        </p>
      </div>
    </div>
  );
};

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("api-keys");

  const settingsGroups: SettingsGroup[] = [
    { id: "api-keys", label: "API Keys", component: <ApiKeysSettings /> },
    { id: "api-usage", label: "API Usage", component: <ApiUsageSettings /> },
  ];

  const breadcrumbItems = [{ label: "Settings", href: "/settings" }];

  return (
    <>
      <Head>
        <title>PandaETL - Settings</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Breadcrumb items={breadcrumbItems} classNames="mb-8" />

      <div className="max-w-2xl">
        <Title>Settings</Title>

        <TabList
          tabs={settingsGroups}
          onTabChange={setActiveTab}
          defaultActiveTab="api-keys"
        />

        {settingsGroups.find((group) => group.id === activeTab)?.component}
      </div>
    </>
  );
}
