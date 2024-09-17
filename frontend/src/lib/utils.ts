import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs));
};

export const formatFileSize = (sizeInBytes: number): string => {
  if (sizeInBytes >= 1024 * 1024) {
    return (sizeInBytes / (1024 * 1024)).toFixed(2) + " MB";
  } else if (sizeInBytes >= 1024) {
    return (sizeInBytes / 1024).toFixed(2) + " KB";
  } else {
    return sizeInBytes + " Bytes";
  }
};

export const isValidURL = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const truncateTextFromCenter = (
  text?: string,
  maxLength: number = 50,
): string | undefined => {
  if (!text || typeof text !== "string") {
    return text;
  }
  if (text.length <= maxLength) {
    return text;
  }

  const breakPoint = Math.floor((maxLength - 3) * (3 / 4));
  const start = text.slice(0, breakPoint);
  const end = text.slice(text.length - (maxLength - 3 - breakPoint));

  return `${start}...${end}`;
};

export const markify_text = (text: string) => {
  return text.replace(/\n/g, "<br>");
};
