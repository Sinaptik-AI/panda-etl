"use client";
import React, { useState } from "react";
import { Menu, User, ChevronDown } from "lucide-react";
import { useSidebar } from "@/context/SidebarContext";

const Navbar: React.FC = () => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { setIsSidebarOpen } = useSidebar();

  return (
    <header className="bg-white shadow-sm">
      <div className="flex items-center justify-between px-6 py-3">
        <div className="flex items-center">
          <button
            onClick={() => setIsSidebarOpen((prev) => !prev)}
            className="md:hidden mr-4 focus:outline-none"
          >
            <Menu className="w-6 h-6 text-gray-500" />
          </button>
          <h2 className="text-xl font-semibold">All files</h2>
        </div>
        <div className="relative">
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center focus:outline-none"
          >
            <User className="w-8 h-8 text-gray-500" />
            <ChevronDown className="w-4 h-4 ml-1 text-gray-500" />
          </button>
          {isUserMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1">
              <a
                href="#"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Manage settings
              </a>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
