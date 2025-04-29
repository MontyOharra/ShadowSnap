"use client";

import { Canvas } from "@react-three/fiber";
import { KeyboardControls, OrbitControls } from "@react-three/drei";
import { useEffect, useState } from "react";
import BasePlateRotationScrollBar from "@/components/BasePlateRotationScrollBar";
import UserBuildRenderer from "@/components/UserBuildRenderer";
import TargetBuildRenderer from "@/components/TargetBuildRenderer";
import PieceInventory from "@/components/PieceInventory";
import SceneCamera from "@/components/SceneCamera";
import { transformLevelData } from "@/utils/dataUtils";
import SceneBuilder from "@/components/SceneRenderer";
import { useInventoryManager } from "@/stores/useInventoryManager";
import BasePlateRenderer from "@/components/BasePlateRenderer";
import SettingsButton from "@/components/SettingsButton";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useBuildManager } from "@/stores/useBuildManager";

// Define the LevelData interface
interface LevelData {
  id: string;
  name: string;
  pieces: Array<{
    pieceId: string;
    color: string;
    position: [number, number, number];
    rotation: [number, number, number];
  }>;
  createdBy?: string;
}

export default function CustomPuzzleLevel() {
  const [mode, setMode] = useState<"user" | "target">("user");
  const [levelData, setLevelData] = useState<LevelData | null>(null);
  const [levelName, setLevelName] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Load level data from localStorage
    try {
      const storedData = localStorage.getItem("customLevelData");
      const storedName = localStorage.getItem("customLevelName");

      if (!storedData) {
        alert("No level data found. Returning to level selection.");
        router.push("/puzzle/menu");
        return;
      }

      const parsedData = JSON.parse(storedData) as LevelData;
      setLevelData(parsedData);
      setLevelName(storedName || "Custom Level");

      // Reset the build manager pieces to an empty array
      useBuildManager.getState().import({ pieces: [] });

      // Set up inventory based on level data
      const data = transformLevelData(parsedData);
      useInventoryManager.getState().setAllPiecesToZero();

      // Get number of each piece in the level
      const pieceCounts = data.pieces.reduce(
        (acc: Record<string, number>, p) => {
          acc[p.pieceId] = (acc[p.pieceId] || 0) + 1;
          return acc;
        },
        {}
      );

      // Set inventory to the number of each piece in the level
      const inventory = useInventoryManager.getState().inventory;
      Object.keys(pieceCounts).forEach((pieceId) => {
        inventory.set(pieceId, pieceCounts[pieceId]);
      });

      setIsLoading(false);
    } catch (error) {
      console.error("Error loading custom level:", error);
      alert("Failed to load custom level. Returning to level selection.");
      router.push("/puzzle/menu");
    }
  }, [router]);

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gray-100">
        <div className="text-2xl">Loading custom level...</div>
      </div>
    );
  }

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
      <div className="absolute top-4 left-4 flex space-x-2 z-10">
        <Link
          href="/puzzle/menu"
          className="px-4 py-3 bg-white rounded-lg shadow font-bold border border-gray-300 hover:bg-gray-100"
        >
          ← Back
        </Link>
        <button
          className={`px-6 py-3 rounded-lg font-bold shadow transition-colors ${
            mode === "user"
              ? "bg-blue-600 text-white"
              : "bg-white text-blue-600 border border-blue-600"
          }`}
          onClick={() => setMode("user")}
        >
          User Build
        </button>
        <button
          className={`px-6 py-3 rounded-lg font-bold shadow transition-colors ${
            mode === "target"
              ? "bg-blue-600 text-white"
              : "bg-white text-blue-600 border border-blue-600"
          }`}
          onClick={() => setMode("target")}
        >
          Target Build
        </button>
        <div className="px-4 py-3 bg-gray-200 rounded-lg shadow">
          {levelName.replace(".json", "")}
        </div>
      </div>
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
          <SceneBuilder />
          <BasePlateRenderer />
          {mode === "user" && <UserBuildRenderer />}
          {mode === "target" && levelData && (
            <TargetBuildRenderer levelData={levelData} />
          )}
          <OrbitControls target={[3, 1, -5]} />
        </Canvas>
      </KeyboardControls>
      <BasePlateRotationScrollBar />
      <PieceInventory />
    </div>
  );
}
