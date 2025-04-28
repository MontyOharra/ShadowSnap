"use client";

import { useSandboxMode } from "@/stores/useSandboxMode";
import PieceInventory from "@/components/PieceInventory";
import { getPieceFromId, pieceDetails } from "@/utils/pieceDetails";
import { DefinedPieceId } from "@/types";

export default function SandboxModeInventory() {
  const selectedPieceId = useSandboxMode((s) => s.newStagedPieceId);
  const setNewPieceId = useSandboxMode((s) => s.setNewPieceId);
  const setStagedPieceColor = useSandboxMode((s)   => s.setStagedPieceColor);
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
    setNewPieceId(pieceId);
    setStagedPieceColor(piece.defaultColor);
  };

  function handleColorChange(color: string) {
    if (selectedPieceId) {
      setStagedPieceColor(color);
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
