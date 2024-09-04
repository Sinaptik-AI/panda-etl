"use client";
import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import Tooltip from "@/components/ui/Tooltip";

interface AccordionProps {
  title: string;
  children: React.ReactNode;
  isSelected: boolean;
  onSelect: () => void;
  disabled?: boolean;
  disabledWarning?: string;
}

const SelectableAccordion: React.FC<AccordionProps> = ({
  title,
  children,
  isSelected,
  onSelect,
  disabled = false,
  disabledWarning = "Not selectable",
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const accordionContent = (
    <div
      className={`border rounded-lg overflow-hidden ${
        disabled ? "opacity-50 cursor-not-allowed" : ""
      }`}
    >
      <div
        className={`flex items-center justify-between p-4 ${
          disabled ? "bg-gray-200" : "bg-gray-100 hover:bg-gray-200"
        }`}
      >
        <div className="flex items-center">
          <input
            type="radio"
            checked={isSelected}
            onChange={onSelect}
            className="mr-2"
            disabled={disabled}
          />
          <span className="font-semibold">{title}</span>
        </div>

        <div
          className={`focus:outline-none flex items-center ${
            disabled ? "cursor-not-allowed" : "cursor-pointer"
          }`}
          onClick={() => !disabled && setIsOpen(!isOpen)}
        >
          <span className="text-gray-600">
            {isOpen ? (
              <ChevronUp className="w-5 h-5" />
            ) : (
              <ChevronDown className="w-5 h-5" />
            )}
          </span>
        </div>
      </div>

      {isOpen && !disabled && <div className="p-4">{children}</div>}
    </div>
  );

  return (
    <div className="relative">
      {disabled ? (
        <Tooltip content={disabledWarning}>{accordionContent}</Tooltip>
      ) : (
        accordionContent
      )}
    </div>
  );
};

export default SelectableAccordion;
