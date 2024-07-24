import { DeleteAssets, DeleteProject } from "@/services/projects";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useDeleteProject = () => {
  const queryClient = useQueryClient();
  const { data, isPending, error, isError, mutateAsync } = useMutation({
    mutationFn: (params: { id: string }) => DeleteProject(params.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
  return { data, isPending, error, isError, mutateAsync };
};

export const useDeleteAssets = () => {
  const queryClient = useQueryClient();
  const { data, isPending, error, isError, mutateAsync } = useMutation({
    mutationFn: (params: { projectId: string; assetId: string }) =>
      DeleteAssets(params.projectId, params.assetId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projectAssets"] });
    },
  });
  return { data, isPending, error, isError, mutateAsync };
};
