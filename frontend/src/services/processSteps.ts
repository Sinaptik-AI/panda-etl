import {
  ProcessStepData,
  ProcessStepOutputRef,
} from "./../interfaces/processSteps";
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

export const GetProcessStepReferences = async (
  processStepId: number | string,
): Promise<ProcessStepOutputRef> => {
  try {
    const response = await GetRequest<{ data: ProcessStepOutputRef }>(
      `${processStepApiUrl}/${processStepId}/references`,
    );
    return response.data.data;
  } catch (error) {
    throw error;
  }
};
