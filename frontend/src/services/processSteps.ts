import { ProcessStepData } from "./../interfaces/processSteps";
import { ProcessStepResponse } from "@/interfaces/processSteps";
import { GetRequest } from "@/lib/requests";

export const processStepApiUrl = "/process_steps";

export const GetProcessStep = async (
  processStepId: number,
): Promise<ProcessStepResponse> => {
  try {
    const response = await GetRequest<{ data: ProcessStepData }>(
      `${processStepApiUrl}/${processStepId}`,
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};
