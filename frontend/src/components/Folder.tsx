// components/Folder.tsx
import React from "react";
import { Folder as FolderIcon } from "lucide-react"; // Using Lucide React for the folder icon

interface FolderProps {
  name: string;
  onClick: () => void;
}

const Folder: React.FC<FolderProps> = ({ name, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="cursor-pointer w-48 h-48 flex flex-col items-center justify-center bg-gray-50 border rounded shadow hover:bg-gray-100"
    >
      <FolderIcon className="h-12 w-12 text-gray-500" />
      <h3 className="font-bold mt-2 text-center text-sm">{name}</h3>
    </div>
  );
};

export default Folder;
