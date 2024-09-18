import React from "react";
import File from "@/components/FileIconCard";
import { GetProjectProcesses } from "@/services/projects";
import { useQuery } from "@tanstack/react-query";
import { ProcessData, ProcessStatus } from "@/interfaces/processes";
import { useRouter } from "next/navigation";

const RecentTransformations = ({ projectId }: { projectId?: string }) => {
  const router = useRouter();
  const { data: processes } = useQuery({
    queryKey: ["processes", projectId || ""],
    queryFn: async () => {
      if (!projectId) return [];
      const response = await GetProjectProcesses(projectId);
      return response.data.data;
    },
    refetchInterval: 5000,
  });

  const handleFileClick = (process: ProcessData) => {
    router.push(`/projects/${projectId}/processes/${process.id}/csv`);
  };

  const completedProcesses =
    processes?.filter(
      (process: ProcessData) => process.status === ProcessStatus.COMPLETED,
    ) || [];

  if (completedProcesses.length === 0) {
    return null;
  }

  return (
    <>
      <h2 className="text-lg font-semibold mb-4">Recent transformations</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2 mb-8">
        {completedProcesses.map((process: ProcessData) => (
          <File
            key={process.id}
            name={`${process.name}.csv`}
            type="spreadsheet"
            onClick={() => handleFileClick(process)}
          />
        ))}
      </div>
    </>
  );
};

export default RecentTransformations;
