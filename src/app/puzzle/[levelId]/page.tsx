"use client";

import { Canvas } from "@react-three/fiber";
import { KeyboardControls, OrbitControls } from "@react-three/drei";
import BasePlateRotationScrollBar from "@/components/BasePlateRotationScrollBar";
import UserBuildRenderer from "@/components/UserBuildRenderer";
import TargetBuildRenderer from "@/components/TargetBuildRenderer";
import PieceInventory from "@/components/PieceInventory";
import SceneCamera from "@/components/SceneCamera";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import SceneBuilder from "@/components/SceneRenderer";
import { useInventoryManager } from "@/stores/useInventoryManager";
import BasePlateRenderer from "@/components/BasePlateRenderer";
import { transformLevelData } from "@/utils/dataUtils";
import SettingsButton from "@/components/SettingsButton";
import ImportLevelsButton from "@/components/ImportLevelsButton";
import Link from "next/link";
import { DefinedPieceId } from "@/types";

export default function PuzzleLevel() {
  const params = useParams<{ levelId: string }>();
  const levelId = params.levelId;
  const [mode, setMode] = useState<"user" | "target">("user");

  useMemo(() => {
    try {
      // Extract the level number from the levelId (e.g., "level_2" -> "2")
      const levelNumber = levelId.split('_')[1];
      // Dynamically import the level data based on level number
      const levelData = require(`@/data/levels/base/level_${levelNumber}.json`);
      const data = transformLevelData(levelData);

      useInventoryManager.getState().setAllPiecesToZero();

      // get number of each piece in the level
      const pieceCounts = data.pieces.reduce((acc: Record<string, number>, p) => {
        acc[p.pieceId] = (acc[p.pieceId] || 0) + 1;
        return acc;
      }, {});

      console.log(`Loading level ${levelNumber} with pieces:`, pieceCounts);

      // Set inventory to the number of each piece in the level
      const inventory = useInventoryManager.getState().inventory;

      Object.keys(pieceCounts).forEach((pieceId) => {
        inventory.set(pieceId as DefinedPieceId, pieceCounts[pieceId]);
      });
    } catch (error) {
      console.error(`Error loading level ${levelId}:`, error);
    }
  }, [levelId]);

  return (
    <div
      style={{
        position: "relative",
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
      }}
    >
      <div className="absolute bottom-24 right-4 flex gap-4 z-20">
          <Link
          href={`/tutorial?returnTo=/puzzle/${levelId}`}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg shadow hover:bg-purple-700 font-semibold"
        >
          Tutorial
        </Link>
      </div>
      <div className="absolute top-4 left-4 flex gap-4 z-20">
        <div className="absolute top-4 left-4 flex flex-col gap-4 z-10">
        <h1 className="text-2xl font-bold text-white mb-2">Level {levelId.split('_')[1]}</h1>
        <div className="flex space-x-2">
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
      </div>
          <ImportLevelsButton />
        </div>
      </div>

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
          <SceneBuilder />
          <BasePlateRenderer />
          {mode === "user" && <UserBuildRenderer />}
          {mode === "target" && <TargetBuildRenderer levelId={levelId} />}
          <OrbitControls target={[3, 1, -5]} />
        </Canvas>
      </KeyboardControls>

      <BasePlateRotationScrollBar />

      <PieceInventory />
    </div>
  );
}
