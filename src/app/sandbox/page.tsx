"use client";

import { Canvas } from "@react-three/fiber";
import { KeyboardControls, OrbitControls } from "@react-three/drei";
import BasePlateRotationScrollBar from "@/components/BasePlateRotationScrollBar";
import UserBuildBuilder from "../../components/UserBuildRenderer";
import SceneBuilder from "../../components/SceneRenderer";
import PieceInventory from "@/components/PieceInventory";
import { useInventoryManager } from "@/stores/useInventoryManager";
import { useEffect, useState } from "react";
import SceneCamera from "@/components/SceneCamera";
import SettingsButton from "@/components/SettingsButton";
import { useBuildManager } from "@/stores/useBuildManager";
import { saveLevelData } from "@/utils/dataUtils";
import BasePlateRenderer from "@/components/BasePlateRenderer";

export default function SandboxPage() {
  const setAllPiecesToInfinity = useInventoryManager(
    (s) => s.setAllPiecesToInfinity
  );
  const exportBuild = useBuildManager((s) => s.export);
  const [levelName, setLevelName] = useState("");
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  // Set all pieces to infinity when entering sandbox mode
  useEffect(() => {
    setAllPiecesToInfinity();
  }, [setAllPiecesToInfinity]);

  const handleSaveLevel = async () => {
    if (!levelName.trim()) {
      setSaveMessage("Please enter a level name");
      return;
    }

    try {
      const buildData = exportBuild();
      await saveLevelData(levelName, buildData.pieces);
      setSaveMessage("Level saved successfully!");
      setLevelName("");
      setTimeout(() => {
        setShowSaveDialog(false);
        setSaveMessage("");
      }, 2000);
    } catch (error) {
      console.error("Error saving level:", error);
      setSaveMessage("Failed to save level. Please try again.");
    }
  };

  return (
    <div
      style={{
        position: "relative",
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
      }}
    >
      <SettingsButton />
      <KeyboardControls
        map={[
          { name: "left", keys: ["ArrowLeft", "a"] },
          { name: "right", keys: ["ArrowRight", "d"] },
          { name: "up", keys: ["ArrowUp", "w"] },
          { name: "down", keys: ["ArrowDown", "s"] },
          { name: "add", keys: ["Space"] },
          { name: "place", keys: ["p"] },
          { name: "esc", keys: ["Escape"] },
          { name: "q", keys: ["q"] },
          { name: "e", keys: ["e"] },
          { name: "delete", keys: ["Backspace"] },
        ]}
      >
        <Canvas shadows>
          {/* darker background color */}
          <color attach="background" args={["#303030"]} />
          <SceneCamera />
          <UserBuildBuilder />
          <SceneBuilder />
          <BasePlateRenderer />
          <OrbitControls target={[3, 1, -5]} />
        </Canvas>
      </KeyboardControls>

      <BasePlateRotationScrollBar />
      <PieceInventory />

      {/* Save Level Button */}
      <button
        className="absolute bottom-4 left-1/2 transform -translate-x-1/2 px-6 py-3 bg-green-600 text-white rounded-lg font-bold shadow hover:bg-green-700 transition-colors"
        onClick={() => setShowSaveDialog(true)}
      >
        Save Level
      </button>

      {/* Save Level Dialog */}
      {showSaveDialog && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-80">
            <h2 className="text-xl font-bold mb-4">Save Level</h2>
            <input
              type="text"
              value={levelName}
              onChange={(e) => setLevelName(e.target.value)}
              placeholder="Enter level name"
              className="w-full px-3 py-2 border border-gray-300 rounded-md mb-4"
            />
            {saveMessage && (
              <p
                className={`text-sm ${
                  saveMessage.includes("success")
                    ? "text-green-600"
                    : "text-red-600"
                } mb-2`}
              >
                {saveMessage}
              </p>
            )}
            <div className="flex justify-end space-x-2">
              <button
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
                onClick={() => {
                  setShowSaveDialog(false);
                  setSaveMessage("");
                }}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                onClick={handleSaveLevel}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
