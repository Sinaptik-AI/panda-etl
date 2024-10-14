import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";
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
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeSanitize]}
            components={{
              p: ({ children }) => <span>{children}</span>,
            }}
          >
            {beforeText}
          </ReactMarkdown>
        </React.Fragment>
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
          </React.Fragment>
        );
      });

      lastEnd = item.end;
    });

    if (lastEnd < message.length) {
      const remainingText = message.slice(lastEnd);
      parts.push(
        <React.Fragment key="text-final">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeSanitize]}
            components={{
              p: ({ children }) => <span>{children}</span>,
            }}
          >
            {remainingText}
          </ReactMarkdown>
        </React.Fragment>
      );
    }

    return parts;
  };

  return <div className="inline">{renderMessageParts()}</div>;
};

export default MessageWithReferences;
