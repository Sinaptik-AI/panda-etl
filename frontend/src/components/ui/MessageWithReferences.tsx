import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { ChatReference, ChatReferences } from "@/interfaces/chat";
import TooltipWrapper from "./Tooltip";

interface MessageWithReferencesProps {
  message: string;
  references: ChatReferences[];
  indexMap: { [key: string]: number };
  onReferenceClick: (reference: ChatReference) => void;
}

const MessageWithReferences: React.FC<MessageWithReferencesProps> = ({
  message,
  references,
  indexMap,
  onReferenceClick,
}) => {
  const renderMessageParts = () => {
    const parts: React.ReactNode[] = [];
    let lastEnd = 0;

    references.forEach((item: ChatReferences, index: number) => {
      const beforeText = message.slice(lastEnd, item.end);
      parts.push(
        <React.Fragment key={`text-${index}`}>
          {beforeText.split("\n").map((line, lineIndex) => (
            <React.Fragment key={`line-${index}-${lineIndex}`}>
              {lineIndex > 0 && <br />}
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw]}
                components={{
                  p: ({ children }) => <span>{children}</span>,
                }}
              >
                {line}
              </ReactMarkdown>
            </React.Fragment>
          ))}
        </React.Fragment>,
      );

      item.references.forEach((reference: ChatReference, refIndex: number) => {
        const tooltipContent = `${reference.filename}, page ${reference.page_number}`;
        parts.push(
          <React.Fragment key={`ref-${index}-${refIndex}`}>
            <TooltipWrapper content={tooltipContent}>
              <span
                className="reference-marker w-4 h-4 mr-2 bg-blue-200 text-xs text-black rounded-full inline-flex items-center justify-center cursor-pointer align-top"
                onClick={() => onReferenceClick(reference)}
              >
                {indexMap[`${reference.asset_id}_${reference.page_number}`]}
              </span>
            </TooltipWrapper>
          </React.Fragment>,
        );
      });

      lastEnd = item.end;
    });

    if (lastEnd < message.length) {
      const remainingText = message.slice(lastEnd);
      parts.push(
        <React.Fragment key="text-final">
          {remainingText.split("\n").map((line, lineIndex) => (
            <React.Fragment key={`line-final-${lineIndex}`}>
              {lineIndex > 0 && <br />}
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw]}
                components={{
                  p: ({ children }) => <span>{children}</span>,
                }}
              >
                {line}
              </ReactMarkdown>
            </React.Fragment>
          ))}
        </React.Fragment>,
      );
    }

    return parts;
  };

  return <div className="inline">{renderMessageParts()}</div>;
};

export default MessageWithReferences;
