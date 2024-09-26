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
          <Link
            href="/settings"
            className="flex items-center text-sm text-gray-700"
          >
            <Settings className="w-5 h-5 mr-2" />
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
