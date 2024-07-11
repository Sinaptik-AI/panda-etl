"use client";
import React, { useState } from "react";
import Head from "next/head";
import axios from "axios";
import PDFViewer from "@/components/PDFViewer";
import ExtractionForm from "@/components/ExtractionForm";
import FilePicker from "@/components/FilePicker";

interface ExtractionField {
  key: string;
  type: "text" | "date" | "number" | "list";
  description: string;
}

interface ExtractionResult {
  [key: string]: string | string[];
}

export default function Home() {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [extractionResult, setExtractionResult] =
    useState<ExtractionResult | null>(null);
  const [extractionFields, setExtractionFields] = useState<ExtractionField[]>(
    []
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handlePdfUpload = (file: File) => {
    setPdfFile(file);
    setExtractionResult(null);
    setError(null);
  };

  const handleSubmit = async (fields: ExtractionField[]) => {
    setExtractionFields(fields);
    setIsLoading(true);
    setError(null);

    if (!pdfFile) {
      setError("No PDF file selected");
      setIsLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append("pdf", pdfFile);
    formData.append("fields", JSON.stringify(fields));

    try {
      const response = await axios.post<ExtractionResult>(
        "/api/extract",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setExtractionResult(response.data);
    } catch (error) {
      console.error("Error during extraction:", error);
      setError(
        axios.isAxiosError(error) && error.response?.data?.error
          ? error.response.data.error
          : "Failed to extract data. Please try again."
      );
      setExtractionResult(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>BambooETL - Extract Data</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {!pdfFile ? (
        <FilePicker
          onChange={handlePdfUpload}
          accept={[".pdf", "application/pdf"]}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <ExtractionForm onSubmit={handleSubmit} />
            {error && (
              <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}
            {extractionResult && (
              <>
                <h2 className="text-2xl font-bold mt-8 mb-4">
                  Extraction Result
                </h2>
                <div className="bg-white rounded-lg shadow p-4">
                  <div className="grid grid-cols-1 gap-4">
                    {extractionFields.map((field, index) => (
                      <div
                        key={index}
                        className="bg-gray-50 p-4 rounded shadow"
                      >
                        <h3 className="font-bold mb-2">{field.key}</h3>
                        <p>
                          {Array.isArray(extractionResult[field.key])
                            ? (extractionResult[field.key] as string[]).join(
                                ", "
                              )
                            : extractionResult[field.key] || "N/A"}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-4">PDF Preview</h2>
            <PDFViewer file={pdfFile} />
            <div className="text-right">
              <button
                onClick={() => setPdfFile(null)}
                className="mt-4 p-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Remove PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
