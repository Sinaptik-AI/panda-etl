"use client";
import React, { useState } from "react";

interface Tab {
  id: string;
  label: string;
}

interface TabListProps {
  tabs: Tab[];
  onTabChange: (tabId: string) => void;
  defaultActiveTab?: string;
}

const TabList: React.FC<TabListProps> = ({
  tabs,
  onTabChange,
  defaultActiveTab,
}) => {
  const [activeTab, setActiveTab] = useState<string>(
    defaultActiveTab || tabs[0].id
  );

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    onTabChange(tabId);
  };

  return (
    <div className="mb-4">
      <nav className="flex border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabClick(tab.id)}
            className={`py-4 mr-6 font-medium text-sm ${
              activeTab === tab.id
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default TabList;
