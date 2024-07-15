export interface ExtractionField {
  key: string;
  type: "text" | "date" | "number" | "list";
  description: string;
}

export interface ExtractionResult {
  [key: string]: string | string[];
}
