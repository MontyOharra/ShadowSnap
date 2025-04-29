import { getBasePlateFromId } from "@/utils/legoUtils";
import { create } from "zustand";
import { BasePlate, Position3 } from "@/types";

// Define the state interface for the base plate store
interface BasePlateState {
  pieceId: string; // The ID of the base plate piece
  color: string; // The color of the base plate
  rotation: [number, number, number]; // The rotation of the base plate in 3D space
  setBasePlate: (pieceId: string, color: string) => void; // Set the base plate's ID and color
  getBasePlateDetails: () => { basePlate: BasePlate }; // Get the complete base plate details
  rotateBasePlate: (angle: number) => void; // Rotate the base plate by a given angle
}

export const useBasePlateStore = create<BasePlateState>((set, get) => ({
  // Initial state
  pieceId: "base-plate-16x16", // Default base plate size
  color: "#00a651", // Default green color
  rotation: [0, 0, 0], // Initial rotation (no rotation)

  // Set the base plate's ID and color
  setBasePlate: (pieceId, color) => set({ pieceId, color }),

  // Get the complete base plate details including size information
  getBasePlateDetails: () => {
    const state = get();
    // Get the base plate details from the lego utils
    const basePlateDetail = getBasePlateFromId(state.pieceId);
    return {
      basePlate: {
        key: "base", // Unique identifier for the base plate
        pieceId: state.pieceId, // The ID of the base plate piece
        pos: [0, 0, 0] as Position3, // Position is always at origin
        rot: [0, 0, 0] as Position3, // Rotation in 3D space
        color: state.color, // The color of the base plate
        sizeX: basePlateDetail.sizeX, // Width of the base plate
        sizeZ: basePlateDetail.sizeZ, // Depth of the base plate
      },
    };
  },

  // Rotate the base plate around the Y axis
  rotateBasePlate: (angle) =>
    set((state) => ({
      rotation: [state.rotation[0], angle, state.rotation[2]], // Only update Y rotation
    })),
}));
