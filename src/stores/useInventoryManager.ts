import { create } from "zustand";
import { PieceDetail } from "@/types";
import { pieceDetails } from "@/data/pieceDetails";

interface InventoryManagerState {
  piecesDetails: PieceDetail[]; // An array of all the piece details
  inventory: Map<string, number | "infinity">; // A map of all the pieces in the inventory and their counts
  selectedPieceId: string | null; // The ID of the piece that is currently selected
  selectedPieceColor: string; // The color of the piece that is currently selected
}

interface InventoryManagerActions {
  addPieceToInventory: (pieceId: string, count: number | "infinity") => void;
  consumePiece: () => void;
  getPieceCount: (pieceId: string) => number | "infinity";
  getAllPieceTypes: () => PieceDetail[];
  setPieceCount: (pieceId: string, count: number | "infinity") => void;
  setAllPiecesToZero: () => void;
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
    /* 
      Decrement the count of the selected piece
      If the count reaches 0, find the next available piece and set it as the selected piece
    */

    set((state) => {
      const currentCount = state.inventory.get(state.selectedPieceId!);
      // Do not consume a piece if its count is infinity
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
            selectedPieceColor: nextAvailablePiece?.defaultColor ?? "#ffffff",
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
    /* 
      Set the count of a piece
      If the count is infinity, set the count to infinity
      If the count is a number, set the count to the number
    */
    set((state) => {
      const newInventory = new Map(state.inventory);
      newInventory.set(pieceId, count);
      return { inventory: newInventory };
    });
  },

  setAllPiecesToZero: () => {
    /* 
      Set the count of all pieces to 0
    */
    set((state) => {
      const newInventory = new Map(state.inventory);
      for (const [pieceId] of newInventory) {
        newInventory.set(pieceId, 0);
      }
      return { inventory: newInventory };
    });
  },

  setAllPiecesToInfinity: () => {
    /* 
      Set the count of all pieces to infinity
    */
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
        selectedPieceColor: piece?.defaultColor ?? "#ffffff",
      };
    });
  },

  setSelectedPieceColor: (color: string) => {
    set(() => {
      return { selectedPieceColor: color };
    });
  },
}));
