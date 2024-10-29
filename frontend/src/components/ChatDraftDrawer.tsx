"use client";
import React, { useEffect, useState } from "react";
import Drawer from "./ui/Drawer";
import { Button } from "./ui/Button";
import ReactQuill from "react-quill";
import { Save, BookTextIcon } from "lucide-react";

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
  const [draftEdit, setDraftEdit] = useState<string>(draft);

  useEffect(() => {
    setDraftEdit(draft);
  }, [draft, isOpen]);

  const setEditedSummary = (data: string) => {
    setDraftEdit(data);
  };

  return (
    <Drawer isOpen={isOpen} onClose={onCancel} title="Draft Chat">
      <div className="flex flex-col h-full">
        <ReactQuill
          theme="snow"
          value={draftEdit}
          onChange={setEditedSummary}
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
              Format
            </Button>
            <Button
              onClick={() => {
                onSubmit(draftEdit);
              }}
              className="mt-4 px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark"
            >
              <Save className="inline-block mr-2" size={16} />
              Save
            </Button>
          </div>
        </div>
      </div>
    </Drawer>
  );
};

export default ChatDraftDrawer;
