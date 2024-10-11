import React, { useEffect, useState, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { markify_text } from "@/lib/utils";
import { ChatReference, ChatReferences } from "@/interfaces/chat";
import ChatReferenceDrawer from "../ChatReferenceDrawer";
import {
  FileIcon,
  BookOpen,
  ChevronDown,
  ChevronUp,
  ExternalLink,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
  const [openDrawer, setOpenDrawer] = useState<boolean>(false);
  const [indexMap, setIndexMap] = useState<{ [key: string]: number }>({});
  const [flatChatReferences, setFlatChatReferences] = useState<ChatReference[]>(
    [],
  );
  const [isReferencesExpanded, setIsReferencesExpanded] = useState(false);

  const handleReferenceClick = useCallback((reference: ChatReference) => {
    setSelectedReference(reference);
    setOpenDrawer(true);
  }, []);

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

  const renderReferenceItem = useCallback(
    (item: ChatReference, index: number) => (
      <motion.div
        key={`reference-${index}`}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2, delay: index * 0.05 }}
        className="flex items-center bg-white border border-gray-200 rounded-md p-2 hover:bg-gray-50 transition-colors shadow-sm group"
      >
        <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center mr-2 font-semibold text-sm">
          {indexMap[`${item.asset_id}_${item.page_number}`]}
        </div>
        <div
          className="flex-grow flex items-center cursor-pointer"
          onClick={() => handleReferenceClick(item)}
        >
          <FileIcon className="w-4 h-4 text-blue-600 mr-2 flex-shrink-0" />
          <span
            className="text-sm text-blue-700 font-medium truncate flex-grow"
            title={item.filename}
          >
            {item.filename}
          </span>
          <span className="text-xs text-gray-500 ml-2 flex-shrink-0 bg-gray-100 px-2 py-1 rounded-full">
            Page {item.page_number}
          </span>
        </div>
        <ExternalLink className="w-4 h-4 text-gray-400 ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
      </motion.div>
    ),
    [indexMap, handleReferenceClick],
  );

  return (
    <div className="flex flex-col max-w-2xl">
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
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw]}
          >
            {markify_text(message)}
          </ReactMarkdown>
        )}
        <div className="text-xs text-gray-500 mt-2 text-right">
          {timestamp.toLocaleTimeString()}
        </div>
      </ChatBubbleWrapper>

      {references && references.length > 0 && (
        <div className="pl-4 pr-2 pt-2">
          <motion.button
            className="flex items-center justify-between w-full text-left font-semibold text-gray-700 mb-2 bg-gray-100 p-2 rounded-md hover:bg-gray-200 transition-colors"
            onClick={() => setIsReferencesExpanded(!isReferencesExpanded)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="flex items-center">
              <BookOpen className="w-4 h-4 mr-2" />
              References ({flatChatReferences.length})
            </span>
            <motion.div
              initial={false}
              animate={{ rotate: isReferencesExpanded ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <ChevronDown className="w-4 h-4" />
            </motion.div>
          </motion.button>
          <AnimatePresence>
            {isReferencesExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 gap-2 mt-2 max-h-60 overflow-y-auto pr-2"
              >
                {flatChatReferences.map(renderReferenceItem)}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      <ChatReferenceDrawer
        isOpen={openDrawer}
        sources={
          selectedReference?.source.map((item) => ({
            source: item,
            page_number: Number(selectedReference.page_number),
            filename: selectedReference.filename,
          })) || []
        }
        filename={selectedReference?.filename || ""}
        project_id={
          selectedReference?.project_id
            ? Number(selectedReference.project_id)
            : 0
        }
        onCancel={() => setOpenDrawer(false)}
      />
    </div>
  );
};

export default ChatBubble;
