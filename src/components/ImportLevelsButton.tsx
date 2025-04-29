"use client";

import { useState, useRef } from "react";
import { loadLevelData, transformLevelData } from "@/utils/dataUtils";
import { useBuildManager } from "@/stores/useBuildManager";
import { useInventoryManager } from "@/stores/useInventoryManager";
import { DefinedPieceId } from "@/types";

interface ImportLevelsButtonProps {
  className?: string;
}

export default function ImportLevelsButton({
  className = "",
}: ImportLevelsButtonProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState("");
  const [showMessage, setShowMessage] = useState(false);
  const importLevel = useBuildManager((s) => s.import);

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      // Load and validate the level data
      const levelData = await loadLevelData(file);
      const transformedData = transformLevelData(levelData);

      // Reset the current build
      useBuildManager.getState().import({ pieces: [] });

      // Set inventory based on the level's pieces
      const pieceCounts = levelData.pieces.reduce(
        (acc: Record<string, number>, p) => {
          acc[p.pieceId] = (acc[p.pieceId] || 0) + 1;
          return acc;
        },
        {}
      );

      // Reset inventory
      useInventoryManager.getState().setAllPiecesToZero();
      const inventory = useInventoryManager.getState().inventory;

      // Set inventory to match the level
      Object.keys(pieceCounts).forEach((pieceId) => {
        inventory.set(pieceId as DefinedPieceId, pieceCounts[pieceId]);
      });

      // Import the level data into the build manager
      importLevel(transformedData);

      // Show success message
      setMessage(`Level "${levelData.name}" imported successfully!`);
      setShowMessage(true);

      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      // Hide message after 3 seconds
      setTimeout(() => {
        setShowMessage(false);
      }, 3000);
    } catch (error) {
      console.error("Error importing level:", error);
      setMessage("Failed to import level. Please check the file format.");
      setShowMessage(true);

      // Hide error message after 3 seconds
      setTimeout(() => {
        setShowMessage(false);
      }, 3000);
    }
  };

  const handleClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="relative">
      <button
        className={`px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition-colors ${className}`}
        onClick={handleClick}
      >
        Import Level
      </button>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".json"
        className="hidden"
      />

      {/* Message toast */}
      {showMessage && (
        <div className="absolute top-full left-0 mt-2 p-3 bg-gray-800 text-white rounded-md shadow-lg z-50 whitespace-nowrap">
          {message}
        </div>
      )}
    </div>
  );
}
