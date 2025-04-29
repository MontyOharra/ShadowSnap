"use client";

import { useState, useEffect } from "react";
import { pieceDetails } from "@/data/pieceDetails";
import PieceSnapshot from "@/components/inventory/PieceSnapshot";
import { DefinedPieceType, DefinedPieceId } from "@/types";
import { useInventoryManager } from "@/stores/useInventoryManager";

export default function PieceInventory() {
  const [filter, setFilter] = useState<DefinedPieceType | "">("");

  // Get state from stores
  const selectedPieceId = useInventoryManager((s) => s.selectedPieceId);
  const setNewPieceId = useInventoryManager((s) => s.setSelectedPieceId);
  const setPieceColor = useInventoryManager((s) => s.setSelectedPieceColor);
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
        setPieceColor(firstAvailablePiece.defaultColor);
      }
    }
  }, [selectedPieceId, setNewPieceId, setPieceColor, getPieceCount]);

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
          setPieceColor(nextAvailablePiece.defaultColor);
        } else {
          // No pieces available, clear selection
          setNewPieceId(null);
        }
      }
    }
  }, [selectedPieceId, getPieceCount, setNewPieceId, setPieceColor]);

  const filteredPieces = pieceDetails.filter(
    (piece) => (!filter || piece.type === filter) && pieces.has(piece.pieceId)
  );

  const handlePieceSelect = (pieceId: DefinedPieceId) => {
    const piece = pieceDetails.find((p) => p.pieceId === pieceId);
    const count = getPieceCount(pieceId);
    if (piece && count !== 0) {
      setNewPieceId(pieceId);
      setPieceColor(piece.defaultColor);
    }
  };

  return (
    <div
      style={{
        position: "absolute",
        top: "20px",
        right: "20px",
        width: "300px",
        maxHeight: "calc(100vh - 100px)",
        zIndex: 100,
        pointerEvents: "auto",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        padding: "16px",
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        borderRadius: "20px",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        fontFamily: "var(--font-geist-sans)",
        overflowY: "auto",
      }}
    >
      {/* Title - Fixed at the top */}
      <h2
        style={{
          margin: 0,
          fontSize: "22px",
          fontWeight: "600",
          position: "sticky",
          top: 0,
          backgroundColor: "rgba(255, 255, 255, 0.95)",
          paddingTop: "6px",
          paddingBottom: "6px",
          zIndex: 1,
        }}
      >
        Inventory
      </h2>

      {/* Filter Dropdown - Fixed below the title */}
      <select
        value={filter}
        onChange={(e) => setFilter(e.target.value as DefinedPieceType | "")}
        style={{
          width: "100%",
          padding: "6px 10px",
          borderRadius: "8px",
          border: "1px solid #ddd",
          backgroundColor: "white",
          cursor: "pointer",
          fontFamily: "inherit",
          fontSize: "14px",
          position: "sticky",
          top: "40px",
          zIndex: 1,
        }}
      >
        <option value="">All Types</option>
        <option value="short-brick">Short Bricks</option>
        <option value="medium-brick">Medium Bricks</option>
        <option value="tall-brick">Tall Bricks</option>
      </select>

      {/* Pieces Grid with Scroll */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: "10px",
          padding: "2px",
          flex: 1,
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
                borderRadius: "6px",
                overflow: "hidden",
                border:
                  selectedPieceId === piece.pieceId
                    ? "2px solid #007AFF"
                    : "1px solid #DDDDDD",
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
                  padding: "2px 6px",
                  borderBottomLeftRadius: "6px",
                  fontSize: "14px",
                  fontWeight: "bold",
                  minWidth: "24px",
                  textAlign: "center",
                }}
              >
                {count === "infinity" ? "∞" : count}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
