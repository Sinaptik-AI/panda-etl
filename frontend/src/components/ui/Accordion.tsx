"use client";
import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface AccordionProps {
  title: string;
  children: React.ReactNode;
}

const Accordion: React.FC<AccordionProps> = ({ title, children }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border rounded-lg overflow-hidden">
      <button
        className="w-full text-left p-4 bg-gray-100 hover:bg-gray-200 focus:outline-none flex justify-between items-center"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="text-primary hover:text-primary-dark font-semibold">
          {title}
        </span>

        <span className="text-gray-600">
          {isOpen ? (
            <ChevronUp className="w-5 h-5" />
          ) : (
            <ChevronDown className="w-5 h-5" />
          )}
        </span>
      </button>
      {isOpen && <div className="p-4">{children}</div>}
    </div>
  );
};

export default Accordion;
