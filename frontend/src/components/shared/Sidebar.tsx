"use client";
import React from "react";
import { X, Bookmark, Folder, MessageCircle, Settings } from "lucide-react";
import { useSidebar } from "@/context/SidebarContext";

const Sidebar: React.FC = () => {
  const { isSidebarOpen, setIsSidebarOpen } = useSidebar();
  const bookmarkedFolders = [
    "Work",
    "Personal",
    "Projects",
    "Invoices",
    "Receipts",
  ];

  return (
    <aside
      className={`w-64 bg-white shadow-md fixed h-full z-20 transition-transform duration-300 ease-in-out ${
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      } md:translate-x-0`}
    >
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">BambooETL</h2>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="md:hidden focus:outline-none"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>
        <ul>
          {bookmarkedFolders.map((folder, index) => (
            <li key={index} className="mb-2">
              <a
                href="#"
                className="flex items-center text-gray-700 hover:text-blue-500"
              >
                <Bookmark className="w-5 h-5 mr-2" />
                {folder}
              </a>
            </li>
          ))}
          <li className="mb-2">
            <a
              href="#"
              className="flex items-center text-gray-700 hover:text-blue-500"
            >
              <Folder className="w-5 h-5 mr-2" />
              All Files
            </a>
          </li>
        </ul>
      </div>
      <div className="absolute bottom-0 left-0 w-full p-4 border-t">
        <ul>
          <li className="mb-2">
            <a
              href="#"
              className="flex items-center text-gray-700 hover:text-blue-500"
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              Contact us
            </a>
          </li>
          <li className="mb-2">
            <a
              href="#"
              className="flex items-center text-gray-700 hover:text-blue-500"
            >
              <Settings className="w-5 h-5 mr-2" />
              Settings
            </a>
          </li>
          <li className="flex justify-between text-sm text-gray-500">
            <a href="#" className="hover:text-blue-500">
              Terms
            </a>
            <a href="#" className="hover:text-blue-500">
              Privacy Policy
            </a>
          </li>
        </ul>
      </div>
    </aside>
  );
};

export default Sidebar;
