"use client";
import React, { useEffect, useRef } from "react";
import Drawer from "./ui/Drawer";
import { Button } from "./ui/Button";
import ReactQuill from "react-quill";
import { BookTextIcon } from "lucide-react";

interface IProps {
  draft: string;
  isOpen?: boolean;
  onCancel: () => void;
  onSubmit: (data: string) => void;
}

const modules = {
  toolbar: [
    [{ header: [1, 2, false] }],
    ["bold", "italic", "underline", "strike", "blockquote"],
    [
      { list: "ordered" },
      { list: "bullet" },
      { indent: "-1" },
      { indent: "+1" },
    ],
    ["link", "image"],
    ["clean"],
  ],
};

const formats = [
  "header",
  "bold",
  "italic",
  "underline",
  "strike",
  "blockquote",
  "list",
  "bullet",
  "indent",
  "link",
  "image",
];

const ChatDraftDrawer = ({
  isOpen = true,
  draft,
  onSubmit,
  onCancel,
}: IProps) => {
  const quillRef = useRef<ReactQuill | null>(null);

  useEffect(() => {
    if (quillRef.current) {
      const editor = quillRef.current.getEditor();
      const editorContainer = editor.root;
      if (editorContainer) {
        editorContainer.scrollTop = editorContainer.scrollHeight;
      }
    }
  }, [draft]);

  return (
    <Drawer isOpen={isOpen} onClose={onCancel} title="Draft Chat">
      <div className="flex flex-col h-full">
        <ReactQuill
          ref={quillRef}
          theme="snow"
          value={draft}
          onChange={onSubmit}
          modules={modules}
          formats={formats}
        />
        <div className="sticky bottom-0 bg-white pb-4">
          <div className="flex gap-2">
            <Button
              // onClick={onSubmit}
              className="mt-4 px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark"
            >
              <BookTextIcon className="inline-block mr-2" size={16} />
              Rewrite with AI
            </Button>
          </div>
        </div>
      </div>
    </Drawer>
  );
};

export default ChatDraftDrawer;
