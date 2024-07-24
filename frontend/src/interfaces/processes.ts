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
  details:
    | {
        fields: ExtractionField[];
      }
    | Record<string, any>;
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

export interface ProcessDetailsResponse {
  process_id: number;
  asset_id: number;
  created_at: string;
  status: number;
  id: number;
  output: any;
  updated_at: string;
  process: {
    status: number;
    project_id: number;
    completed_at: string;
    updated_at: string;
    message: string;
    type: string;
    id: number;
    started_at: string;
    created_at: string;
    details: {
      fields: Array<{
        key: string;
        description: string;
        type: string;
      }>;
    };
  };
}
