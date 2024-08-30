import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { chat, chatStatus } from "@/services/chat";
import LogoDark from "@/icons/LogoDark";
import ChatLoader from "./ChatLoader";
import { useQuery } from "@tanstack/react-query";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { motion } from "framer-motion";

export const NoChatPlaceholder = () => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center">
      <Image
        src="/build_chat.svg"
        className="mb-6"
        alt="Chat loaing"
        width={384}
        height={384}
      />
      <div className="text-center max-w-lg">
        Please wait a moment while we process the uploaded documents for chat.
        This may take a few minutes. Feel free to revisit this page shortly.
      </div>
    </div>
  );
};

interface ChatMessage {
  sender: string;
  text: string;
  timestamp: Date;
}

interface ChatProps {
  project_id?: string;
  messages: Array<ChatMessage>;
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  chatEnabled: boolean;
  setChatEnabled: React.Dispatch<React.SetStateAction<boolean>>;
}

const ChatBox = ({
  project_id,
  messages,
  setMessages,
  chatEnabled,
  setChatEnabled,
}: ChatProps) => {
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLInputElement | null>(null);

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
      timestamp: new Date(),
    };
    setLoading(false);

    setMessages((prevMessages) => [...prevMessages, bot_response]);
    setConversationId(response.conversation_id);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const markify_text = (text: string) => {
    return text.replace(/\n/g, "<br>");
  };

  return (
    <div className="flex flex-col" style={{ minHeight: "calc(100vh - 18rem)" }}>
      {isLoading || !chatEnabled ? (
        <NoChatPlaceholder />
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
                    <LogoDark color="black" width="100%" />
                  </div>
                )}
                <div className="p-3 rounded-lg max-w-xl bg-white text-black">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeRaw]}
                  >
                    {markify_text(message.text)}
                  </ReactMarkdown>
                  <div className="text-xs text-gray-500 mt-2 text-right">
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              </motion.div>
            ))}
            {messages.length === 0 && (
              <div className="mb-4 flex justify-start">
                <div style={{ minWidth: "40px", width: "40px" }}>
                  <LogoDark color="black" width="100%" />
                </div>

                <div className="p-3 rounded-lg max-w-xl bg-white text-black">
                  How can I help you today?
                </div>
              </div>
            )}
            {loading && (
              <div className="my-4 flex justify-start">
                <div style={{ minWidth: "40px", width: "40px" }}>
                  <LogoDark color="black" width="100%" />
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
            <div>
              <Button onClick={handleSend} variant="secondary">
                Send
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ChatBox;
