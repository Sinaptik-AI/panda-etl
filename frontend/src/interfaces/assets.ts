export interface AssetData {
  id: string;
  filename: string;
  path: string;
  type: string;
  details: Record<string, string | number>;
  size: number;
}
