import { GetRequest, PostRequest } from "@/lib/requests";
import {
  ProcessData,
  ProcessExecutionData,
  ProcessRequest,
  ProcessResumeData,
  ProcessSuggestionRequest,
} from "@/interfaces/processes";

export const processApiUrl = "/processes";

export const GetProcess = async (processId: string) => {
  try {
    const response = await GetRequest<{ data: ProcessData }>(
      `${processApiUrl}/${processId}`,
    );
    return response;
  } catch (error) {
    throw error;
  }
};

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
      data,
    );
    return response;
  } catch (error) {
    throw error;
  }
};

export const StopProcess = async (process_id: number | string) => {
  try {
    const response = await PostRequest<{ data: ProcessResumeData }>(
      `${processApiUrl}/${process_id}/stop`,
      null,
    );
    return response;
  } catch (error) {
    throw error;
  }
};

export const ResumeProcess = async (process_id: number | string) => {
  try {
    const response = await PostRequest<{ data: ProcessResumeData }>(
      `${processApiUrl}/${process_id}/resume`,
      null,
    );
    return response;
  } catch (error) {
    throw error;
  }
};

export const GetProcessSteps = async (processId: string) => {
  try {
    const response = await GetRequest(
      `${processApiUrl}/${processId}/get-steps`,
    );
    return response;
  } catch (error) {
    throw error;
  }
};

export const GetProcessSuggestion = async (
  processData: ProcessSuggestionRequest,
) => {
  try {
    const response = await PostRequest<{ data: ProcessData[] }>(
      `${processApiUrl}/suggestion`,
      processData,
    );
    return response;
  } catch (error) {
    throw error;
  }
};
