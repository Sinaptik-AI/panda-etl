"use client";
import React, { useState, useEffect } from "react";
import Head from "next/head";
import { useParams, useRouter } from "next/navigation";
import Breadcrumb from "@/components/ui/Breadcrumb";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import Title from "@/components/ui/Title";
import { GetProject, UpdateProject } from "@/services/projects";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ProjectData } from "@/interfaces/projects";
import toast from "react-hot-toast";
import { Card } from "@/components/ui/Card";
import PageLoader from "@/components/ui/PageLoader";

export default function EditProject() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const projectId = params?.projectId as string;

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const { data: project, isLoading } = useQuery({
    queryKey: ["project", projectId],
    queryFn: async () => {
      const response = await GetProject(projectId);
      return response.data.data as ProjectData;
    },
  });

  useEffect(() => {
    if (project) {
      setName(project.name);
      setDescription(project.description || "");
    }
  }, [project]);

  const updateProjectMutation = useMutation({
    mutationFn: (data: { name: string; description: string }) =>
      UpdateProject(projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project", projectId] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast.success("Project updated successfully");
      router.push(`/projects/${projectId}`);
    },
    onError: () => {
      toast.error("Failed to update project");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProjectMutation.mutate({ name, description });
  };

  const breadcrumbItems = [
    { label: "Projects", href: "/" },
    { label: project?.name || "", href: `/projects/${projectId}` },
    { label: "Edit", href: `/projects/${projectId}/edit` },
  ];

  if (isLoading) return <PageLoader />;

  return (
    <>
      <Head>
        <title>PandaETL - Edit project</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Breadcrumb items={breadcrumbItems} classNames="mb-8" />

      <Title margin={false}>Edit project</Title>
      <Card className="max-w-2xl bg-white mt-4">
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <Textarea
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
          />

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="light"
              onClick={() => router.push(`/projects/${projectId}`)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={updateProjectMutation.isPending}
              isLoading={updateProjectMutation.isPending}
            >
              {updateProjectMutation.isPending
                ? "Updating..."
                : "Update project"}
            </Button>
          </div>
        </form>
      </Card>
    </>
  );
}
