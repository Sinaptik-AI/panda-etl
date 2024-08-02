import React, { useState } from 'react';


interface ChipProps {
  label: string;
  isSelected: boolean;
  onClick: () => void;
}

export const Chip: React.FC<ChipProps> = ({ label, isSelected, onClick }) => {
  return (
    <button
      className={`px-4 py-2 rounded-full m-1 ${
        isSelected ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
      }`}
      onClick={onClick}
    >
      {label}
    </button>
  );
};