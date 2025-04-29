"use client";

import { useBasePlateStore } from "@/stores/useBasePlateStore";

export default function BasePlateRotationScrollBar() {
  const rotateBasePlate = useBasePlateStore((s) => s.rotateBasePlate);
  const basePlateRotation = useBasePlateStore((s) => s.rotation);
  const deg = basePlateRotation ? (basePlateRotation[1] * 180) / Math.PI : 0;

  return (
    <div
      style={{
        position: "absolute",
        bottom: 20,
        left: "50%",
        transform: "translateX(-50%)", // Center horizontally
        width: "60%", // Use percentage of screen width
        maxWidth: "800px", // Maximum width
        zIndex: 100,
        pointerEvents: "auto",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "5px",
      }}
    >
      <div
        style={{
          fontSize: "14px",
          color: "white",
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          padding: "2px 8px",
          borderRadius: "10px",
        }}
      >
        Rotation: {deg.toFixed(1)}°
      </div>
      <input
        type="range"
        min={0}
        max={360}
        step={0.5} // Smaller increment for finer control
        value={deg}
        onChange={(e) => {
          const d = parseFloat(e.target.value);
          rotateBasePlate((d * Math.PI) / 180);
        }}
        style={{
          width: "100%",
          pointerEvents: "all",
          height: "20px", // Slightly taller for easier use
        }}
      />
    </div>
  );
}
