import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { markify_text } from "@/lib/utils";
import { ChatReference } from "@/interfaces/chat";
import ChatReferenceDrawer from "../ChatReferenceDrawer";
import { FileIcon } from "lucide-react";

interface ChatBubbleProps {
  message: string;
  timestamp: Date;
  sender: "user" | "bot";
  references?: ChatReference[];
}

export const ChatBubbleWrapper: React.FC<{
  children: React.ReactNode;
  sender?: "user" | "bot";
}> = ({ children, sender = "bot" }) => {
  return (
    <div
      className={`p-3 rounded-lg max-w-xl shadow-md ${
        sender === "user" ? "bg-blue-100" : "bg-white"
      } text-black`}
    >
      {children}
    </div>
  );
};

const ChatBubble: React.FC<ChatBubbleProps> = ({
  message,
  timestamp,
  references,
  sender,
}) => {
  const [selectedReference, setSelectedReference] = useState<
    ChatReference | undefined
  >();
  const [OpenDrawer, setOpenDrawer] = useState<boolean>(false);

  const handleReferenceClick = (reference: ChatReference) => {
    setSelectedReference(reference);
    setOpenDrawer(true);
  };

  return (
    <ChatBubbleWrapper sender={sender}>
      {references && references.length > 0 ? (
        references.map((item: ChatReference, index: number) => {
          return (
            <div key={`Markdown-${index}`}>
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw]}
              >
                {markify_text(
                  message.slice(Math.max(0, item.start - 1), item.end),
                )}
              </ReactMarkdown>
              <div
                className="w-5 h-5 bg-blue-300 text-sm  text-black rounded-full flex items-center justify-center cursor-pointer"
                onClick={() => handleReferenceClick(item)}
              >
                {index + 1}
              </div>
            </div>
          );
        })
      ) : (
        <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
          {markify_text(message)}
        </ReactMarkdown>
      )}

      {references && references.length > 0 && (
        <div className="flex flex-col gap-3">
          <div className="font-bold">References</div>
          {references.map((item: ChatReference, index: number) => {
            return (
              <div
                key={`fileicons-${index}`}
                className="flex gap-1 text-blue-800 p-2 cursor-pointer hover:underline"
                onClick={() => handleReferenceClick(item)}
              >
                <FileIcon />
                {item.filename}
              </div>
            );
          })}
        </div>
      )}
      {selectedReference && (
        <ChatReferenceDrawer
          isOpen={OpenDrawer}
          sources={[
            {
              source: message.slice(
                selectedReference.start,
                selectedReference.end,
              ),
              page_number: selectedReference.page_number,
              filename: selectedReference.filename,
            },
          ]}
          filename={selectedReference.filename}
          project_id={selectedReference.project_id}
          onCancel={() => setOpenDrawer(false)}
        />
      )}
      <div className="text-xs text-gray-500 mt-2 text-right">
        {timestamp.toLocaleTimeString()}
      </div>
    </ChatBubbleWrapper>
  );
};
export default ChatBubble;
