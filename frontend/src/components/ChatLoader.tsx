"use client";
import React from "react";

const ChatLoader = () => {
  return (
    <div>
      <div className="chat-bubble">
        <div className="circle-wrapper">
          <div className="circle" id="circle1"></div>
          <div className="circle" id="circle2"></div>
          <div className="circle" id="circle3"></div>
        </div>
      </div>
    </div>
  );
};
export default ChatLoader;
