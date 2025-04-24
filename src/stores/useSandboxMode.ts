// stores/useGame.js
import { create } from "zustand";
import { snapAndValidate } from "../utils/stud-utils";
import { PlacedPiece, Position3 } from "@/types";

type Direction = "left" | "right" | "up" | "down";

interface StagedPiece {
  piece: PlacedPiece;
  isNew: boolean;
  oldPos?: Position3;
  oldRot?: Position3;
}

interface SandboxModeState {
  pieces: PlacedPiece[];
  stagedPiece: StagedPiece | null;
  newStagedPieceType: string | null;
  ghostValid: boolean;
  nextId: number;
  groupRotation: Position3;
}

interface SandboxModeActions {
  addBasePlate: () => void;
  stageNewPiece: (pos?: [number, number]) => void;
  moveSel: (dir: Direction) => void;
  rotateSel: () => void;
  confirmPlace: () => void;
  stageExistingPiece: (pieceId: number) => void;
  unstagePiece: () => void;
  changeNewPieceType: (newType: string) => void;
  setGroupRotation: (angleRad: number) => void;
}

export const useGame = create<SandboxModeState & SandboxModeActions>((set) => ({
  pieces: [],
  stagedPiece: null,
  newStagedPieceType: null,
  ghostValid: false,
  nextId: 1,
  groupRotation: [0, 0, 0],

  /* 0) add the base‑plate */
  addBasePlate: () =>
    set((state) => {
      const id = state.nextId;
      return {
        pieces: [
          {
            id,
            type: "base-plate-16x16",
            pos: [-8, 0, -8] as Position3,
            rot: [0, 0, 0] as Position3,
            isBasePlate: true,
          },
          ...state.pieces,
        ],
        nextId: id + 1,
      };
    }),

  /* 1) stage a new piece */
  stageNewPiece: (pos = [0, 0]) =>
    set((state) => {
      const id = state.nextId;
      const piece: PlacedPiece = {
        id,
        type: state.newStagedPieceType!,
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
        nextId: id + 1,
      };
    }),

  /* 2) move staged piece */
  moveSel: (dir: Direction) =>
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

  /* 3) rotate staged piece 90° around Y */
  rotateSel: () =>
    set((state) => {
      if (!state.stagedPiece) return {};
      const old = state.stagedPiece.piece;
      const rotatedPiece: PlacedPiece = {
        ...old,
        rot: [old.rot[0], old.rot[1] + Math.PI / 2, old.rot[2]] as Position3,
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

  /* 4) confirm placement */
  confirmPlace: () =>
    set((state) => {
      if (!state.stagedPiece || !state.ghostValid) return {};
      return {
        pieces: [...state.pieces, state.stagedPiece.piece],
        stagedPiece: null,
        ghostValid: false,
      };
    }),

  /* 5) stage an existing piece */
  stageExistingPiece: (pieceId: number) =>
    set((state) => {
      if (state.stagedPiece) return {};
      const pieceToBeStaged = state.pieces.find((p) => p.id === pieceId);
      if (!pieceToBeStaged) return {};
      const { valid } = snapAndValidate(
        state.pieces.filter((p) => p.id !== pieceId),
        pieceToBeStaged
      );
      return {
        pieces: state.pieces.filter((p) => p.id !== pieceId),
        stagedPiece: {
          piece: pieceToBeStaged,
          isNew: false,
          oldPos: [...pieceToBeStaged.pos] as Position3,
          oldRot: [...pieceToBeStaged.rot] as Position3,
        },
        ghostValid: valid,
      };
    }),

  /* 6) unstage piece (Esc) */
  unstagePiece: () =>
    set((state) => {
      if (!state.stagedPiece) return {};
      if (state.stagedPiece.isNew) {
        return {
          stagedPiece: null,
          newStagedPieceType: null,
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

  /* 7) change type of staged new piece */
  changeNewPieceType: (newType: string) =>
    set((state) => {
      if (!state.stagedPiece) return { newStagedPieceType: newType };

      const updatedPiece: PlacedPiece = {
        ...state.stagedPiece.piece,
        type: newType,
      };
      const { y, valid } = snapAndValidate(state.pieces, updatedPiece);
      updatedPiece.pos = [
        updatedPiece.pos[0],
        y,
        updatedPiece.pos[2],
      ] as Position3;
      return {
        stagedPiece: { ...state.stagedPiece, piece: updatedPiece },
        newStagedPieceType: newType,
        ghostValid: valid,
      };
    }),

  /* NEW) set absolute baseplate rotation (radians) */
  setGroupRotation: (angleRad: number) =>
    set(() => ({
      groupRotation: [0, angleRad, 0] as Position3,
    })),
}));
