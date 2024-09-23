export interface AssetData {
  id: string;
  filename: string;
  path: string;
  type: string;
  details: Record<string, string | number>;
  updated_at: string;
  created_at: string;
  size: number;
}
