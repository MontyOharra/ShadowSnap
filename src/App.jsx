import React from "react";
import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";

import BuildMode from "./components/game/BuildMode";
import { KeyboardControls } from "@react-three/drei";

export default function App() {
  return (
    <KeyboardControls
      map={[
        { name: "left", keys: ["ArrowLeft", "a"] },
        { name: "right", keys: ["ArrowRight", "d"] },
        { name: "up", keys: ["ArrowUp", "w"] },
        { name: "down", keys: ["ArrowDown", "s"] },
        { name: "rotate", keys: ["r"] },
        { name: "toggle1", keys: ["1"] },
        { name: "toggle2", keys: ["2"] },
        { name: "toggle3", keys: ["3"] },
        { name: "toggle4", keys: ["4"] },
        { name: "add", keys: ["p"] },
        { name: "place", keys: ["Enter"] },
        { name: "esc", keys: ["Escape"] },
      ]}
    >
      <Canvas shadows camera={{ position: [8, 8, 8], fov: 50 }}>
        <BuildMode />
        <ambientLight intensity={0.3} />
        <directionalLight position={[5, 10, 5]} intensity={1} />
        <OrbitControls />
      </Canvas>
    </KeyboardControls>
  );
}
