import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import { BASE_API_URL } from "@/constants";

export const axiosInstance = axios.create({
  baseURL: BASE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export async function GetRequest<T>(
  url: string,
  options?: AxiosRequestConfig
): Promise<AxiosResponse<T>> {
  try {
    const response = await axiosInstance.get<T>(url, options);
    return response;
  } catch (error) {
    throw error;
  }
}

export async function PostRequest<T>(
  url: string,
  requestData: object,
  headers = {}
): Promise<AxiosResponse<T, any>> {
  try {
    const isFormData = requestData instanceof FormData;
    const defaultHeaders = {
      'Content-Type': isFormData ? 'multipart/form-data' : 'application/json',
    };
    const updatedHeader = { ...defaultHeaders, ...headers };

    const response = await axiosInstance.post<T>(url, requestData, {
      headers: updatedHeader,
    });
    return response;
  } catch (error) {
    throw error;
  }
}
