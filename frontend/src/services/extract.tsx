import axios from "axios";
import { PostRequest } from "@/lib/requests";
import { ExtractionField, ExtractionResult } from "@/interfaces/extract";

const extractApiUrl = "/extract";

export const Extract = async (projectId: string, fields: ExtractionField[]) => {
  try {
    const response = await PostRequest<ExtractionResult>(
      `${extractApiUrl}/${projectId}`,
      { fields }
    );
    return response;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.data?.error) {
      throw new Error(error.response.data.error);
    } else {
      throw new Error("Failed to extract data. Please try again.");
    }
  }
};
