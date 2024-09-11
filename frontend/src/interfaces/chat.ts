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
