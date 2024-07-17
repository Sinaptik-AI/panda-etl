import { PostRequest } from "@/lib/requests";
import { ProjectData } from "@/interfaces/projects";

const projectsApiUrl = "/user";

export const APIKeyRequest = async (data: {
  email: string;
}) => {
  try {
    const response = await PostRequest<{ data: ProjectData }>(
      `${projectsApiUrl}/request-api-key`,
      data
    );
    return response;
  } catch (error) {
    throw error;
  }
};
