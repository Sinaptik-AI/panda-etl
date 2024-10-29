import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { chat, chatStatus } from "@/services/chat";
import LogoDark from "@/icons/LogoDark";
import ChatLoader from "./ChatLoader";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import ChatBubble from "@/components/ui/ChatBubble";
import { ChatReferences } from "@/interfaces/chat";
import ChatDraftDrawer from "./ChatDraftDrawer";
import { FilePenLine } from "lucide-react";

export const NoChatPlaceholder = ({ isLoading }: { isLoading: boolean }) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center">
      <Image
        src="/build_chat.svg"
        className="mb-6"
        alt="Chat loading"
        width={384}
        height={384}
      />
      <div className="text-center max-w-lg">
        {isLoading
          ? "Please wait a moment while we process the uploaded documents for chat. This may take a few minutes. Feel free to revisit this page shortly."
          : "No documents have been uploaded yet. Please upload some documents to start chatting."}
      </div>
    </div>
  );
};

interface ChatMessage {
  sender: string;
  text: string;
  references?: Array<ChatReferences>;
  timestamp: Date;
}

interface ChatDraft {
  draft: string;
  draftedMessageIndexes: Array<number>;
}

interface ChatProps {
  project_id?: string;
  messages: Array<ChatMessage>;
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  chatDraft: ChatDraft;
  setChatDraft: React.Dispatch<React.SetStateAction<ChatDraft>>;
  chatEnabled: boolean;
  setChatEnabled: React.Dispatch<React.SetStateAction<boolean>>;
}

const ChatBox = ({
  project_id,
  messages,
  setMessages,
  chatDraft,
  setChatDraft,
  chatEnabled,
  setChatEnabled,
}: ChatProps) => {
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLInputElement | null>(null);
  const [openChatDraftDrawer, setOpenChatDraftDrawer] =
    useState<boolean>(false);

  const { data: statusData, isLoading } = useQuery({
    queryKey: ["chatStatus", project_id],
    queryFn: async () => {
      const statusData = await chatStatus(project_id as string);
      setChatEnabled(statusData.status);
      return statusData.status;
    },
    enabled: !!project_id,
    refetchInterval: chatEnabled ? false : 5000,
  });

  const handleSend = async () => {
    if (input.trim() === "") return;
    if (!project_id) return;

    const newMessage = { sender: "user", text: input, timestamp: new Date() };
    setMessages((prevMessages) => [...prevMessages, newMessage]);
    setInput("");

    setLoading(true);
    const response = await chat(project_id, {
      conversation_id: conversationId,
      query: input,
    });
    const bot_response = {
      sender: "bot",
      text: response.response,
      references: response.response_references || [],
      timestamp: new Date(),
    };
    setLoading(false);

    setMessages((prevMessages) => [...prevMessages, bot_response]);
    setConversationId(response.conversation_id);
  };

  const handleAddToDraft = (index: number) => {
    setOpenChatDraftDrawer(true);

    const new_draft =
      chatDraft.draft +
      `<br/><p><strong>${messages[index - 1].text}</strong></p><p>${messages[index].text}</p>`;

    setChatDraft({
      draft: new_draft,
      draftedMessageIndexes: [...chatDraft.draftedMessageIndexes, index],
    });
  };

  const onCloseChatDraft = () => {
    setOpenChatDraftDrawer(false);
  };

  const onOpenChatDraft = () => {
    setOpenChatDraftDrawer(true);
  };

  const handleDraftEdit = (draft: string) => {
    setChatDraft({
      draft: draft,
      draftedMessageIndexes: [...chatDraft.draftedMessageIndexes],
    });
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex flex-col" style={{ minHeight: "calc(100vh - 18rem)" }}>
      {isLoading || !chatEnabled ? (
        <NoChatPlaceholder isLoading={isLoading || !chatEnabled} />
      ) : (
        <>
          <div className="flex-1 overflow-y-auto" style={{ maxHeight: "60vh" }}>
            {messages.map((message, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`mb-4 flex ${
                  message.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {message.sender === "bot" && (
                  <div
                    className="flex-shrink-0 mr-2"
                    style={{ minWidth: "40px", width: "40px" }}
                  >
                    <LogoDark width="100%" />
                  </div>
                )}
                <ChatBubble
                  message={message.text}
                  timestamp={message.timestamp}
                  references={message.references}
                  sender={message.sender as "user" | "bot"}
                  onAddToDraft={() => handleAddToDraft(index)}
                />
              </motion.div>
            ))}
            {messages.length === 0 && (
              <div className="mb-4 flex justify-start">
                <div style={{ minWidth: "40px", width: "40px" }}>
                  <LogoDark width="100%" />
                </div>

                <ChatBubble
                  message="Hi! How can I help you today?"
                  timestamp={new Date()}
                  sender="bot"
                />
              </div>
            )}
            {loading && (
              <div className="my-4 flex justify-start">
                <div style={{ minWidth: "40px", width: "40px" }}>
                  <LogoDark width="100%" />
                </div>

                <ChatLoader />
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <div className="mt-4 flex gap-4 items-center">
            <div className="flex-grow relative">
              <Input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                onKeyPress={(e) => e.key === "Enter" && handleSend()}
                noMargin
                containerStyle="w-full"
              />
            </div>
            <div className="flex justify-center gap-2">
              <Button onClick={handleSend} variant="secondary">
                Send
              </Button>
              <Button onClick={onOpenChatDraft} variant="secondary">
                <FilePenLine width={18} />
              </Button>
            </div>
          </div>
        </>
      )}

      <ChatDraftDrawer
        isOpen={openChatDraftDrawer}
        draft={chatDraft?.draft}
        onCancel={onCloseChatDraft}
        onSubmit={handleDraftEdit}
      />
    </div>
  );
};

export default ChatBox;
