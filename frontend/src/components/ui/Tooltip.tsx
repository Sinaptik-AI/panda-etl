import React from "react";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css"; // Import Tippy's default styles

interface TooltipWrapperProps {
  content: string;
  children: React.ReactNode;
  delay?: number;
}

const TooltipWrapper: React.FC<TooltipWrapperProps> = ({
  content,
  children,
  delay = 0,
}) => {
  if (!content) {
    return <>{children}</>;
  }

  return (
    <Tippy content={content} delay={[delay, 0]} arrow={true} placement="top">
      <div>{children}</div>
    </Tippy>
  );
};

export default TooltipWrapper;
