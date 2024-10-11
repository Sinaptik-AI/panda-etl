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
  project_id: number;
  asset_id: number;
  output_reference: Array<OutputReference>;
}

export interface ProcessStepResponse {
  status: string;
  message: string;
  data: ProcessStepData;
}

export interface Source {
  name: string;
  page_numbers: number[];
  sources: string[];
}

export interface FlattenedSource {
  source: string;
  page_number: number;
  filename?: string;
}
