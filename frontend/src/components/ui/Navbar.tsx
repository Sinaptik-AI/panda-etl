"use client";
import React, { useState } from "react";
import { Menu, User, ChevronDown, Settings } from "lucide-react";
import { useSidebar } from "@/context/SidebarContext";
import Link from "next/link";

const Navbar: React.FC = () => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { setIsSidebarOpen } = useSidebar();

  return (
    <header className="bg-white shadow-sm">
      <div className="flex items-center justify-between px-6 py-3">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setIsSidebarOpen((prev) => !prev)}
            className="md:hidden focus:outline-none"
          >
            <Menu className="w-6 h-6 text-gray-500" />
          </button>
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
              <Link
                href="/user/settings"
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <Settings className="w-5 h-5 mr-2" />
                Manage settings
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
