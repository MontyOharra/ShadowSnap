"use client";

import { Canvas } from "@react-three/fiber";
import { KeyboardControls, OrbitControls } from "@react-three/drei";
import BasePlateRotationScrollBar from "@/components/BasePlateRotationScrollBar";
import UserBuildBuilder from "../../components/UserBuildRenderer";
import SceneBuilder from "../../components/SceneRenderer";
import PieceInventory from "@/components/PieceInventory";
import { useInventoryManager } from "@/stores/useInventoryManager";
import { useEffect } from "react";
import SceneCamera from "@/components/SceneCamera";
import SettingsButton from "@/components/SettingsButton";

export default function SandboxPage() {
  const setAllPiecesToInfinity = useInventoryManager(
    (s) => s.setAllPiecesToInfinity
  );

  // Set all pieces to infinity when entering sandbox mode
  useEffect(() => {
    setAllPiecesToInfinity();
  }, [setAllPiecesToInfinity]);

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
          { name: "add", keys: ["p"] },
          { name: "place", keys: ["Enter"] },
          { name: "esc", keys: ["Escape"] },
          { name: "q", keys: ["r"] },
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
          <OrbitControls target={[3, 1, -5]} />
        </Canvas>
      </KeyboardControls>

      <BasePlateRotationScrollBar />
      <PieceInventory />
    </div>
  );
}
