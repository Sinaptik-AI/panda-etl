import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";

interface ChatBubbleProps {
  message: string;
  timestamp: Date;
  sender: "user" | "bot";
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
  sender,
}) => {
  const markify_text = (text: string) => {
    return text.replace(/\n/g, "<br>");
  };

  return (
    <ChatBubbleWrapper sender={sender}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
        {markify_text(message)}
      </ReactMarkdown>
      <div className="text-xs text-gray-500 mt-2 text-right">
        {timestamp.toLocaleTimeString()}
      </div>
    </ChatBubbleWrapper>
  );
};
export default ChatBubble;
