import React, { useEffect, useMemo, useState } from "react";
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
  const [indexMap, setIndexMap] = useState<{ [key: string]: number }>({});
  const [flatChatReferences, setFlatChatReferences] = useState<ChatReference[]>(
    [],
  );

  const handleReferenceClick = (reference: ChatReference) => {
    setSelectedReference(reference);
    setOpenDrawer(true);
  };

  useEffect(() => {
    if (references) {
      const indexMap: { [key: string]: number } = {};
      let counter = 1;
      for (const reference_data of references) {
        for (const reference of reference_data["references"]) {
          const identifier = `${reference.asset_id}_${reference.page_number}`;
          if (identifier in indexMap) {
            continue;
          } else {
            indexMap[identifier] = counter;
            counter += 1;
          }
        }
      }
      setIndexMap(indexMap);

      // preprocess doc references
      const flatChatReferences: ChatReference[] = [];

      for (const reference_data of references) {
        for (const reference of reference_data["references"]) {
          var exists = false;
          for (let i = 0; i < flatChatReferences.length; i++) {
            const ref = flatChatReferences[i];

            if (
              ref.asset_id == reference.asset_id &&
              ref.page_number == reference.page_number
            ) {
              if (ref.source.includes(reference.source[0])) {
                exists = true;
                break;
              }
              ref.source.push(reference.source[0]);
              exists = true;
              break;
            }
          }

          if (!exists) {
            flatChatReferences.push(reference);
          }
        }
      }
      setFlatChatReferences(flatChatReferences);
    }
  }, [references]);

  let lastEnd = 0;

  const combinedMarkdown = references?.reduce(
    (acc, item: ChatReferences, index: number) => {
      const beforeText = message.slice(lastEnd, item.end);

      const referenceSpan = item["references"]
        .map((item2: ChatReference, index2: number) => {
          return `<span class='reference-marker w-5 h-5 bg-blue-200 text-sm text-black rounded-full inline-flex items-center justify-center cursor-pointer' data-index='${index}_${index2}'>[${indexMap[`${item2.asset_id}_${item2.page_number}`]}]</span>`;
        })
        .join(" ");

      acc += `${beforeText}${referenceSpan}`;

      lastEnd = item.end;

      return acc;
    },
    "",
  );

  const finalMarkdown = combinedMarkdown + message.slice(lastEnd);

  // Handle click event on the reference markers
  const handleMarkerClick = (event: React.MouseEvent) => {
    const target = event.target as HTMLElement;
    if (target.classList.contains("reference-marker")) {
      const splitted_index = target.dataset.index?.split("_");
      if (splitted_index && references) {
        const index0 = parseInt(splitted_index[0]);
        const index1 = parseInt(splitted_index[1]);
        handleReferenceClick(references[index0]["references"][index1]);
      }
    }
  };

  return (
    <ChatBubbleWrapper sender={sender}>
      {references && references.length > 0 ? (
        <div onClick={handleMarkerClick}>
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw]}
          >
            {finalMarkdown}
          </ReactMarkdown>
        </div>
      ) : (
        <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
          {markify_text(message)}
        </ReactMarkdown>
      )}

      {references && references.length > 0 && (
        <div className="flex flex-col">
          <div className="font-bold">References</div>
          {flatChatReferences.map((item: ChatReference, index: number) => {
            return (
              <div key={`group-${index}`} className="flex items-center">
                <div className="text-black">
                  {indexMap[`${item.asset_id}_${item.page_number}`]}.
                </div>
                <div
                  key={`fileicons-${index}`}
                  className="flex gap-1 text-blue-800 p-2 cursor-pointer hover:underline"
                  onClick={() => handleReferenceClick(item)}
                >
                  <FileIcon />
                  <span
                    className="max-w-[400px] truncate"
                    title={item.filename}
                  >
                    {item.filename}
                  </span>
                  <div className="text-black">Page: {item.page_number}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      {selectedReference && (
        <ChatReferenceDrawer
          isOpen={OpenDrawer}
          sources={selectedReference.source.map((item) => {
            return {
              source: item,
              page_number: selectedReference.page_number,
              filename: selectedReference.filename,
            };
          })}
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
