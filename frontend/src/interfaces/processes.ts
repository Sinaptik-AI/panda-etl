import { AssetData } from "./assets";
import { ExtractionField } from "./extract";

export enum ProcessStatus {
  PENDING = 1,
  IN_PROGRESS = 2,
  COMPLETED = 3,
  FAILED = 4,
  STOPPED = 5,
}

export interface ProcessData {
  id: string;
  name?: string;
  type: string;
  status: ProcessStatus;
  project?: string;
  project_id: number;
  details: Record<string, any>;
  started_at: string;
  completed_at: string;
  created_at: string;
  updated_at: string;
  completed_step_count?: number;
}

export interface ProcessRequest {
  name?: string;
  type: string;
  data:
    | {
        fields: ExtractionField[];
        output_type: string;
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

export interface ProcessResumeData {
  id: number;
  type: string;
  status: string;
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
  asset: AssetData;
}

export interface ProcessSuggestionRequest {
  name: string;
  type: string;
  project_id: string;
  output_type: string;
}
