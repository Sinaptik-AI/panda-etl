import { ExtractionResult } from "./extract";

interface OutputReference {
  [key: string]: any;
}

export interface ProcessStepData {
  id: number;
  process_id: number;
  asset_id: number;
  status: string;
  created_at: string;
  updated_at: string;
  output: ExtractionResult;
}

export interface ProcessStepOutputRef {
  id: number;
  process_id: number;
  asset_id: number;
  output_reference: Array<OutputReference>;
}

export interface ProcessStepResponse {
  status: string;
  message: string;
  data: ProcessStepData;
}
