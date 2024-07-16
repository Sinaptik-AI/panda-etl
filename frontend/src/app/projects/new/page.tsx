"use client";
import React, { useState } from "react";
import Head from "next/head";
import { useRouter } from "next/navigation";
import Breadcrumb from "@/components/ui/Breadcrumb";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import Title from "@/components/ui/Title";
import { CreateProject } from "@/services/projects";
import { useQueryClient } from "@tanstack/react-query";

export default function NewProject() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [titleError, setTitleError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTitleError("");

    if (!title.trim()) {
      setTitleError("Title is required");
      return;
    }

    setIsLoading(true);

    try {
      const response = await CreateProject({ title, description });

      if (!response.data) {
        throw new Error("Failed to create project");
      }

      const { data } = response.data;

      queryClient.invalidateQueries({ queryKey: ["projects"] });

      router.push(`/projects/${data.id}`);
    } catch (error) {
      console.error("Error creating project:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const breadcrumbItems = [
    { label: "Projects", href: "/" },
    { label: "New", href: "/projects/new" },
  ];

  return (
    <>
      <Head>
        <title>BambooETL - Create New Project</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Breadcrumb items={breadcrumbItems} classNames="mb-8" />

      <div className="max-w-2xl">
        <Title>Create new project</Title>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Title"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (e.target.value.trim()) setTitleError("");
            }}
            required
            error={titleError}
          />

          <Textarea
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
          />

          <Button
            type="submit"
            disabled={isLoading}
            isLoading={isLoading}
            className="w-full flex items-center justify-center"
          >
            Create Project
          </Button>
        </form>
      </div>
    </>
  );
}
