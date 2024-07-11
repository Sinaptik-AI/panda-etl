"use client";
import { useState, useEffect } from "react";

interface PDFViewerProps {
  file: File | null;
}

export default function PDFViewer({ file }: PDFViewerProps) {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setPdfUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPdfUrl(null);
    }
  }, [file]);

  if (!pdfUrl) {
    return (
      <div className="bg-gray-100 h-full flex items-center justify-center">
        No PDF selected
      </div>
    );
  }

  return (
    <object data={pdfUrl} type="application/pdf" width="100%" height="600px">
      <p>
        Your browser does not support PDFs. Please download the PDF to view it.
      </p>
    </object>
  );
}
