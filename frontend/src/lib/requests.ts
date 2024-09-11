import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import { BASE_API_URL } from "@/constants";

export const axiosInstance = axios.create({
  baseURL: BASE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 60000,
});

export async function GetRequest<T>(
  url: string,
  options?: AxiosRequestConfig,
): Promise<AxiosResponse> {
  try {
    const response = await axiosInstance.get<T>(url, options);
    return response;
  } catch (error) {
    throw error;
  }
}

export async function PostRequest<T>(
  url: string,
  requestData: object | null,
  headers = {},
  timeout?: number,
): Promise<AxiosResponse> {
  try {
    const isFormData = requestData instanceof FormData;
    const defaultHeaders = {
      "Content-Type": isFormData ? "multipart/form-data" : "application/json",
    };
    const updatedHeader = { ...defaultHeaders, ...headers };
    const response = await axiosInstance.post<T>(url, requestData, {
      headers: updatedHeader,
      timeout,
    });
    return response;
  } catch (error) {
    throw error;
  }
}

export async function PutRequest(
  url: string,
  data: object,
): Promise<AxiosResponse<any, any>> {
  try {
    const response = await axiosInstance.put(url, data);
    return response;
  } catch (error) {
    throw error;
  }
}

export async function DeleteRequest(
  url: string,
): Promise<AxiosResponse<any, any>> {
  try {
    const response = await axiosInstance.delete(url);
    return response;
  } catch (error) {
    throw error;
  }
}
