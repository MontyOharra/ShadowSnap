"use client";

import { useState, useEffect } from "react";
import { pieceDetails } from "@/utils/pieceDetails";
import PieceSnapshot from "@/components/inventory/PieceSnapshot";
import ColorPicker from "@/components/inventory/ColorPicker";
import { DefinedPieceType, DefinedPieceId } from "@/types";
import { getPieceFromId } from "@/utils/pieceDetails";

interface PieceInventoryProps {
  selectedPieceType: string | null;
  onPieceSelect: (pieceId: string) => void;
  getPieceCount: (pieceId: string) => number | "∞";
  title?: string;
  selectedColor: string;
  onColorChange: (color: string) => void;
  pieces: Record<DefinedPieceId, number>;
}

export default function PieceInventory({
  selectedPieceType,
  onPieceSelect,
  getPieceCount,
  selectedColor,
  onColorChange,
  pieces,
}: PieceInventoryProps) {
  const [filter, setFilter] = useState<DefinedPieceType | "">("");

  const filteredPieces = pieceDetails.filter(
    (piece) =>
      (!filter || piece.type === filter) && pieces[piece.pieceId] !== undefined
  );

  useEffect(() => {
    getPieceFromId(Object.keys(pieces)[0]);
  }, [pieces]);


  return (
    <div
      style={{
        position: "absolute",
        top: "20px",
        right: "20px",
        width: "300px",
        maxHeight: "calc(100vh - 40px)",
        zIndex: 100,
        pointerEvents: "auto",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        padding: "20px",
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        borderRadius: "20px",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        fontFamily: "var(--font-geist-sans)",
      }}
    >
      {/* Title */}
      <h2
        style={{
          margin: 0,
          fontSize: "24px",
          fontWeight: "600",
        }}
      >
        Inventory
      </h2>

      {/* Filter Dropdown */}
      <select
        value={filter}
        onChange={(e) => setFilter(e.target.value as DefinedPieceType | "")}
        style={{
          width: "100%",
          padding: "8px 12px",
          borderRadius: "8px",
          border: "1px solid #ddd",
          backgroundColor: "white",
          cursor: "pointer",
          fontFamily: "inherit",
          fontSize: "14px",
        }}
      >
        <option value="">All Types</option>
        <option value="brick">Bricks</option>
        <option value="plate">Plates</option>
        <option value="slant">Slants</option>
      </select>

      {/* Pieces Grid with Scroll */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: "16px",
          overflowY: "auto",
          maxHeight: "calc(100vh - 300px)", // Adjusted to account for color picker
          padding: "4px", // Space for scrollbar
        }}
      >
        {filteredPieces.map((piece) => (
          <div
            key={piece.pieceId}
            onClick={() => onPieceSelect(piece.pieceId)}
            style={{
              cursor: "pointer",
              transition: "transform 0.2s ease",
              position: "relative",
              borderRadius: "8px",
              overflow: "hidden",
              border:
                selectedPieceType === piece.pieceId
                  ? "2px solid #007AFF"
                  : "2px solid #FFFFFF",
            }}
          >
            <PieceSnapshot
              piece={piece}
              isSelected={selectedPieceType === piece.pieceId}
            />
            {/* Piece Count Indicator */}
            <div
              style={{
                position: "absolute",
                top: 0,
                right: 0,
                backgroundColor: "rgb(0, 0, 0)",
                color: "white",
                padding: "4px 8px",
                borderBottomLeftRadius: "8px",
                fontSize: "16px",
                fontWeight: "bold",
                minWidth: "32px",
                textAlign: "center",
              }}
            >
              {getPieceCount(piece.pieceId)}
            </div>
          </div>
        ))}
      </div>

      {/* Color Picker */}
      <ColorPicker
        selectedColor={selectedColor}
        onColorChange={onColorChange}
      />
    </div>
  );
}
