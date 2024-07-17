import { GetRequest } from "@/lib/requests";
import { ProcessData } from "@/interfaces/processes";

const processApiUrl = "/processes";

export const GetProcesses = async () => {
  try {
    const response = await GetRequest<{ data: ProcessData[] }>(processApiUrl);
    return response;
  } catch (error) {
    throw error;
  }
};
