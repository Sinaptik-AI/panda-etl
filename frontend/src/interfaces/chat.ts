export interface ChatRequest {
  conversation_id?: string | null;
  query: string;
}

export interface ChatResponse {
  conversation_id: string;
  response: string;
}

export interface ChatStatusResponse {
  status: boolean;
}

export interface ChatReference {
  asset_id: number;
  project_id: number;
  filename: string;
  start: number;
  end: number;
  page_number: number;
  source: string[];
}

export interface ChatReferences {
  references: ChatReference[];
  start: number;
  end: number;
}

export interface ChatDraftRequest {
  content: string;
  prompt: string;
}
