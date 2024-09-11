import React, { useEffect, useRef } from "react";

interface IframeViewerProps {
  url: string;
  height?: string;
}

const WebsiteViewer: React.FC<IframeViewerProps> = ({
  url,
  height = "100vh",
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const handleResize = () => {
      if (iframeRef.current) {
        iframeRef.current.style.height = `${window.innerHeight}px`;
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div style={{ width: "100%", height, overflow: "hidden" }}>
      <iframe
        ref={iframeRef}
        src={url}
        style={{
          border: "none",
          width: "100%",
          height: "100%",
        }}
        sandbox="allow-scripts allow-same-origin allow-popups"
      >
        Your browser does not support iframes.
      </iframe>
    </div>
  );
};

export default WebsiteViewer;
