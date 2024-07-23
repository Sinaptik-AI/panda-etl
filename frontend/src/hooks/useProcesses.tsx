import { GetProcessSteps } from "@/services/processes";
import { useQuery } from "@tanstack/react-query";

export const useGetProcessSteps = (processId: string) => {
  const { data, isLoading, error, isError } = useQuery({
    queryKey: ["useGetProcessSteps", processId],
    queryFn: () => GetProcessSteps(processId),
  });
  return { data, isLoading, error, isError };
};
