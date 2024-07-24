export interface ExtractionField {
  key: string;
  type: "text" | "date" | "number" | "list" | "boolean";
  description: string;
}

export interface ExtractionResult {
  [key: string]: string | string[];
}
