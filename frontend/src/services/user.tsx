import { GetRequest, PostRequest, PutRequest } from "@/lib/requests";
import { APIKeyData } from "@/interfaces/user";
import { UserData } from "@/interfaces/user";
import localStorage from "@/lib/localStorage";

const userApiUrl = "/user";

export const APIKeyRequest = async (data: { email: string }) => {
  try {
    const response = await PostRequest<{ data: null }>(
      `${userApiUrl}/request-api-key`,
      data,
    );
    return response;
  } catch (error) {
    throw error;
  }
};

export const SaveAPIKey = async (data: { api_key: string }) => {
  try {
    const response = await PostRequest<{ data: null }>(
      `${userApiUrl}/save-api-key`,
      data,
    );
    localStorage.setItem("api_key", data.api_key);
    return response;
  } catch (error) {
    throw error;
  }
};

export const GetAPIKey = async () => {
  const storedApiKey = localStorage.getItem("api_key");
  if (storedApiKey) {
    return { data: { api_key: storedApiKey } };
  }

  try {
    const response = await GetRequest<{ data: APIKeyData }>(
      `${userApiUrl}/get-api-key`,
    );
    return { data: { api_key: response.data.data.key } };
  } catch (error) {
    throw error;
  }
};

export const UpdateUserData = async (data: UserData) => {
  try {
    const response = await PutRequest(`${userApiUrl}/update-user-info`, data);
    return response;
  } catch (error) {
    throw error;
  }
};

export const GetUserData = async () => {
  try {
    const response = await GetRequest(`${userApiUrl}/getme`);
    return response;
  } catch (error) {
    throw error;
  }
};

export const GetUserUsageData = async () => {
  try {
    const response = await GetRequest(`${userApiUrl}/usage`);
    return response;
  } catch (error) {
    throw error;
  }
};
