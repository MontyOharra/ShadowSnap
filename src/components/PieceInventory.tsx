"use client";

import { useState, useEffect } from "react";
import { pieceDetails } from "@/data/pieceDetails";
import PieceSnapshot from "@/components/inventory/PieceSnapshot";
import ColorPicker from "@/components/inventory/ColorPicker";
import { DefinedPieceType } from "@/types";
import { useInventoryManager } from "@/stores/useInventoryManager";

export default function PieceInventory() {
  const [filter, setFilter] = useState<DefinedPieceType | "">("");

  // Get state from stores
  const selectedPieceId = useInventoryManager((s) => s.selectedPieceId);
  const setNewPieceId = useInventoryManager((s) => s.setSelectedPieceId);
  const setStagedPieceColor = useInventoryManager(
    (s) => s.setSelectedPieceColor
  );
  const selectedColor = useInventoryManager((s) => s.selectedPieceColor);
  const getPieceCount = useInventoryManager((s) => s.getPieceCount);
  const pieces = useInventoryManager((s) => s.inventory);

  // Initialize with first available piece
  useEffect(() => {
    if (!selectedPieceId && pieceDetails.length > 0) {
      const firstAvailablePiece = pieceDetails.find(
        (piece) => getPieceCount(piece.pieceId) !== 0
      );
      if (firstAvailablePiece) {
        setNewPieceId(firstAvailablePiece.pieceId);
        setStagedPieceColor(firstAvailablePiece.defaultColor);
      }
    }
  }, [selectedPieceId, setNewPieceId, setStagedPieceColor, getPieceCount]);

  // Watch for piece count changes and update selected piece if needed
  useEffect(() => {
    if (selectedPieceId) {
      const count = getPieceCount(selectedPieceId);
      if (count === 0) {
        // Find the next available piece
        const nextAvailablePiece = pieceDetails.find(
          (piece) => getPieceCount(piece.pieceId) !== 0
        );

        if (nextAvailablePiece) {
          setNewPieceId(nextAvailablePiece.pieceId);
          setStagedPieceColor(nextAvailablePiece.defaultColor);
        } else {
          // No pieces available, clear selection
          setNewPieceId(null);
        }
      }
    }
  }, [selectedPieceId, getPieceCount, setNewPieceId, setStagedPieceColor]);

  const filteredPieces = pieceDetails.filter(
    (piece) => (!filter || piece.type === filter) && pieces.has(piece.pieceId)
  );

  const handlePieceSelect = (pieceId: string) => {
    const piece = pieceDetails.find((p) => p.pieceId === pieceId);
    const count = getPieceCount(pieceId);
    if (piece && count !== 0) {
      setNewPieceId(pieceId);
      setStagedPieceColor(piece.defaultColor);
    }
  };

  function handleColorChange(color: string) {
      setStagedPieceColor(color);
  }

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
          maxHeight: "calc(100vh - 300px)",
          padding: "4px",
        }}
      >
        {filteredPieces.map((piece) => {
          const count = getPieceCount(piece.pieceId);
          const isDisabled = count === 0;
          return (
            <div
              key={piece.pieceId}
              onClick={() => !isDisabled && handlePieceSelect(piece.pieceId)}
              style={{
                cursor: isDisabled ? "not-allowed" : "pointer",
                transition: "transform 0.2s ease",
                position: "relative",
                borderRadius: "8px",
                overflow: "hidden",
                border:
                  selectedPieceId === piece.pieceId
                    ? "2px solid #007AFF"
                    : "2px solid #FFFFFF",
                opacity: isDisabled ? 0.5 : 1,
                filter: isDisabled ? "grayscale(100%)" : "none",
              }}
            >
              <PieceSnapshot
                piece={piece}
                isSelected={selectedPieceId === piece.pieceId}
                isDisabled={isDisabled}
              />
              {/* Piece Count Indicator */}
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  right: 0,
                  backgroundColor: isDisabled
                    ? "rgb(100, 100, 100)"
                    : "rgb(0, 0, 0)",
                  color: "white",
                  padding: "4px 8px",
                  borderBottomLeftRadius: "8px",
                  fontSize: "16px",
                  fontWeight: "bold",
                  minWidth: "32px",
                  textAlign: "center",
                }}
              >
                {count === "infinity" ? "∞" : count}
              </div>
            </div>
          );
        })}
      </div>

      {/* Color Picker */}
      <ColorPicker
        selectedColor={selectedColor ?? "#ffffff"}
        onColorChange={handleColorChange}
      />
    </div>
  );
}
