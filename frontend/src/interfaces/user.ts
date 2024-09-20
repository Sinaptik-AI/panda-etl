export interface APIKeyData {
  id: number;
  created_at: string;
  key: string;
  user_id: number;
}

export interface UserData {
  id: string;
  name: string;
  email: string;
}

export interface ApiUsage {
  credits_used: number;
  total_credits: number;
}
