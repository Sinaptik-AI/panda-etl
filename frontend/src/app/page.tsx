"use client";
import React, { useState } from "react";
import Head from "next/head";
import Folder from "../components/Folder";

interface FolderData {
  name: string;
  id: string;
}

export default function Drive() {
  const [folders, setFolders] = useState<FolderData[]>([
    { name: "Folder 1", id: "1" },
    { name: "Folder 2", id: "2" },
    { name: "Folder 3", id: "3" },
  ]);

  const handleFolderClick = (id: string) => {
    console.log(`Folder clicked: ${id}`);
    // Here you can implement the logic to navigate into the folder, e.g., fetch and display the files within the folder
  };

  return (
    <>
      <Head>
        <title>BambooETL - Folders</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <h1 className="text-3xl font-bold mb-6">My folders</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
        {folders.map((folder) => (
          <Folder
            key={folder.id}
            name={folder.name}
            onClick={() => handleFolderClick(folder.id)}
          />
        ))}
      </div>
    </>
  );
}
