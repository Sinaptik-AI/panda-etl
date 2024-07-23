import { ExtractionResult } from "./extract";

export interface ProcessStepData {
  id: number;
  process_id: number;
  asset_id: number;
  status: string;
  created_at: string;
  updated_at: string;
  output: ExtractionResult;
}

export interface ProcessStepResponse {
  status: string;
  message: string;
  data: ProcessStepData;
}
