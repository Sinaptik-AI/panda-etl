import { GetRequest, PostRequest } from "@/lib/requests";
import { ProjectData } from "@/interfaces/projects";
import { AssetData } from "@/interfaces/assets";

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

export const CreateProject = async (data: {
  name: string;
  description: string;
}) => {
  try {
    const response = await PostRequest<{ data: ProjectData }>(
      projectsApiUrl,
      data
    );
    return response;
  } catch (error) {
    throw error;
  }
};

export const GetProjectAssets = async (projectId: string) => {
  try {
    const response = await GetRequest<{ data: AssetData[] }>(
      `${projectsApiUrl}/${projectId}/assets`
    );
    return response;
  } catch (error) {
    throw error;
  }
};

export const AddProjectAsset = async (projectId: string, file: File) => {
  try {
    const formData = new FormData();
    formData.append('pdf', file);

    const response = await PostRequest<{ data: any }>(
      `${projectsApiUrl}/${projectId}/assets`,
      formData
    );
    return response;
  } catch (error) {
    throw error;
  }
};
