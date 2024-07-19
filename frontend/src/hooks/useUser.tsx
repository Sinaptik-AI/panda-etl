import { GetAPIKey, SaveAPIKey } from "@/services/user";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useGetAPIKey = () => {
  const { data, isLoading, error, isError } = useQuery({
    queryKey: ["useGetAPIKey"],
    queryFn: GetAPIKey,
  });
  return { data, isLoading, error, isError };
};

export const useUpdateAPIKey = () => {
  const queryClient = useQueryClient();
  const { data, isPending, error, isError, mutateAsync } = useMutation({
    mutationFn: (params: any) => SaveAPIKey(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["useGetAPIKey"] });
    },
  });
  return { data, isPending, error, isError, mutateAsync };
};
