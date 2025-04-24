"use client";

import { useSandboxMode } from "@/stores/useSandboxMode";

export default function BasePlateRotationScrollBar() {
  const rotateBasePlate = useSandboxMode((s) => s.rotateBasePlate);
  const deg = useSandboxMode((s) => (s.basePlateRotation[1] * 180) / Math.PI);

  return (
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
        step={0.1}
        value={deg}
        onChange={(e) => {
          const d = parseFloat(e.target.value);
          rotateBasePlate((d * Math.PI) / 180);
        }}
        style={{
          width: "100%",
          pointerEvents: "all",
        }}
      />
    </div>
  );
}
