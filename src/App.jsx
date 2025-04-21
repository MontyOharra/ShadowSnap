// App.jsx
import React from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import BuildMode from "./components/game/BuildMode";
import BuildModeInventory from "./components/game/buildMode/BuildModeInventory";
import { KeyboardControls } from "@react-three/drei";
import { useGame } from "./stores/useGame";

export default function App() {
  // pull setter & current rotation from the store
  const setGroupRotation = useGame((s) => s.setGroupRotation);
  const deg = useGame((s) => Math.round((s.groupRotation[1] * 180) / Math.PI));

  return (
    <div style={{ position: "relative", width: "100vw", height: "100vh" }}>
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
        ]}
      >
        <Canvas shadows camera={{ position: [8, 8, 8], fov: 50 }}>
          {/* darker background color */}
          <color attach="background" args={["#303030"]} />

          {/* your build mode pieces + walls */}
          <BuildMode />

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

      {/* Slider for baseplate rotation */}
      <div
        style={{
          position: "absolute",
          bottom: 10,
          left: 200, // leave room for inventory
          right: 20,
          zIndex: 100,
          pointerEvents: "auto",
        }}
      >
        <input
          type="range"
          min={0}
          max={360}
          value={deg}
          onChange={(e) => {
            const d = parseFloat(e.target.value);
            setGroupRotation((d * Math.PI) / 180);
          }}
          style={{
            width: "100%",
            pointerEvents: "all",
          }}
        />
      </div>
    </div>
  );
}
