import { useQuery } from "@tanstack/react-query";
import { GetProcessStep } from "@/services/processSteps";

export const useProcessStep = (processStepId: number) => {
  return useQuery({
    queryKey: ["processStep", processStepId],
    queryFn: () => GetProcessStep(processStepId),
    enabled: !!processStepId,
  });
};
