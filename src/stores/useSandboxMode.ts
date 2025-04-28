import { create } from "zustand";
import { snapAndValidate } from "../utils/studUtils";
import { Piece, StagedPiece, Position3, Direction, BasePlate } from "@/types";
import { getBasePlateFromId } from "@/utils/legoUtils";

interface SandboxModeState {
  pieces: Piece[];
  basePlate: BasePlate | null;
  basePlateRotation: Position3;
  stagedPiece: StagedPiece | null;
  newStagedPieceId: string;
  stagedPieceColor: string;
  nextKey: number;
}

interface SandboxModeActions {
  setBasePlate: (pieceId: string, color: string) => void;
  rotateBasePlate: (angleRad: number) => void;
  setNewPieceId: (newPieceId: string) => void;
  setStagedPieceColor: (color: string) => void;
  stageNewPiece: (pos?: [number, number]) => void;
  stageExistingPiece: (key: number) => void;
  unstagePiece: () => void;
  moveStagedPiece: (dir: Direction) => void;
  rotateStagedPiece: (direction: "left" | "right") => void;
  confirmPlace: (color?: string) => void;
}

export const useSandboxMode = create<SandboxModeState & SandboxModeActions>(
  (set) => ({
    pieces: [],
    basePlate: null,
    basePlateRotation: [0, 0, 0],
    stagedPiece: null,
    newStagedPieceId: "",
    stagedPieceColor: "#FF0000", // Default to red
    nextKey: 1,

    setBasePlate: (pieceId: string, color: string) =>
      set((state) => {
        const key = state.nextKey;
        const basePlateDetail = getBasePlateFromId(pieceId);
        return {
          basePlate: {
            key: "base",
            pieceId: pieceId,
            pos: [0, 0, 0] as Position3,
            rot: [0, 0, 0] as Position3,
            color: color,
            sizeX: basePlateDetail.sizeX,
            sizeZ: basePlateDetail.sizeZ,
          },
          nextKey: key + 1,
          pieces: [],
        };
      }),

    rotateBasePlate: (angleRad: number) =>
      set(() => ({
        basePlateRotation: [0, angleRad, 0] as Position3,
      })),

    setNewPieceId: (newPieceId: string) =>
      set((state) => {
        // If no staged piece, set the new piece id
        if (!state.stagedPiece) return { newStagedPieceId: newPieceId };
        // If the new piece id is the same as the staged piece id, do nothing
        if (state.newStagedPieceId === newPieceId) return {};

        // Update the staged piece id
        const updatedStagedPiece: StagedPiece = {
          ...state.stagedPiece,
          pieceId: newPieceId,
        };

        // Validate the new position
        const { position, valid } = snapAndValidate(
          state.pieces,
          updatedStagedPiece,
          state.basePlate!
        );
        updatedStagedPiece.pos = position;
        updatedStagedPiece.isValidPosition = valid;

        return {
          stagedPiece: updatedStagedPiece,
          newStagedPieceId: newPieceId,
        };
      }),

    setStagedPieceColor: (color: string) =>
      set(() => {
        return { stagedPieceColor: color };
      }),

    stageNewPiece: (pos = [0, 0]) =>
      set((state) => {
        if (!state.newStagedPieceId) return {};
        const key = state.nextKey;
        const newStagedPiece: StagedPiece = {
          key: key.toString(),
          pieceId: state.newStagedPieceId!,
          pos: [pos[0], 0, pos[1]] as Position3,
          rot: [0, 0, 0] as Position3,
          isNew: true,
          isValidPosition: true,
        };
        const { position, valid } = snapAndValidate(
          state.pieces,
          newStagedPiece,
          state.basePlate!
        );
        newStagedPiece.pos = position;
        newStagedPiece.isValidPosition = valid;

        return {
          stagedPiece: newStagedPiece,
          nextKey: key + 1,
        };
      }),

    stageExistingPiece: (key: number) =>
      set((state) => {
        if (state.stagedPiece) return {};
        const pieceToBeStaged = state.pieces.find(
          (p) => p.key === key.toString()
        );
        if (!pieceToBeStaged) return {};

        return {
          pieces: state.pieces.filter((p) => p.key !== key.toString()),
          stagedPiece: {
            key: key.toString(),
            pieceId: pieceToBeStaged.pieceId,
            pos: [...pieceToBeStaged.pos] as Position3,
            rot: [...pieceToBeStaged.rot] as Position3,
            isValidPosition: true,
            isNew: false,
            oldPos: [...pieceToBeStaged.pos] as Position3,
            oldRot: [...pieceToBeStaged.rot] as Position3,
            oldColor: pieceToBeStaged.color,
          },
          stagedPieceColor: pieceToBeStaged.color,
        };
      }),

    moveStagedPiece: (dir: Direction) =>
      set((state) => {
        if (!state.stagedPiece) return {};
        const step = 1;
        const updatedStagedPiece: StagedPiece = {
          ...state.stagedPiece,
          pos: [
            state.stagedPiece.pos[0] +
              (dir === "left" ? -step : dir === "right" ? step : 0),
            state.stagedPiece.pos[1],
            state.stagedPiece.pos[2] +
              (dir === "down" ? step : dir === "up" ? -step : 0),
          ] as Position3,
        };
        const { position, valid } = snapAndValidate(
          state.pieces,
          updatedStagedPiece,
          state.basePlate!
        );
        updatedStagedPiece.pos = position;
        updatedStagedPiece.isValidPosition = valid;
        return {
          stagedPiece: updatedStagedPiece,
        };
      }),

    rotateStagedPiece: (direction: "left" | "right") =>
      set((state) => {
        if (!state.stagedPiece) return {};
        const old = state.stagedPiece;
        const rotationAmount =
          direction === "left" ? -Math.PI / 2 : Math.PI / 2;
        const updatedStagedPiece: StagedPiece = {
          ...old,
          rot: [
            old.rot[0],
            old.rot[1] + rotationAmount,
            old.rot[2],
          ] as Position3,
        };
        const { position, valid } = snapAndValidate(
          state.pieces,
          updatedStagedPiece,
          state.basePlate!
        );
        updatedStagedPiece.pos = position;
        updatedStagedPiece.isValidPosition = valid;
        return {
          stagedPiece: updatedStagedPiece,
        };
      }),

    confirmPlace: () =>
      set((state) => {
        if (!state.stagedPiece || !state.stagedPiece.isValidPosition) return {};
        const newPlacedPiece: Piece = {
          key: state.stagedPiece.key,
          pieceId: state.stagedPiece.pieceId,
          pos: state.stagedPiece.pos,
          rot: state.stagedPiece.rot,
          color: state.stagedPieceColor,
        };
        return {
          pieces: [...state.pieces, newPlacedPiece],
          stagedPiece: null,
        };
      }),

    unstagePiece: () =>
      set((state) => {
        if (!state.stagedPiece) return {};
        if (state.stagedPiece.isNew) {
          return {
            stagedPiece: null,
          };
        }

        const oldPiece: Piece = {
          key: state.stagedPiece.key,
          pieceId: state.stagedPiece.pieceId,
          pos: state.stagedPiece.oldPos!,
          rot: state.stagedPiece.oldRot!,
          color: state.stagedPiece.oldColor!,
        };
        return {
          pieces: [...state.pieces, oldPiece],
          stagedPiece: null,
        };
      }),
  })
);
