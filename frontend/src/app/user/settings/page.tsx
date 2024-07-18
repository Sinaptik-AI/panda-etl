"use client";
import React, { useEffect, useState } from "react";
import Head from "next/head";
import Breadcrumb from "@/components/ui/Breadcrumb";
import { Button } from "@/components/ui/Button";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/Input";
import Title from "@/components/ui/Title";
import { GetUserData, UpdateUserData } from "@/services/user";

export interface UserData {
  first_name: string;
  last_name: string;
  email: string;
}

export default function UserSettings() {
  const [userData, setUserData] = useState<UserData>({
    first_name: "",
    last_name: "",
    email: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setUserData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    UpdateUserData(userData)
      .then((response) => {
        alert(response?.data?.message);
      })
      .catch((error) => {
        console.log(error);
      })
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    GetUserData().then((response) => {
      const user = response?.data?.data;
      setUserData({
        email: user?.email,
        first_name: user?.first_name || "",
        last_name: user?.last_name || "",
      });
    });
  }, []);

  const breadcrumbItems = [{ label: "User Settings", href: "/user-settings" }];

  return (
    <>
      <Head>
        <title>BambooETL - User Settings</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Breadcrumb items={breadcrumbItems} classNames="mb-8" />

      <div className="max-w-2xl">
        <Title>User Settings</Title>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <Input
              id="first_name"
              label="First Name"
              name="first_name"
              value={userData.first_name}
              onChange={handleInputChange}
              required
            />
            <Input
              id="last_name"
              label="Last Name"
              name="last_name"
              value={userData.last_name}
              onChange={handleInputChange}
              required
            />
          </div>
          <Input
            id="email"
            name="email"
            label="Email"
            type="email"
            value={userData.email}
            onChange={handleInputChange}
            required
          />
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </form>
      </div>
    </>
  );
}
