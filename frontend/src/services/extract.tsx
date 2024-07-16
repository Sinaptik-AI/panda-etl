import axios from "axios";
import { PostRequest } from "@/lib/requests";
import { ExtractionResult } from "@/interfaces/extract";

const extractApiUrl = "/extract";

export const Extract = async (formData: FormData) => {
  try {
    const response = await PostRequest<ExtractionResult>(
      extractApiUrl,
      formData,
      {
        "Content-Type": "multipart/form-data",
      }
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
