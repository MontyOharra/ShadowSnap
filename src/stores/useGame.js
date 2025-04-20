import { create } from "zustand";
import { snapAndValidate } from "../utils/stud-utils";

export const useGame = create((set) => ({
  pieces: [],
  stagedPiece: null,
  ghostValid: false, // ← global flag for rendering colour
  nextId: 1,

  /* -- 0. add baseplate (non-interactive) ------------------------- */
  addBasePlate: () =>
    set((state) => {
      const basePlate = {
        id: "baseplate",
        type: "base-plate-16x16",
        pos: [-8, 0, -8],
        rot: [0, 0, 0],
        isBasePlate: true,
      };
      return {
        pieces: [basePlate, ...state.pieces],
      };
    }),

  stageNewPiece: (pieceType, pos = [0, 0]) => {
    set((state) => {
      const id = state.nextId;
      const piece = {
        id,
        type: pieceType,
        pos: [pos[0], 0, pos[1]],
        rot: [0, 0, 0],
        isBasePlate: false,
      };
      const { y, valid } = snapAndValidate(state.pieces, piece);
      piece.pos[1] = y;
      return {
        pieces: state.pieces,
        stagedPiece: {
          piece: piece,
          isNew: true,
        },
        ghostValid: valid,
        nextId: id + 1,
      };
    });
  },

  stageExistingPiece: (pieceId) => {
    set((state) => {
      if (state.stagedPiece != null) {
        return {};
      }
      const pieceToBeStaged = state.pieces.find(
        (currPiece) => currPiece.id === pieceId
      );
      if (!pieceToBeStaged) return {};

      // Validate the piece in its current position
      const { valid } = snapAndValidate(
        state.pieces.filter((p) => p.id !== pieceId),
        pieceToBeStaged
      );

      return {
        pieces: state.pieces.filter((currPiece) => currPiece.id !== pieceId),
        stagedPiece: {
          piece: pieceToBeStaged,
          isNew: false,
          oldPos: [...pieceToBeStaged.pos],
          oldRot: [...pieceToBeStaged.rot],
        },
        ghostValid: valid,
      };
    });
  },

  unstagePiece: () => {
    set((state) => {
      if (state.stagedPiece == null) {
        return {};
      }
      if (state.stagedPiece.isNew) {
        return { stagedPiece: null, ghostValid: false };
      } else {
        // For existing pieces, restore their original position
        const revertedPiece = {
          ...state.stagedPiece.piece,
          pos: state.stagedPiece.oldPos,
          rot: state.stagedPiece.oldRot,
        };
        return {
          pieces: [...state.pieces, revertedPiece],
          stagedPiece: null,
          ghostValid: false,
        };
      }
    });
  },

  /* -- 2. move selected ghost one stud ------------------------------ */
  moveSel: (dir) =>
    set((state) => {
      if (!state.stagedPiece) return {};
      const step = 1;
      const movedPiece = {
        ...state.stagedPiece.piece,
        pos: [
          state.stagedPiece.piece.pos[0] +
            (dir === "left" ? -step : dir === "right" ? step : 0),
          state.stagedPiece.piece.pos[1],
          state.stagedPiece.piece.pos[2] +
            (dir === "down" ? step : dir === "up" ? -step : 0),
        ],
      };

      const snap = snapAndValidate(state.pieces, movedPiece);
      movedPiece.pos[1] = snap.y;

      return {
        stagedPiece: {
          ...state.stagedPiece,
          piece: movedPiece,
        },
        ghostValid: snap.valid,
      };
    }),

  /* -- 3. rotate selected ghost ------------------------------------ */
  rotateSel: () =>
    set((state) => {
      if (!state.stagedPiece) return {};
      const rotatedPiece = {
        ...state.stagedPiece.piece,
        rot: [
          state.stagedPiece.piece.rot[0],
          state.stagedPiece.piece.rot[1] + Math.PI / 2,
          state.stagedPiece.piece.rot[2],
        ],
      };

      const snap = snapAndValidate(state.pieces, rotatedPiece);
      rotatedPiece.pos[1] = snap.y;

      return {
        stagedPiece: {
          ...state.stagedPiece,
          piece: rotatedPiece,
        },
        ghostValid: snap.valid,
      };
    }),

  /* -- 4. confirm placement (Enter) -------------------------------- */
  confirmPlace: () =>
    set((state) => {
      if (!state.stagedPiece || !state.ghostValid) return {};

      return {
        pieces: [...state.pieces, state.stagedPiece.piece],
        stagedPiece: null,
        ghostValid: false,
      };
    }),
}));
