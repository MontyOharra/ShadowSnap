"use client";

import { Canvas } from "@react-three/fiber";
import { KeyboardControls, OrbitControls } from "@react-three/drei";
import BasePlateRotationScrollBar from "@/components/BasePlateRotationScrollBar";
import UserBuildRenderer from "@/components/UserBuildRenderer";
import TargetBuildRenderer from "@/components/TargetBuildRenderer";
import PieceInventory from "@/components/PieceInventory";
import SceneCamera from "@/components/SceneCamera";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import SceneBuilder from "@/components/SceneRenderer";
import { useInventoryManager } from "@/stores/useInventoryManager";
import BasePlateRenderer from "@/components/BasePlateRenderer";
import { transformLevelData } from "@/utils/dataUtils";
import SettingsButton from "@/components/SettingsButton";
import Link from "next/link";
import { useBuildManager } from "@/stores/useBuildManager";
import { usePlayer } from "@/stores/usePlayer";
import { DefinedPieceId } from "@/types";

interface PieceData {
  pieceId: string;
  position: [number, number, number];
  rotation?: [number, number, number];
  color?: string;
}

export default function PuzzleLevel() {
  const params = useParams<{ levelId: string }>();
  const levelId = params.levelId;
  const router = useRouter();
  const [mode, setMode] = useState<"user" | "target">("user");
  const [targetPieces, setTargetPieces] = useState<PieceData[]>([]);
  const [isLevelLoaded, setIsLevelLoaded] = useState(false);

  // Get user build pieces from store
  const userPieces = useBuildManager((state) => state.pieces);

  // Get player functions for level completion
  const addCompletedLevel = usePlayer((state) => state.addCompletedLevel);
  const unlockLevel = usePlayer((state) => state.unlockLevel);

  // Load level data
  useEffect(() => {
    try {
      // Extract the level number from the levelId (e.g., "level_2" -> "2")
      const levelNumber = levelId.split("_")[1];
      // Dynamically import the level data based on level number
      import(`@/data/levels/base/level_${levelNumber}.json`)
        .then((levelModule) => {
          const levelData = levelModule.default;
          const data = transformLevelData(levelData);

          // Set target pieces for comparison
          setTargetPieces(data.pieces);

          // Reset inventory
          useInventoryManager.getState().setAllPiecesToZero();

          // Get number of each piece in the level
          const pieceCounts = data.pieces.reduce(
            (acc: Record<string, number>, p) => {
              acc[p.pieceId] = (acc[p.pieceId] || 0) + 1;
              return acc;
            },
            {}
          );

          console.log(`Loading level ${levelNumber} with pieces:`, pieceCounts);

          // Set inventory to the number of each piece in the level
          const inventory = useInventoryManager.getState().inventory;

          Object.keys(pieceCounts).forEach((pieceId) => {
            inventory.set(pieceId as DefinedPieceId, pieceCounts[pieceId]);
          });

          setIsLevelLoaded(true);
        })
        .catch((error) => {
          console.error(`Error loading level ${levelId}:`, error);
        });
    } catch (error) {
      console.error(`Error loading level ${levelId}:`, error);
    }
  }, [levelId]);

  // Check if the user's build matches the target
  useEffect(() => {
    if (!isLevelLoaded || userPieces.length === 0 || targetPieces.length === 0)
      return;

    // Only check if the number of pieces matches
    if (userPieces.length !== targetPieces.length) return;

    // Create maps for efficient comparison
    const userPieceMap = new Map();
    const targetPieceMap = new Map();

    // Build maps of piece types and their counts
    userPieces.forEach((piece) => {
      const key = piece.pieceId;
      const count = userPieceMap.get(key) || 0;
      userPieceMap.set(key, count + 1);
    });

    targetPieces.forEach((piece) => {
      const key = piece.pieceId;
      const count = targetPieceMap.get(key) || 0;
      targetPieceMap.set(key, count + 1);
    });

    // Check if maps have the same keys and counts
    let isMatch = true;

    if (userPieceMap.size !== targetPieceMap.size) {
      isMatch = false;
    } else {
      for (const [key, count] of userPieceMap.entries()) {
        if (targetPieceMap.get(key) !== count) {
          isMatch = false;
          break;
        }
      }
    }

    // Check if positions match (simplified)
    if (isMatch) {
      const userPositions = new Set(
        userPieces.map((p) => `${p.pieceId}_${p.pos.join(",")}`)
      );
      const targetPositions = new Set(
        targetPieces.map((p) => `${p.pieceId}_${p.position.join(",")}`)
      );

      // Check if the number of unique positions matches
      if (userPositions.size !== targetPositions.size) {
        isMatch = false;
      }
    }

    // If match is found, mark level as complete and unlock next level
    if (isMatch) {
      // Add current level to completed levels
      addCompletedLevel(levelId);

      // Calculate next level ID and unlock it
      const currentLevelNumber = parseInt(levelId.split("_")[1]);
      const nextLevelId = `level_${currentLevelNumber + 1}`;
      unlockLevel(nextLevelId);

      // Navigate to completion page
      router.push(`/puzzle/${levelId}/complete`);
    }
  }, [
    userPieces,
    targetPieces,
    isLevelLoaded,
    levelId,
    addCompletedLevel,
    unlockLevel,
    router,
  ]);

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
          <h1 className="text-2xl font-bold text-white mb-2">
            Level {levelId.split("_")[1]}
          </h1>
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
          <div className="flex space-x-2">
            <Link
              href="/puzzle/menu"
              className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg shadow hover:bg-gray-300 font-bold transition-colors"
            >
              Back to Menu
            </Link>
          </div>
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
