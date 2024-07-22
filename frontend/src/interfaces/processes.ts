import { ExtractionField } from "./extract";

export enum ProcessStatus {
  PENDING = 1,
  IN_PROGRESS = 2,
  COMPLETED = 3,
  FAILED = 4,
}

export interface ProcessData {
  id: string;
  type: string;
  status: ProcessStatus;
  project?: string;
  project_id: number;
  started_at: string;
  completed_at: string;
  created_at: string;
  updated_at: string;
}


export interface ProcessRequest {
  type: string;
  details: {
      fields: ExtractionField[];
  };
  project_id: string;
}

export interface ProcessExecutionData {
  id: number;
  type: string;
  status: string;
  project: string;
  project_id: string;
  started_at: string;
}