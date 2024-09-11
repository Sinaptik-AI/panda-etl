import { GetRequest, PostRequest, PutRequest } from "@/lib/requests";
import { APIKeyData } from "@/interfaces/user";
import { UserData } from "@/interfaces/user";

const userApiUrl = "/user";

export const APIKeyRequest = async (data: { email: string }) => {
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

export const SaveAPIKey = async (data: { api_key: string }) => {
  try {
    const response = await PostRequest<{ data: null }>(
      `${userApiUrl}/save-api-key`,
      data
    );
    return response;
  } catch (error) {
    throw error;
  }
};

export const GetAPIKey = async () => {
  try {
    const response = await GetRequest<{ data: APIKeyData }>(
      `${userApiUrl}/get-api-key`
    );
    return response;
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
