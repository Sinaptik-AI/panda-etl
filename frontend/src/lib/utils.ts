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

export const truncateTextFromCenter = (text: string, maxLength: number) => {
  if (!text || typeof text !== "string") {
    return text;
  }
  if (text.length <= maxLength) {
    return text;
  }

  const partLength = Math.floor((maxLength - 3) / 2);
  const start = text.slice(0, partLength);
  const end = text.slice(text.length - partLength);

  return `${start}...${end}`;
};
