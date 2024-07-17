import { GetRequest, PostRequest } from "@/lib/requests";
import { ProjectData } from "@/interfaces/projects";
import { APIKeyData } from "@/interfaces/user";

const userApiUrl = "/user";

export const APIKeyRequest = async (data: {
  email: string;
}) => {
  try {
    const response = await PostRequest<{ data: null }>(
      `${userApiUrl}/request-api-key`,
      data
    );
    return response;
  } catch (error) {
    throw error;
  }
};


export const SaveAPIKey = async (data: {
  api_key: string;
}) => {
  try {
    const response = await PostRequest<{ data: null }>(
      `${userApiUrl}/save-api-key`,
      data
    );
    return response;
  } catch (error) {
    throw error;
  }
}

export const GetAPIKey = async () => {
  try {
    const response = await GetRequest<{ data: APIKeyData }>(`${userApiUrl}/get-api-key`);
    return response;
  } catch (error) {
    throw error;
  }
}