import { GetRequest, PostRequest } from "@/lib/requests";
import {
  ProcessData,
  ProcessExecutionData,
  ProcessRequest,
} from "@/interfaces/processes";

export const processApiUrl = "/processes";

export const GetProcesses = async () => {
  try {
    const response = await GetRequest<{ data: ProcessData[] }>(processApiUrl);
    return response;
  } catch (error) {
    throw error;
  }
};

export const StartProcess = async (data: ProcessRequest) => {
  try {
    const response = await PostRequest<{ data: ProcessExecutionData }>(
      `${processApiUrl}/start`,
      data
    );
    return response;
  } catch (error) {
    throw error;
  }
};

export const GetProcessSteps = async (processId: string) => {
  try {
    const response = await GetRequest(
      `${processApiUrl}/${processId}/get-steps`
    );
    return response;
  } catch (error) {
    throw error;
  }
};
