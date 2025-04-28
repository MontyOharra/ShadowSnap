import { getBasePlateFromId } from "@/utils/legoUtils";
import { create } from "zustand";
import { BasePlate, Position3 } from "@/types";

interface BasePlateState {
  pieceId: string;
  color: string;
  rotation: [number, number, number];
  setBasePlate: (pieceId: string, color: string) => void;
  getBasePlateDetails: () => { basePlate: BasePlate };
  rotateBasePlate: (angle: number) => void;
}

export const useBasePlateStore = create<BasePlateState>((set, get) => ({
  pieceId: "base-plate-16x16",
  color: "#00a651",
  rotation: [0, 0, 0],
  setBasePlate: (pieceId, color) => set({ pieceId, color }),
  getBasePlateDetails: () => {
    const state = get();
    const basePlateDetail = getBasePlateFromId(state.pieceId);
    return {
      basePlate: {
        key: "base",
        pieceId: state.pieceId,
        pos: [0, 0, 0] as Position3,
        rot: [0, 0, 0] as Position3,
        color: state.color,
        sizeX: basePlateDetail.sizeX,
        sizeZ: basePlateDetail.sizeZ,
      },
    };
  },
  rotateBasePlate: (angle) =>
    set((state) => ({
      rotation: [state.rotation[0], angle, state.rotation[2]],
    })),
}));
