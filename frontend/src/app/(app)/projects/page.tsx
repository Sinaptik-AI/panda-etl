"use client";
import React, { useEffect, useState } from "react";
import Head from "next/head";
import Folder from "@/components/FolderIconCard";
import { useRouter } from "next/navigation";
import Breadcrumb from "@/components/ui/Breadcrumb";
import Title from "@/components/ui/Title";
import { Button } from "@/components/ui/Button";
import {
  PlusIcon,
  GridIcon,
  ListIcon,
  TrashIcon,
  FolderIcon,
  PencilIcon,
} from "lucide-react";
import { ProjectData } from "@/interfaces/projects";
import { GetProjects } from "@/services/projects";
import { useQuery } from "@tanstack/react-query";
import Toggle from "@/components/ui/Toggle";
import { Table, Column } from "@/components/ui/Table";
import Pagination from "@/components/ui/Pagination";
import ConfirmationDialog from "@/components/ConfirmationDialog";
import { useDeleteProject } from "@/hooks/useProjects";
import DateLabel from "@/components/ui/Date";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/ContextMenu";
import PageLoader from "@/components/ui/PageLoader";
import toast from "react-hot-toast";

export default function Projects() {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [deletedProject, setDeletedProject] = useState<ProjectData | null>(
    null,
  );
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const { mutateAsync: deleteProject, isPending: deleteLoading } =
    useDeleteProject();

  useEffect(() => {
    const storedViewMode = localStorage.getItem("projectsViewMode") as
      | "grid"
      | "table"
      | null;
    if (storedViewMode) {
      setViewMode(storedViewMode);
    } else {
      setViewMode("table");
    }
  }, []);

  const updateViewMode = (mode: "grid" | "table") => {
    setViewMode(mode);
    localStorage.setItem("projectsViewMode", mode);
  };

  const { data: response, isLoading } = useQuery({
    queryKey: ["projects", page, pageSize],
    queryFn: () => GetProjects(page, pageSize),
  });

  const projects: ProjectData[] = response?.data?.data || [];
  const totalProjects = response?.data?.total_count || 0;
  const totalPages = Math.ceil(totalProjects / pageSize);

  const handleProjectClick = (id: string) => {
    router.push(`/projects/${id}`);
  };

  const newProject = () => {
    router.push("/projects/new");
  };

  if (!isLoading && projects?.length === 0) {
    newProject();
  }

  const breadcrumbItems = [{ label: "Projects", href: "/" }];

  const viewOptions = [
    { value: "grid", icon: GridIcon },
    { value: "table", icon: ListIcon },
  ];

  const columns: Column<ProjectData>[] = [
    {
      header: "Project name",
      accessor: "name",
      label: (value: ProjectData) => (
        <div className="flex items-center">
          <FolderIcon className="mr-2 h-4 w-4" />
          <span>{value.name}</span>
        </div>
      ),
    },
    {
      header: "Last modified",
      accessor: "updated_at",
      label: (value: ProjectData) => (
        <DateLabel dateString={value.updated_at} />
      ),
    },
  ];

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleDelete = () => {
    if (deletedProject) {
      deleteProject(
        { id: deletedProject.id },
        {
          onSuccess() {
            setIsDeleteModalOpen(false);
            toast.success(
              `Project "${deletedProject.name}" has been deleted successfully.`,
            );
          },
          onError(error) {
            console.log(error);
            toast.error("Failed to delete the project. Please try again.");
          },
        },
      );
    }
  };

  const handleEdit = (project: ProjectData) => {
    router.push(`/projects/${project.id}/edit`);
  };

  return (
    <>
      <Head>
        <title>PandaETL - Projects</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Breadcrumb items={breadcrumbItems} classNames="mb-8" />
      <div className="flex justify-between items-center mb-8">
        <Title margin={false}>My projects</Title>
        <div className="flex space-x-4">
          <Toggle
            options={viewOptions}
            value={viewMode}
            onChange={(value) => updateViewMode(value as "grid" | "table")}
          />
          <Button onClick={newProject} icon={PlusIcon}>
            New project
          </Button>
        </div>
      </div>
      {isLoading && <PageLoader />}
      {projects.length > 0 && (
        <>
          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2">
              {projects.map((project) => (
                <ContextMenu key={project.id}>
                  <ContextMenuTrigger>
                    <Folder
                      key={project.id}
                      name={project.name}
                      onClick={() => handleProjectClick(project.id)}
                    />
                  </ContextMenuTrigger>

                  <ContextMenuContent className="bg-white">
                    <ContextMenuItem onClick={() => handleEdit(project)}>
                      <PencilIcon className="mr-2 h-4 w-4" />
                      Edit
                    </ContextMenuItem>
                    <ContextMenuItem
                      onClick={() => {
                        setDeletedProject(project);
                        setIsDeleteModalOpen(true);
                      }}
                    >
                      <TrashIcon className="mr-2 h-4 w-4" />
                      Delete
                    </ContextMenuItem>
                  </ContextMenuContent>
                </ContextMenu>
              ))}
            </div>
          ) : (
            <Table
              data={projects}
              columns={columns}
              onRowClick={(project) => handleProjectClick(project.id)}
              actions={[
                {
                  label: "Edit",
                  icon: <PencilIcon className="mx-1 h-4 w-4" />,
                  onClick: (project: ProjectData) => handleEdit(project),
                },
                {
                  label: "Delete",
                  icon: <TrashIcon className="mx-1 h-4 w-4" />,
                  onClick: (project: ProjectData) => {
                    setDeletedProject(project);
                    setIsDeleteModalOpen(true);
                  },
                },
              ]}
            />
          )}
          {totalPages > 1 && (
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </>
      )}

      {isDeleteModalOpen && deletedProject && (
        <ConfirmationDialog
          text={`This action will permanently remove all associated files and processes. To confirm the deletion of '${deletedProject.name}' and its data, please type '${deletedProject.name}'.`}
          onCancel={() => {
            setIsDeleteModalOpen(false);
            setDeletedProject(null);
          }}
          actionButtonText="Confirm"
          isLoading={deleteLoading}
          onSubmit={handleDelete}
          acceptanceString={deletedProject.name}
        />
      )}
    </>
  );
}
