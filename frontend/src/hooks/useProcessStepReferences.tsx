import { useQuery } from "@tanstack/react-query";
import { GetProcessStepReferences } from "@/services/processSteps";

export const useProcessStepReferences = (process_step_id: string) => {
  return useQuery({
    queryKey: ["processStepReferences", process_step_id],
    queryFn: async () => {
      return await GetProcessStepReferences(process_step_id);
    },
  });
};
