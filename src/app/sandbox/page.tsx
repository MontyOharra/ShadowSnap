"use client";

import { useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { KeyboardControls, OrbitControls } from "@react-three/drei";
import SandboxManager from "./components/SandboxManager";
import SandboxModeInventory from "./components/SandboxModeInventory";
import BasePlateRotationScrollBar from "@/app/sandbox/components/BasePlateRotationScrollBar";

export default function SandboxPage() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      setMousePosition({
        x: event.clientX,
        y: event.clientY,
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
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
      <KeyboardControls
        map={[
          { name: "left", keys: ["ArrowLeft", "a"] },
          { name: "right", keys: ["ArrowRight", "d"] },
          { name: "up", keys: ["ArrowUp", "w"] },
          { name: "down", keys: ["ArrowDown", "s"] },
          { name: "rotatePiece", keys: ["q", "Q"] },
          { name: "toggle1", keys: ["1"] },
          { name: "toggle2", keys: ["2"] },
          { name: "toggle3", keys: ["3"] },
          { name: "toggle4", keys: ["4"] },
          { name: "add", keys: ["p"] },
          { name: "place", keys: ["Enter"] },
          { name: "esc", keys: ["Escape"] },
          { name: "q", keys: ["q"] },
          { name: "e", keys: ["e"] },
        ]}
      >
        <Canvas shadows camera={{ position: [8, 8, 8], fov: 50 }}>
          {/* darker background color */}
          <color attach="background" args={["#303030"]} />

          {/* your build mode pieces + walls */}
          <SandboxManager mousePosition={mousePosition} />

          {/* fixed lighting, no longer rotates */}
          <ambientLight intensity={0.6} />
          <directionalLight
            position={[10, 15, 10]}
            intensity={0.8}
            castShadow
            shadow-mapSize-width={1024}
            shadow-mapSize-height={1024}
          />
          <directionalLight position={[-10, 15, -10]} intensity={0.6} />

          <OrbitControls enablePan enableRotate enableZoom />
        </Canvas>
      </KeyboardControls>

      <BasePlateRotationScrollBar />
      <SandboxModeInventory />
    </div>
  );
}
