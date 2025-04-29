"use client";

import React, { useRef } from "react";
import { useRouter } from "next/navigation";

export default function ImportLevelCard({ className = "" }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // File is selected, navigate to custom_level with the file
    // We'll encode the file path and pass it in the URL
    // The actual file will be passed via localStorage to avoid URL size limits
    try {
      // Store file content in localStorage temporarily
      const fileContent = await file.text();
      localStorage.setItem("customLevelData", fileContent);
      localStorage.setItem("customLevelName", file.name);

      // Navigate to the custom level page
      router.push(`/puzzle/custom_level`);
    } catch (error) {
      console.error("Error reading file:", error);
      alert("Failed to read level file. Please try again.");
    }
  };

  const handleClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`relative flex flex-col items-center rounded-xl border-2 border-gray-300 bg-white shadow-md transition-all duration-200 overflow-hidden focus:outline-none focus:ring-2 focus:ring-blue-400 hover:shadow-lg cursor-pointer ${className}`}
    >
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        accept=".json"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Icon/Image */}
      <div className="w-full h-3/4 mt-2 px-6 bg-gray-200 rounded-md flex items-center justify-center text-5xl text-gray-500">
        <span>+</span>
      </div>

      {/* Card Title */}
      <div className="flex-1 flex items-center justify-center w-full">
        <span className="text-2xl font-bold text-center w-full px-2">
          Import Level
        </span>
      </div>
    </button>
  );
}
