"use client";

import { Canvas } from "@react-three/fiber";
import { KeyboardControls, OrbitControls } from "@react-three/drei";
import BasePlateRotationScrollBar from "@/components/BasePlateRotationScrollBar";
import UserBuildRenderer from "@/components/UserBuildRenderer";
import TargetBuildRenderer from "@/components/TargetBuildRenderer";
import PieceInventory from "@/components/PieceInventory";
import SceneCamera from "@/components/SceneCamera";
import { useParams } from "next/navigation";
import level1 from "@/data/levels/base/level_1.json"; // Replace with dynamic import if needed
import { useEffect, useMemo, useState } from "react";
import SceneBuilder from "@/components/SceneRenderer";
import { useInventoryManager } from "@/stores/useInventoryManager";
import BasePlateRenderer from "@/components/BasePlateRenderer";
import { transformLevelData } from "@/utils/dataUtils";

export default function PuzzleLevel() {
  const params = useParams<{ levelId: string }>();
  const levelId = params.levelId;
  const [mode, setMode] = useState<"user" | "target">("user");

  useMemo(() => {
    // TODO: Replace with dynamic import based on levelId
    const data = transformLevelData(level1);

    useInventoryManager.getState().setAllPiecesToZero();

    // get number of each piece in the level
    const pieceCounts = data.pieces.reduce((acc: Record<string, number>, p) => {
      acc[p.pieceId] = (acc[p.pieceId] || 0) + 1;
      return acc;
    }, {});

    console.log(pieceCounts);

    // Set inventory to the number of each piece in the level
    const inventory = useInventoryManager.getState().inventory;

    Object.keys(pieceCounts).forEach((pieceId) => {
      inventory.set(pieceId, pieceCounts[pieceId]);
    });
  }, []);

  return (
    <div
      style={{
        position: "relative",
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
      }}
    >
      {" "}
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
