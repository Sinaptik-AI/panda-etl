import axios from "axios";
import { GetRequest, PostRequest } from "@/lib/requests";
import {
  ChatRequest,
  ChatResponse,
  ChatStatusResponse,
} from "@/interfaces/chat";

const chatApiUrl = "/chat";

export const chat = async (projectId: string, data: ChatRequest) => {
  try {
    const response = await PostRequest<ChatResponse>(
      `${chatApiUrl}/project/${projectId}`,
      { ...data },
      {},
      300000,
    );
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.data?.error) {
      return {
        conversation_id: data.conversation_id,
        response: error.response.data.error,
      };
    } else {
      return {
        conversation_id: data.conversation_id,
        response: "Failed to chat data. Please try again!",
      };
    }
  }
};

export const chatStatus = async (projectId: string) => {
  try {
    const response = await GetRequest<ChatStatusResponse>(
      `${chatApiUrl}/project/${projectId}/status`,
    );
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.data?.error) {
      return {
        status: false,
      };
    } else {
      return {
        status: false,
      };
    }
  }
};
