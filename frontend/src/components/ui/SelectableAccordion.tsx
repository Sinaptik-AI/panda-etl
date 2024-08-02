"use client";
import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { RadioGroupItem } from "./RadioGroup";

interface AccordionProps {
  title: string;
  children: React.ReactNode;
  isSelected: boolean;
  onSelect: () => void;
}

const SelectableAccordion: React.FC<AccordionProps> = ({ title, children, isSelected, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="flex items-center justify-between p-4 bg-gray-100 hover:bg-gray-200">
        <div className="flex items-center">
          <input
            type="radio"
            checked={isSelected}
            onChange={onSelect}
            className="mr-2"
          />
          
          <span className="font-semibold">
            {title}
          </span>
        </div>

        <div
          className="focus:outline-none flex items-center"
          onClick={() => setIsOpen(!isOpen)}
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
      {isOpen && <div className="p-4">{children}</div>}
    </div>
  );
};

export default SelectableAccordion;
