"use client";

import { useState, useEffect } from "react";

interface ColorPickerProps {
  selectedColor: string;
  onColorChange: (color: string) => void;
}

const DEFAULT_COLORS = [
  "#FF0000", // Red
  "#00FF00", // Green
  "#0000FF", // Blue
  "#FFFF00", // Yellow
  "#FF00FF", // Magenta
  "#00FFFF", // Cyan
  "#FFFFFF", // White
  "#000000", // Black
  "#FFA500", // Orange
  "#800080", // Purple
  "#008000", // Dark Green
  "#808080", // Gray
];

export default function ColorPicker({
  selectedColor,
  onColorChange,
}: ColorPickerProps) {
  const [currentColor, setCurrentColor] = useState(selectedColor);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setCurrentColor(selectedColor);
  }, [selectedColor]);

  const handleColorClick = (color: string) => {
    onColorChange(color);
    setIsOpen(false);
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "8px",
        padding: "16px",
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        borderRadius: "8px",
        borderTop: "1px solid #eee",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span
          style={{
            fontSize: "14px",
            fontWeight: "500",
            color: "#333",
          }}
        >
          Color
        </span>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <div
            style={{
              width: "24px",
              height: "24px",
              borderRadius: "4px",
              backgroundColor: currentColor,
              border: "1px solid #ddd",
              cursor: "pointer",
            }}
            onClick={() => setIsOpen(!isOpen)}
          />
          <input
            type="color"
            value={currentColor}
            onChange={(e) => handleColorClick(e.target.value)}
            style={{
              width: "24px",
              height: "24px",
              padding: 0,
              border: "none",
              cursor: "pointer",
            }}
          />
        </div>
      </div>

      {isOpen && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(6, 1fr)",
            gap: "8px",
            padding: "8px",
            backgroundColor: "white",
            borderRadius: "8px",
            border: "1px solid #eee",
          }}
        >
          {DEFAULT_COLORS.map((color) => (
            <div
              key={color}
              style={{
                width: "24px",
                height: "24px",
                borderRadius: "4px",
                backgroundColor: color,
                border: "1px solid #ddd",
                cursor: "pointer",
              }}
              onClick={() => handleColorClick(color)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
