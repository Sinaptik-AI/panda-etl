export interface ExtractionField {
  key: string;
  description: string;
  type: "text" | "number" | "date" | "list";
}

export interface ExtractionResult {
  [key: string]: string | string[];
}
