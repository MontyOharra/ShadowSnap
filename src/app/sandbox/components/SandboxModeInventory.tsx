"use client";

import { useSandboxMode } from "@/stores/useSandboxMode";
import PieceInventory from "@/components/inventory/PieceInventory";
import { getPieceFromId, pieceDetails } from "@/utils/pieceDetails";
import { DefinedPieceId } from "@/types";

export default function SandboxModeInventory() {
  const selectedPieceId = useSandboxMode((s) => s.newStagedPieceId);
  const changeNewPiece = useSandboxMode((s) => s.changeNewPiece);
  const selectedColor = useSandboxMode((s) => s.stagedPieceColor);

  // Create a record with all pieces mapped to Infinity
  const pieces: Record<DefinedPieceId, number> = pieceDetails.reduce(
    (acc, piece) => {
      acc[piece.pieceId] = Infinity;
      return acc;
    },
    {} as Record<DefinedPieceId, number>
  );

  const handlePieceSelect = (pieceId: string) => {
    const piece = getPieceFromId(pieceId);
    changeNewPiece(pieceId, piece.defaultColor);
  };

  function handleColorChange(color: string) {
    if (selectedPieceId) {
      changeNewPiece(selectedPieceId, color);
    }
  }

  return (
    <PieceInventory
      selectedPieceType={selectedPieceId}
      onPieceSelect={handlePieceSelect}
      getPieceCount={() => "∞"}
      title="Sandbox Inventory"
      selectedColor={selectedColor}
      onColorChange={handleColorChange}
      pieces={pieces}
    />
  );
}
