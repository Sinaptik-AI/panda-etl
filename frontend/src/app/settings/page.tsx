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
      }
    );
  };

  useEffect(() => {
    if (apiKeyResponse) {
      setApiKey(apiKeyResponse?.data?.data.key);
    }
  }, [apiKeyResponse]);

  return (
    <form onSubmit={handleSubmit}>
      <Input
        label={"API Key"}
        type="password"
        value={apiKey}
        onChange={(e) => setApiKey(e.target.value)}
      />
      <Button
        type="submit"
        disabled={isPending}
        className="mt-6 w-full flex items-center justify-center"
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
  );
};

const ApiUsageSettings: React.FC = () => {
  const [apiUsage, setApiUsage] = useState<number>(246);

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        API Usage
      </label>
      <div className="flex items-center mt-1">
        <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
          <div
            className="bg-primary h-2.5 rounded-full"
            style={{ width: `${(apiUsage / 1000) * 100}%` }}
          ></div>
        </div>
        <p className="ml-2 text-sm text-gray-500">{apiUsage} / 1000</p>
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
        <title>BambooETL - Settings</title>
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
