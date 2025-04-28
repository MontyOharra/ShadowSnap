import { create } from "zustand";
import { PieceDetail } from "@/types";
import { pieceDetails } from "@/data/pieceDetails";

interface InventoryManagerState {
  piecesDetails: PieceDetail[];
  inventory: Map<string, number | "infinity">;
  selectedPieceId: string | null;
  selectedPieceColor: string;
}

interface InventoryManagerActions {
  addPieceToInventory: (pieceId: string, count: number | "infinity") => void;
  consumePiece: () => void;
  getPieceCount: (pieceId: string) => number | "infinity";
  getAllPieceTypes: () => PieceDetail[];
  setPieceCount: (pieceId: string, count: number | "infinity") => void;
  setAllPiecesToInfinity: () => void;
  setSelectedPieceId: (pieceId: string | null) => void;
  setSelectedPieceColor: (color: string) => void;
}

export const useInventoryManager = create<
  InventoryManagerState & InventoryManagerActions
>((set, get) => ({
  piecesDetails: pieceDetails,
  inventory: new Map(pieceDetails.map((piece) => [piece.pieceId, 0])),
  selectedPieceId: null,
  selectedPieceColor: "#ffffff",

  addPieceToInventory: (pieceId: string, count: number | "infinity") => {
    set((state) => {
      const newInventory = new Map(state.inventory);
      const currentCount = newInventory.get(pieceId);

      if (currentCount === "infinity" || count === "infinity") {
        newInventory.set(pieceId, "infinity");
      } else {
        newInventory.set(pieceId, (currentCount ?? 0) + count);
      }

      return { inventory: newInventory };
    });
  },

  getPieceCount: (pieceId: string) => {
    return get().inventory.get(pieceId) ?? 0;
  },

  consumePiece: () => {
    set((state) => {
      const currentCount = state.inventory.get(state.selectedPieceId!);
      if (currentCount === "infinity") return {};

      if (currentCount !== undefined) {
        const newInventory = new Map(state.inventory);
        const newCount = Math.max(0, currentCount - 1);
        newInventory.set(state.selectedPieceId!, newCount);

        // If piece count reaches 0, find next available piece
        if (newCount === 0) {
          const nextAvailablePiece = pieceDetails.find(
            (piece) => newInventory.get(piece.pieceId) !== 0
          );
          return {
            inventory: newInventory,
            selectedPieceId: nextAvailablePiece?.pieceId ?? null,
            selectedPieceColor:
              nextAvailablePiece?.defaultColor ?? state.selectedPieceColor,
          };
        }
        return { inventory: newInventory };
      }
      return {};
    });
  },

  getAllPieceTypes: () => {
    return get().piecesDetails;
  },

  setPieceCount: (pieceId: string, count: number | "infinity") => {
    set((state) => {
      const newInventory = new Map(state.inventory);
      newInventory.set(pieceId, count);
      return { inventory: newInventory };
    });
  },

  setAllPiecesToInfinity: () => {
    set((state) => {
      const newInventory = new Map(state.inventory);
      for (const [pieceId] of newInventory) {
        newInventory.set(pieceId, "infinity");
      }
      return { inventory: newInventory };
    });
  },

  setSelectedPieceId: (pieceId: string | null) => {
    set(() => {
      const piece = pieceDetails.find((p) => p.pieceId === pieceId);
      return {
        selectedPieceId: pieceId,
        selectedPieceColor: piece?.defaultColor,
      };
    });
  },

  setSelectedPieceColor: (color: string) => {
    set(() => {
      return { selectedPieceColor: color };
    });
  },
}));
