import { FlattenedSource } from "@/interfaces/processSteps";
import React, { useRef, useState, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";

// Define types for the highlight source
interface HighlightCoordinate {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface PdfViewerProps {
  file: string;
  highlightSources: FlattenedSource[];
}

const HighlightPdfViewer: React.FC<PdfViewerProps> = ({
  file,
  highlightSources,
}) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [onScrolled, setOnScrolled] = useState<boolean>(false);
  const viewerRef = useRef<HTMLDivElement>(null);

  const activePage =
    highlightSources && highlightSources.length > 0
      ? highlightSources[0].page_number
      : 1;

  useEffect(() => {
    if (typeof window !== "undefined") {
      pdfjs.GlobalWorkerOptions.workerSrc = `/pdf.worker.mjs`;
    }
  }, []);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  const scrollToPage = (pageNumber: number) => {
    const pageElement = document.querySelector(`#page_${pageNumber}`);
    if (pageElement) {
      pageElement.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Highlighting logic for both custom coordinates and text
  const highlightText = (
    pageNumber: number,
    sources: HighlightCoordinate[],
  ) => {
    const pageCanvas = document.querySelector<HTMLCanvasElement>(
      `#page_${pageNumber} canvas`,
    );
    if (!pageCanvas) {
      console.log("No page canvas found");
      return;
    }
    const context = pageCanvas.getContext("2d");
    if (!context) {
      console.log("No context found");
      return;
    }
    context.fillStyle = "rgba(255, 255, 0, 0.3)";
    sources.forEach((source) => {
      context.fillRect(source.x, source.y, source.width, source.height);
    });
  };

  function findOverlap(sentence1: string, sentence2: string) {
    // Split both sentences into words
    const words1 = sentence1.split(" ");
    const words2 = sentence2.split(" ");

    let longestOverlap: { overlap: string; position: null | string } = {
      overlap: "No overlap found",
      position: null,
    };
    let maxLength = 0;

    // Loop over each possible starting point in sentence1
    for (let i = 0; i < words1.length; i++) {
      for (let j = 0; j < words2.length; j++) {
        let overlapLength = 0;

        // Compare words from both sentences starting at words1[i] and words2[j]
        while (
          i + overlapLength < words1.length &&
          j + overlapLength < words2.length &&
          words1[i + overlapLength] === words2[j + overlapLength]
        ) {
          overlapLength++;
        }

        // If we found an overlap longer than what we've seen, update longestOverlap
        if (overlapLength > maxLength) {
          maxLength = overlapLength;

          // Determine the position of the overlap in sentence1
          let position;
          if (i === 0) {
            position = "start";
          } else if (i + overlapLength === words1.length) {
            position = "end";
          } else {
            position = "middle";
          }

          longestOverlap = {
            overlap: words1.slice(i, i + overlapLength).join(" "),
            position: position,
          };
        }
      }
    }

    return longestOverlap;
  }

  const constructCoordinates = (
    item: any,
    viewHeight: number,
    viewWidth: number,
  ) => {
    const { transform, width, height } = item;
    const x = 2 * transform[4];
    const y = viewHeight - 2 * transform[5] - 2 * height;
    return {
      x: x,
      y: y,
      width: 2 * width,
      height: 2 * height,
    };
  };

  // Function to search for text and highlight it
  const highlightTextInPdf = async (pageNumber: number, text: string) => {
    const loadingTask = pdfjs.getDocument(file);
    const pdfDocument = await loadingTask.promise;

    const page = await pdfDocument.getPage(pageNumber);
    const textContent = await page.getTextContent();
    let viewHeight = viewerRef.current?.clientHeight;
    let viewWidth = viewerRef.current?.clientWidth;

    if (!viewWidth || !viewHeight || !numPages) {
      console.log("No view width or height found");
      return;
    }

    viewHeight = 2 * (viewHeight / numPages);
    viewWidth = 2 * viewWidth;

    let copyText = text.toLowerCase();

    let highlightCoordinates: HighlightCoordinate[] = [];
    let found = false;

    textContent.items.forEach((item) => {
      if ("str" in item && typeof item.str === "string") {
        const pdfText = item.str.toLowerCase().trim();

        if (pdfText.length == 0 || copyText.length == 0) return;

        let overlap = findOverlap(pdfText, copyText);
        if (overlap.overlap === "No overlap found") {
          overlap = findOverlap(copyText, item.str.toLowerCase());
          if (overlap.overlap === "No overlap found") {
            return;
          }
        }

        if (copyText.length == 0) {
          return;
        }
        const isOverlapAtStart = copyText.startsWith(overlap.overlap);
        const isOverlapEqualToPdf = overlap.overlap.length === pdfText.length;
        const isOverlapEqualToCopy = overlap.overlap.length === copyText.length;

        if (isOverlapEqualToPdf && isOverlapEqualToCopy && isOverlapAtStart) {
          const highlightCoord = constructCoordinates(
            item,
            viewHeight,
            viewWidth,
          );
          highlightCoordinates.push(highlightCoord);
          copyText = copyText.replace(overlap.overlap, "").trim();
        } else if (
          !isOverlapEqualToPdf &&
          isOverlapEqualToCopy &&
          isOverlapAtStart
        ) {
          const highlightCoord = constructCoordinates(
            item,
            viewHeight,
            viewWidth,
          );
          highlightCoordinates.push(highlightCoord);
          copyText = copyText.replace(overlap.overlap, "").trim();
        } else if (
          isOverlapEqualToPdf &&
          !isOverlapEqualToCopy &&
          isOverlapAtStart
        ) {
          found = true;
          const highlightCoord = constructCoordinates(
            item,
            viewHeight,
            viewWidth,
          );
          highlightCoordinates.push(highlightCoord);
          copyText = copyText.replace(overlap.overlap, "").trim();
        } else if (
          !isOverlapEqualToPdf &&
          !isOverlapEqualToCopy &&
          isOverlapAtStart
        ) {
          found = true;
          const highlightCoord = constructCoordinates(
            item,
            viewHeight,
            viewWidth,
          );
          highlightCoordinates.push(highlightCoord);
          copyText = copyText.replace(overlap.overlap, "").trim();
        } else if (found && copyText.length > 1 && !isOverlapEqualToCopy) {
          highlightCoordinates = [];
          copyText = text.toLowerCase();
          found = false;
        }
      }
    });

    highlightText(pageNumber, highlightCoordinates);
  };

  useEffect(() => {
    if (numPages !== null) {
      const timer = setTimeout(() => {
        scrollToPage(activePage);
        setOnScrolled(true);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [numPages]);

  useEffect(() => {
    const highlightTextTimer = setTimeout(() => {
      highlightSources.forEach(async (highlightSource) => {
        await highlightTextInPdf(
          highlightSource.page_number,
          highlightSource.source,
        );
      });
    }, 3000);

    return () => clearTimeout(highlightTextTimer);
  }, [onScrolled]);

  return (
    <div ref={viewerRef}>
      <Document file={file} onLoadSuccess={onDocumentLoadSuccess}>
        {Array.from(new Array(numPages || 0), (el, index) => {
          return (
            <div
              id={`page_${index + 1}`}
              key={`page_${index + 1}`}
              style={{ margin: 0, padding: 0, pageBreakInside: "avoid" }}
            >
              <Page pageNumber={index + 1} />
            </div>
          );
        })}
      </Document>
    </div>
  );
};

export default HighlightPdfViewer;
