"use client";
import React, { useEffect, useRef, useState } from "react";
import Drawer from "./ui/Drawer";
import { Button } from "./ui/Button";
import ReactQuill from "react-quill";
import { BookTextIcon, Check, Loader2, X } from "lucide-react";
import { Textarea } from "./ui/Textarea";
import { draft_with_ai } from "@/services/chat";
import toast from "react-hot-toast";

interface IProps {
  draft: string;
  isOpen?: boolean;
  onCancel: () => void;
  onSubmit: (data: string) => void;
}

const quill_modules = {
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

const quill_formats = [
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
  const [step, setStep] = useState<number>(0);
  const [userInput, setUserInput] = useState<string>("");
  const [aiDraft, setAIDraft] = useState<string>("");
  const [loadingAIDraft, setLoadingAIDraft] = useState<boolean>(false);

  useEffect(() => {
    if (quillRef.current) {
      const editor = quillRef.current.getEditor();
      const editorContainer = editor.root;
      if (editorContainer) {
        editorContainer.scrollTop = editorContainer.scrollHeight;
      }
    }
  }, [draft]);

  const handleUserInputChange = (
    event: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setUserInput(event.target.value);
  };

  const handleUserInputKeyPress = async (
    event: React.KeyboardEvent<HTMLTextAreaElement>
  ) => {
    if (event.key === "Enter" && userInput.trim() !== "") {
      event.preventDefault();
      try {
        if (userInput.length === 0) {
          toast.error("Please provide the prompt and try again!");
          return;
        }
        setLoadingAIDraft(true);
        const data = await draft_with_ai({ content: draft, prompt: userInput });
        setAIDraft(data.response);
        setUserInput("");
        setStep(2);
        setLoadingAIDraft(false);
      } catch (error) {
        console.error(error);
        toast.error(error instanceof Error ? error.message : String(error));
        setLoadingAIDraft(false);
      }
    }
  };

  return (
    <Drawer isOpen={isOpen} onClose={onCancel} title="Draft Chat">
      <div className="flex flex-col h-full">
        {(step === 0 || step === 1) && (
          <>
            <ReactQuill
              ref={quillRef}
              theme="snow"
              value={draft}
              onChange={onSubmit}
              modules={quill_modules}
              formats={quill_formats}
            />

            <div className="sticky bottom-0 bg-white pb-4 pt-4">
              <Button
                onClick={() => {
                  setStep(1);
                }}
                disabled={draft.length == 0}
                className="px-4 bg-primary text-white rounded hover:bg-primary-dark"
              >
                <BookTextIcon className="inline-block mr-2" size={16} />
                Rewrite with AI
              </Button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <ReactQuill
              ref={quillRef}
              theme="snow"
              value={aiDraft}
              readOnly={true}
              modules={{ toolbar: false }}
            />

            <div className="sticky bottom-0 bg-white pb-4">
              <div className="flex gap-2">
                <Button
                  onClick={() => setStep(0)}
                  className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-800"
                >
                  <X className="inline-block mr-2" size={16} />
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    onSubmit(aiDraft);
                    setStep(0);
                  }}
                  className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-800"
                >
                  <Check className="inline-block mr-2" size={16} />
                  Accept
                </Button>
                <Button
                  onClick={() => setStep(1)}
                  className="mt-4 px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark"
                >
                  <BookTextIcon className="inline-block mr-2" size={16} />
                  Rewrite
                </Button>
              </div>
            </div>
          </>
        )}
        {/* Centered overlay input for step 1 */}
        {step === 1 && (
          <div className="absolute inset-0 flex items-center justify-center z-50 bg-opacity-75 bg-gray-800">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full text-center">
              {loadingAIDraft ? (
                <Loader2 className="mx-auto my-4 h-8 w-8 animate-spin text-gray-500" />
              ) : (
                <>
                  <Textarea
                    className="w-full p-2 border border-gray-300 rounded mb-4"
                    placeholder="Write prompt to edit content and press enter..."
                    value={userInput}
                    onChange={handleUserInputChange}
                    onKeyDown={handleUserInputKeyPress}
                  />
                  <Button
                    onClick={() => setStep(0)}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    Close
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </Drawer>
  );
};

export default ChatDraftDrawer;
