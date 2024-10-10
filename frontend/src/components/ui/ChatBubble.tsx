import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { markify_text } from "@/lib/utils";
import { ChatReference, ChatReferences } from "@/interfaces/chat";
import ChatReferenceDrawer from "../ChatReferenceDrawer";
import { FileIcon } from "lucide-react";

interface ChatBubbleProps {
  message: string;
  timestamp: Date;
  sender: "user" | "bot";
  references?: ChatReferences[];
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

  const combinedMarkdown = references
    ?.map((item: ChatReferences, index: number) => {
      const slicedText = message.slice(Math.max(0, item.start - 1), item.end);

      return `${slicedText} ${item["references"]
        .map((item2: ChatReference, index2: number) => {
          return `<span class='reference-marker' className="w-5 h-5 bg-blue-200 text-sm text-black rounded-full inline-flex items-center justify-center cursor-pointer" data-index='${index}_${index2}'>[${index2 + 1}]</span>`;
        })
        .join(" ")}`;
    })
    .join(""); // Join all sliced texts without any gaps or newlines

  // Handle click event on the reference markers
  const handleMarkerClick = (event: React.MouseEvent) => {
    const target = event.target as HTMLElement;
    console.log(target.classList);
    if (target.classList.contains("reference-marker")) {
      console.log(target.dataset.index);
      const splitted_index = target.dataset.index?.split("_");
      console.log(splitted_index);
      if (splitted_index && references) {
        const index0 = parseInt(splitted_index[0]);
        const index1 = parseInt(splitted_index[1]);
        handleReferenceClick(references[index0]["references"][index1]);
      }
    }
  };

  const referenceData: string[] = [];

  return (
    <ChatBubbleWrapper sender={sender}>
      {references && references.length > 0 ? (
        <div onClick={handleMarkerClick}>
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw]}
          >
            {combinedMarkdown}
          </ReactMarkdown>
        </div>
      ) : (
        <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
          {markify_text(message)}
        </ReactMarkdown>
      )}

      {references && references.length > 0 && (
        <div className="flex flex-col gap-3">
          <div className="font-bold">References</div>
          {references.map((item: ChatReferences, index: number) => {
            return item["references"].map(
              (chatref: ChatReference, index2: number) => {
                if (!referenceData.includes(chatref.filename)) {
                  referenceData.push(chatref.filename);
                  return (
                    <div
                      key={`fileicons-${index2}`}
                      className="flex gap-1 text-blue-800 p-2 cursor-pointer hover:underline"
                      onClick={() => handleReferenceClick(chatref)}
                    >
                      <FileIcon />
                      {chatref.filename}
                    </div>
                  );
                } else {
                  return null;
                }
              },
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
