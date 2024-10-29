import React, { useEffect, useState, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import { markify_text } from "@/lib/utils";
import { ChatReference, ChatReferences } from "@/interfaces/chat";
import ChatReferenceDrawer from "../ChatReferenceDrawer";
import {
  FileIcon,
  BookOpen,
  ChevronDown,
  ExternalLink,
  FilePenLine,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import MessageWithReferences from "./MessageWithReferences";
import TooltipWrapper from "./Tooltip";

interface ChatBubbleProps {
  message: string;
  timestamp: Date;
  sender: "user" | "bot";
  references?: ChatReferences[];
  onAddToDraft?: () => void;
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
  onAddToDraft,
}) => {
  const [selectedReference, setSelectedReference] = useState<
    ChatReference | undefined
  >();
  const [openDrawer, setOpenDrawer] = useState<boolean>(false);
  const [indexMap, setIndexMap] = useState<{ [key: string]: number }>({});
  const [flatChatReferences, setFlatChatReferences] = useState<ChatReference[]>(
    []
  );
  const [isReferencesExpanded, setIsReferencesExpanded] = useState(false);

  const handleReferenceClick = useCallback((reference: ChatReference) => {
    setSelectedReference(reference);
    setOpenDrawer(true);
  }, []);

  useEffect(() => {
    if (references) {
      const newIndexMap: { [key: string]: number } = {};
      const newFlatChatReferences: ChatReference[] = [];
      let counter = 1;

      references.forEach((referenceData) => {
        referenceData.references.forEach((reference) => {
          const identifier = `${reference.asset_id}_${reference.page_number}`;
          if (!(identifier in newIndexMap)) {
            newIndexMap[identifier] = counter++;
          }

          const existingRefIndex = newFlatChatReferences.findIndex(
            (ref) =>
              ref.asset_id === reference.asset_id &&
              ref.page_number === reference.page_number
          );

          if (existingRefIndex === -1) {
            newFlatChatReferences.push(reference);
          } else {
            const existingRef = newFlatChatReferences[existingRefIndex];
            if (!existingRef.source.includes(reference.source[0])) {
              existingRef.source.push(reference.source[0]);
            }
          }
        });
      });

      setIndexMap(newIndexMap);
      setFlatChatReferences(newFlatChatReferences);
    }
  }, [references]);

  const renderReferenceItem = useCallback(
    (item: ChatReference, index: number) => (
      <motion.div
        key={`reference-${item.asset_id}_${item.page_number}`}
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
    [indexMap, handleReferenceClick]
  );

  return (
    <div className="flex flex-col max-w-2xl">
      <ChatBubbleWrapper sender={sender}>
        {references && references.length > 0 ? (
          <MessageWithReferences
            message={message}
            references={references}
            indexMap={indexMap}
            onReferenceClick={handleReferenceClick}
          />
        ) : (
          <ReactMarkdown rehypePlugins={[rehypeSanitize]}>
            {markify_text(message)}
          </ReactMarkdown>
        )}
        {/* Add to draft button for chat */}
        {sender == "bot" && onAddToDraft ? (
          <div className="w-full flex justify-between">
            <div className="text-xs text-gray-500 mt-2 text-right">
              {timestamp.toLocaleTimeString()}
            </div>
            <TooltipWrapper content={"Add to draft"}>
              <FilePenLine
                width={18}
                className="hover:cursor-pointer"
                onClick={onAddToDraft}
              />
            </TooltipWrapper>
          </div>
        ) : (
          <div className="text-xs text-gray-500 mt-2 text-left">
            {timestamp.toLocaleTimeString()}
          </div>
        )}
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
