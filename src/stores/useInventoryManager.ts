import { create } from "zustand";
import { DefinedPieceId } from "@/types";
import { pieceDetails } from "@/data/pieceDetails";

type InventoryState = {
  inventory: Map<DefinedPieceId, number | "infinity">;
  selectedPieceId: DefinedPieceId | null;
  selectedPieceColor: string | null;

  // Actions
  getPieceCount: (pieceId: DefinedPieceId) => number | "infinity";
  setPieceCount: (pieceId: DefinedPieceId, count: number | "infinity") => void;
  decrementPieceCount: (pieceId: DefinedPieceId) => void;
  incrementPieceCount: (pieceId: DefinedPieceId) => void;
  setSelectedPieceId: (pieceId: DefinedPieceId | null) => void;
  setSelectedPieceColor: (color: string | null) => void;
  setAllPiecesToZero: () => void;
  setAllPiecesToInfinity: () => void;
  consumePiece: () => void;
};

export const useInventoryManager = create<InventoryState>((set, get) => {
  // Initialize inventory with infinite quantity for all piece types
  const initialInventory = new Map<DefinedPieceId, number | "infinity">();
  pieceDetails.forEach((piece) => {
    initialInventory.set(piece.pieceId, "infinity");
  });

  return {
    inventory: initialInventory,
    selectedPieceId: null,
    selectedPieceColor: null,

    getPieceCount: (pieceId) => {
      return get().inventory.get(pieceId) || 0;
    },

    setPieceCount: (pieceId, count) => {
      set((state) => {
        const newInventory = new Map(state.inventory);
        newInventory.set(pieceId, count);
        return { inventory: newInventory };
      });
    },

    decrementPieceCount: (pieceId) => {
      set((state) => {
        const newInventory = new Map(state.inventory);
        const currentCount = newInventory.get(pieceId);

        if (currentCount === "infinity") {
          // Don't decrement infinity
          return { inventory: newInventory };
        } else if (currentCount && currentCount > 0) {
          newInventory.set(pieceId, currentCount - 1);
        }

        return { inventory: newInventory };
      });
    },

    incrementPieceCount: (pieceId) => {
      set((state) => {
        const newInventory = new Map(state.inventory);
        const currentCount = newInventory.get(pieceId);

        if (currentCount === "infinity") {
          // Don't increment infinity
          return { inventory: newInventory };
        } else if (currentCount !== undefined) {
          newInventory.set(pieceId, currentCount + 1);
        } else {
          newInventory.set(pieceId, 1);
        }

        return { inventory: newInventory };
      });
    },

    setSelectedPieceId: (pieceId) => {
      set({ selectedPieceId: pieceId });
    },

    setSelectedPieceColor: (color) => {
      set({ selectedPieceColor: color });
    },

    // Consume the currently selected piece
    consumePiece: () => {
      set((state) => {
        if (!state.selectedPieceId) return {};

        const pieceId = state.selectedPieceId;
        const newInventory = new Map(state.inventory);
        const currentCount = newInventory.get(pieceId);

        if (currentCount === "infinity") {
          // Don't decrement infinity
          return {};
        } else if (currentCount && currentCount > 0) {
          newInventory.set(pieceId, currentCount - 1);
          return { inventory: newInventory };
        }

        return {};
      });
    },

    setAllPiecesToZero: () => {
      set(() => {
        const newInventory = new Map<DefinedPieceId, number | "infinity">();
        pieceDetails.forEach((piece) => {
          newInventory.set(piece.pieceId, 0);
        });
        return { inventory: newInventory };
      });
    },

    setAllPiecesToInfinity: () => {
      set(() => {
        const newInventory = new Map<DefinedPieceId, number | "infinity">();
        pieceDetails.forEach((piece) => {
          newInventory.set(piece.pieceId, "infinity");
        });
        return { inventory: newInventory };
      });
    },
  };
});
