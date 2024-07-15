import { GetRequest } from "@/lib/requests";
import { ProjectData } from "@/interfaces/projects";

const projectsApiUrl = "/projects";

export const GetProject = async (projectId: string) => {
  try {
    const response = await GetRequest<{ data: ProjectData }>(
      `${projectsApiUrl}/${projectId}`
    );
    return response;
  } catch (error) {
    throw error;
  }
};

export const GetProjects = async () => {
  try {
    const response = await GetRequest<{ data: ProjectData[] }>(projectsApiUrl);
    return response;
  } catch (error) {
    throw error;
  }
};
