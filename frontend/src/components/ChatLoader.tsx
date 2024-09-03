"use client";
import React from "react";
import { ChatBubbleWrapper } from "./ui/ChatBubble";

const ChatLoader = () => {
  return (
    <ChatBubbleWrapper>
      <div className="circle-wrapper">
        <div className="circle" id="circle1"></div>
        <div className="circle" id="circle2"></div>
        <div className="circle" id="circle3"></div>
      </div>
    </ChatBubbleWrapper>
  );
};
export default ChatLoader;
