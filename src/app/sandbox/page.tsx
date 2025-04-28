"use client";

import { Canvas } from "@react-three/fiber";
import {
  KeyboardControls,
  OrbitControls,
  PerspectiveCamera,
} from "@react-three/drei";
import SandboxModeInventory from "./components/SandboxModeInventory";
import BasePlateRotationScrollBar from "@/app/sandbox/components/BasePlateRotationScrollBar";
import UserBuildBuilder from "./components/UserBuildBuilder";
import SceneBuilder from "./components/SceneBuilder";
import { useThree } from "@react-three/fiber";

function Camera() {
  const { set } = useThree();
  return (
    <PerspectiveCamera
      makeDefault
      position={[15, 13, 20]}
      fov={50}
      near={0.1}
      far={1000}
      onUpdate={(self) => set({ camera: self })}
    />
  );
}
export default function SandboxPage() {
  return (
    <div
      style={{
        position: "relative",
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
      }}
    >
      <KeyboardControls
        map={[
          { name: "left", keys: ["ArrowLeft", "a"] },
          { name: "right", keys: ["ArrowRight", "d"] },
          { name: "up", keys: ["ArrowUp", "w"] },
          { name: "down", keys: ["ArrowDown", "s"] },
          { name: "add", keys: ["p"] },
          { name: "place", keys: ["Enter"] },
          { name: "esc", keys: ["Escape"] },
          { name: "q", keys: ["q"] },
          { name: "e", keys: ["e"] },
        ]}
      >
        <Canvas shadows>
          {/* darker background color */}
          <color attach="background" args={["#303030"]} />
          <Camera />
          <UserBuildBuilder />
          <SceneBuilder />
          <OrbitControls target={[3, 1, -5]} />
        </Canvas>
      </KeyboardControls>

      <BasePlateRotationScrollBar />
      <SandboxModeInventory />
    </div>
  );
}
