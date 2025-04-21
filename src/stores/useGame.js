// stores/useGame.js
import { create } from "zustand";
import { snapAndValidate } from "../utils/stud-utils";

export const useGame = create((set) => ({
  pieces: [],
  stagedPiece: null,
  ghostValid: false,
  nextId: 1,

  /* -------------------------------------------------------------- */
  /* 0) add the base‑plate                                          */
  /* -------------------------------------------------------------- */
  addBasePlate: () =>
    set((state) => {
      const id = state.nextId;
      return {
        pieces: [
          {
            id,
            type: "base-plate-16x16",
            pos: [-8, 0, -8],
            rot: [0, 0, 0],
            isBasePlate: true,
          },
          ...state.pieces,
        ],
        nextId: id + 1,
      };
    }),

  /* -------------------------------------------------------------- */
  /* 1) stage a brand‑new piece                                     */
  /* -------------------------------------------------------------- */
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

      /* *** NEW ARRAY for pos (don’t mutate) *** */
      piece.pos = [piece.pos[0], y, piece.pos[2]];

      return {
        pieces: state.pieces,
        stagedPiece: { piece, isNew: true },
        ghostValid: valid,
        nextId: id + 1,
      };
    });
  },

  /* -------------------------------------------------------------- */
  /* 2) move staged piece one stud                                  */
  /* -------------------------------------------------------------- */
  moveSel: (dir) =>
    set((state) => {
      if (!state.stagedPiece) return {};

      const step = 1;
      const old = state.stagedPiece.piece;

      const movedPiece = {
        ...old,
        pos: [
          old.pos[0] + (dir === "left" ? -step : dir === "right" ? step : 0),
          old.pos[1], // Y filled in after snap
          old.pos[2] + (dir === "down" ? step : dir === "up" ? -step : 0),
        ],
      };

      const snap = snapAndValidate(state.pieces, movedPiece);
      movedPiece.pos = [movedPiece.pos[0], snap.y, movedPiece.pos[2]]; // NEW ARRAY

      return {
        stagedPiece: { ...state.stagedPiece, piece: movedPiece },
        ghostValid: snap.valid,
      };
    }),

  /* -------------------------------------------------------------- */
  /* 3) rotate staged piece 90° around Y                            */
  /* -------------------------------------------------------------- */
  rotateSel: () =>
    set((state) => {
      if (!state.stagedPiece) return {};

      const old = state.stagedPiece.piece;

      const rotatedPiece = {
        ...old,
        rot: [old.rot[0], old.rot[1] + Math.PI / 2, old.rot[2]], // *** NEW ARRAY ***
        pos: [...old.pos], // clone before adjusting Y
      };

      const snap = snapAndValidate(state.pieces, rotatedPiece);
      rotatedPiece.pos = [rotatedPiece.pos[0], snap.y, rotatedPiece.pos[2]]; // NEW ARRAY

      return {
        stagedPiece: { ...state.stagedPiece, piece: rotatedPiece },
        ghostValid: snap.valid,
      };
    }),

  /* -------------------------------------------------------------- */
  /* 4) confirm placement                                           */
  /* -------------------------------------------------------------- */
  confirmPlace: () =>
    set((state) => {
      if (!state.stagedPiece || !state.ghostValid) return {};
      return {
        pieces: [...state.pieces, state.stagedPiece.piece],
        stagedPiece: null,
        ghostValid: false,
      };
    }),

  /* -------------------------------------------------------------- */
  /* 5) stage an existing piece                                     */
  /* -------------------------------------------------------------- */
  stageExistingPiece: (pieceId) =>
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
          oldPos: [...pieceToBeStaged.pos],
          oldRot: [...pieceToBeStaged.rot],
        },
        ghostValid: valid,
      };
    }),

  /* -------------------------------------------------------------- */
  /* 6) unstage piece (Esc)                                         */
  /* -------------------------------------------------------------- */
  unstagePiece: () =>
    set((state) => {
      if (!state.stagedPiece) return {};

      if (state.stagedPiece.isNew) {
        return { stagedPiece: null, ghostValid: false };
      }

      return {
        pieces: [
          ...state.pieces,
          {
            ...state.stagedPiece.piece,
            pos: state.stagedPiece.oldPos,
            rot: state.stagedPiece.oldRot,
          },
        ],
        stagedPiece: null,
        ghostValid: false,
      };
    }),

  /* -------------------------------------------------------------- */
  /* 7) change type of a staged new piece                           */
  /* -------------------------------------------------------------- */
  changeNewPieceType: (newType) =>
    set((state) => {
      if (!state.stagedPiece) return {};
      const updatedPiece = { ...state.stagedPiece.piece, type: newType };

      const { y, valid } = snapAndValidate(state.pieces, updatedPiece);
      updatedPiece.pos = [updatedPiece.pos[0], y, updatedPiece.pos[2]]; // NEW ARRAY

      return {
        stagedPiece: { ...state.stagedPiece, piece: updatedPiece },
        ghostValid: valid,
      };
    }),
}));
