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
