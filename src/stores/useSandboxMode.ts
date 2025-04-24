import { create } from "zustand";
import { snapAndValidate } from "../utils/stud-utils";
import { PlacedPiece, StagedPiece, Position3, Direction } from "@/types";

interface SandboxModeState {
  pieces: PlacedPiece[];
  stagedPiece: StagedPiece | null;
  newStagedPieceId: string;
  stagedPieceColor: string;
  ghostValid: boolean;
  nextKey: number;
  basePlateRotation: Position3;
}

interface SandboxModeActions {
  addBasePlate: () => void;
  rotateBasePlate: (angleRad: number) => void;
  changeNewPiece: (newType: string, color: string) => void;
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
    stagedPiece: null,
    newStagedPieceId: "",
    stagedPieceColor: "#FF0000", // Default to red
    ghostValid: false,
    nextKey: 1,
    basePlateRotation: [0, 0, 0],

    addBasePlate: () =>
      set((state) => {
        const key = state.nextKey;
        return {
          pieces: [
            {
              key,
              pieceId: "base-plate-16x16",
              pos: [0, 0, 0] as Position3,
              rot: [0, 0, 0] as Position3,
              isBasePlate: true,
            },
            ...state.pieces,
          ],
          nextKey: key + 1,
        };
      }),

    rotateBasePlate: (angleRad: number) =>
      set(() => ({
        basePlateRotation: [0, angleRad, 0] as Position3,
      })),

    changeNewPiece: (newPieceId: string, newColor: string) =>
      set((state) => {
        if (!state.stagedPiece) return { newStagedPieceId: newPieceId };
        if (state.newStagedPieceId === newPieceId) return {};

        const updatedPiece: PlacedPiece = {
          ...state.stagedPiece.piece,
          pieceId: newPieceId,
        };
        const { y, valid } = snapAndValidate(state.pieces, updatedPiece);
        updatedPiece.pos = [
          updatedPiece.pos[0],
          y,
          updatedPiece.pos[2],
        ] as Position3;
        return {
          stagedPiece: { ...state.stagedPiece, piece: updatedPiece },
          newStagedPieceId: newPieceId,
          stagedPieceColor: newColor,
          ghostValid: valid,
        };
      }),

    stageNewPiece: (pos = [0, 0]) =>
      set((state) => {
        const key = state.nextKey;
        const piece: PlacedPiece = {
          key,
          pieceId: state.newStagedPieceId!,
          pos: [pos[0], 0, pos[1]] as Position3,
          rot: [0, 0, 0] as Position3,
          isBasePlate: false,
        };
        const { y, valid } = snapAndValidate(state.pieces, piece);
        piece.pos = [piece.pos[0], y, piece.pos[2]] as Position3;

        return {
          pieces: state.pieces,
          stagedPiece: { piece, isNew: true },
          ghostValid: valid,
          nextKey: key + 1,
        };
      }),

    /* 5) stage an existing piece */
    stageExistingPiece: (key: number) =>
      set((state) => {
        if (state.stagedPiece) return {};
        const pieceToBeStaged = state.pieces.find((p) => p.key === key);
        if (!pieceToBeStaged) return {};
        const { valid } = snapAndValidate(
          state.pieces.filter((p) => p.key !== key),
          pieceToBeStaged
        );
        return {
          pieces: state.pieces.filter((p) => p.key !== key),
          stagedPiece: {
            piece: pieceToBeStaged,
            isNew: false,
            oldPos: [...pieceToBeStaged.pos] as Position3,
            oldRot: [...pieceToBeStaged.rot] as Position3,
          },
          ghostValid: valid,
        };
      }),

    /* 2) move staged piece */
    moveStagedPiece: (dir: Direction) =>
      set((state) => {
        if (!state.stagedPiece) return {};
        const old = state.stagedPiece.piece;
        const step = 1;
        const movedPiece: PlacedPiece = {
          ...old,
          pos: [
            old.pos[0] + (dir === "left" ? -step : dir === "right" ? step : 0),
            old.pos[1],
            old.pos[2] + (dir === "down" ? step : dir === "up" ? -step : 0),
          ] as Position3,
        };
        const snap = snapAndValidate(state.pieces, movedPiece);
        movedPiece.pos = [
          movedPiece.pos[0],
          snap.y,
          movedPiece.pos[2],
        ] as Position3;
        return {
          stagedPiece: { ...state.stagedPiece, piece: movedPiece },
          ghostValid: snap.valid,
        };
      }),

    rotateStagedPiece: (direction: "left" | "right") =>
      set((state) => {
        if (!state.stagedPiece) return {};
        const old = state.stagedPiece.piece;
        const rotationAmount =
          direction === "left" ? -Math.PI / 2 : Math.PI / 2;
        const rotatedPiece: PlacedPiece = {
          ...old,
          rot: [
            old.rot[0],
            old.rot[1] + rotationAmount,
            old.rot[2],
          ] as Position3,
          pos: [...old.pos] as Position3,
        };
        const snap = snapAndValidate(state.pieces, rotatedPiece);
        rotatedPiece.pos = [
          rotatedPiece.pos[0],
          snap.y,
          rotatedPiece.pos[2],
        ] as Position3;
        return {
          stagedPiece: { ...state.stagedPiece, piece: rotatedPiece },
          ghostValid: snap.valid,
        };
      }),

    confirmPlace: (color?: string) =>
      set((state) => {
        if (!state.stagedPiece || !state.ghostValid) return {};
        return {
          pieces: [...state.pieces, { ...state.stagedPiece.piece, color }],
          stagedPiece: null,
          ghostValid: false,
        };
      }),

    unstagePiece: () =>
      set((state) => {
        if (!state.stagedPiece) return {};
        if (state.stagedPiece.isNew) {
          return {
            stagedPiece: null,
            newStagedPieceId: "",
            ghostValid: false,
          };
        }
        return {
          pieces: [
            ...state.pieces,
            {
              ...state.stagedPiece.piece,
              pos: state.stagedPiece.oldPos!,
              rot: state.stagedPiece.oldRot!,
            },
          ],
          stagedPiece: null,
          ghostValid: false,
        };
      }),
  })
);
