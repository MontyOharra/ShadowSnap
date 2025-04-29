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
  addPieceToInventory: (pieceId: DefinedPieceId, count: number) => void;
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
          const newCount = currentCount - 1;
          newInventory.set(pieceId, newCount);

          // If the count reaches zero and this is the currently selected piece, reset selection
          if (newCount === 0 && state.selectedPieceId === pieceId) {
            return {
              inventory: newInventory,
              selectedPieceId: null,
            };
          }

          return { inventory: newInventory };
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
          const newCount = currentCount - 1;
          newInventory.set(pieceId, newCount);

          // If count reaches zero, reset the selected piece ID
          if (newCount === 0) {
            return {
              inventory: newInventory,
              selectedPieceId: null,
            };
          }

          return { inventory: newInventory };
        }

        return {};
      });
    },

    // Add pieces back to inventory when they're removed
    addPieceToInventory: (pieceId, count) => {
      set((state) => {
        const newInventory = new Map(state.inventory);
        const currentCount = newInventory.get(pieceId);

        // Don't add to infinity
        if (currentCount === "infinity") {
          return {};
        }

        // Calculate new count
        const newCount =
          typeof currentCount === "number" ? currentCount + count : count;

        newInventory.set(pieceId, newCount);
        return { inventory: newInventory };
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
