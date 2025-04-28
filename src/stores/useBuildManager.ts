import { create } from "zustand";
import { snapAndValidate, isStudUnderPieces } from "../utils/studUtils";
import { Piece, StagedPiece, Position3, Direction } from "@/types";
import { useInventoryManager } from "./useInventoryManager";
import { useBasePlateStore } from "./useBasePlateStore";

interface BuildManagerState {
  pieces: Piece[];
  stagedPiece: StagedPiece | null;
  nextKey: number;
}

interface BuildManagerActions {
  stageNewPiece: (pos?: [number, number]) => void;
  stageExistingPiece: (key: number) => void;
  unstagePiece: () => void;
  moveStagedPiece: (dir: Direction) => void;
  rotateStagedPiece: (direction: "left" | "right") => void;
  confirmPlace: (color?: string) => void;
  removePiece: () => void;
  import: (levelData: {
    pieces: Array<{
      pieceId: string;
      color: string;
      position: Position3;
      rotation: Position3;
    }>;
  }) => void;
}

export const useBuildManager = create<BuildManagerState & BuildManagerActions>(
  (set) => ({
    pieces: [],
    stagedPiece: null,
    nextKey: 1,

    setNewPieceId: (newPieceId: string) =>
      set((state) => {
        // If no staged piece, set the new piece id
        if (!state.stagedPiece) return {};
        // If the new piece id is the same as the staged piece id, do nothing
        if (state.stagedPiece.pieceId === newPieceId) return {};

        // Update the staged piece id
        const updatedStagedPiece: StagedPiece = {
          ...state.stagedPiece,
          pieceId: newPieceId,
        };

        // Get baseplate from the store
        const { basePlate } = useBasePlateStore
          .getState()
          .getBasePlateDetails();

        // Validate the new position
        const { position, valid } = snapAndValidate(
          state.pieces,
          updatedStagedPiece,
          basePlate
        );
        updatedStagedPiece.pos = position;
        updatedStagedPiece.isValidPosition = valid;

        return {
          stagedPiece: updatedStagedPiece,
        };
      }),

    stageNewPiece: (pos = [0, 0]) =>
      set((state) => {
        const selectedPieceId = useInventoryManager.getState().selectedPieceId;
        if (!selectedPieceId) return {};

        // Get baseplate from the store
        const { basePlate } = useBasePlateStore
          .getState()
          .getBasePlateDetails();

        const key = state.nextKey;
        const newStagedPiece: StagedPiece = {
          key: key.toString(),
          pieceId: selectedPieceId,
          pos: [pos[0], 0, pos[1]] as Position3,
          rot: [0, 0, 0] as Position3,
          isNew: true,
          isValidPosition: true,
          color: useInventoryManager.getState().selectedPieceColor ?? "#ffffff",
        };
        const { position, valid } = snapAndValidate(
          state.pieces,
          newStagedPiece,
          basePlate
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

        if (isStudUnderPieces(pieceToBeStaged, state.pieces)) {
          return {};
        }

        useInventoryManager
          .getState()
          .setSelectedPieceColor(pieceToBeStaged.color ?? "#ffffff");

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
            color: pieceToBeStaged.color ?? "#ffffff",
          },
        };
      }),

    moveStagedPiece: (dir: Direction) =>
      set((state) => {
        if (!state.stagedPiece) return {};

        // Get baseplate from the store
        const { basePlate } = useBasePlateStore
          .getState()
          .getBasePlateDetails();

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
          basePlate
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

        // Get baseplate from the store
        const { basePlate } = useBasePlateStore
          .getState()
          .getBasePlateDetails();

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
          basePlate
        );
        updatedStagedPiece.pos = position;
        updatedStagedPiece.isValidPosition = valid;
        return {
          stagedPiece: updatedStagedPiece,
        };
      }),

    confirmPlace: (color?: string) =>
      set((state) => {
        if (!state.stagedPiece || !state.stagedPiece.isValidPosition) return {};

        // Consume the piece from inventory
        if (state.stagedPiece.isNew) {
          useInventoryManager.getState().consumePiece();
        }

        const newPlacedPiece: Piece = {
          key: state.stagedPiece.key,
          pieceId: state.stagedPiece.pieceId,
          pos: state.stagedPiece.pos,
          rot: state.stagedPiece.rot,
          color: color ?? useInventoryManager.getState().selectedPieceColor,
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

        if (
          !state.stagedPiece.oldPos ||
          !state.stagedPiece.oldRot ||
          !state.stagedPiece.oldColor
        ) {
          return {
            stagedPiece: null,
          };
        }

        const oldPiece: Piece = {
          key: state.stagedPiece.key,
          pieceId: state.stagedPiece.pieceId,
          pos: state.stagedPiece.oldPos,
          rot: state.stagedPiece.oldRot,
          color: state.stagedPiece.oldColor,
        };
        return {
          pieces: [...state.pieces, oldPiece],
          stagedPiece: null,
        };
      }),
    
    removePiece: () =>
      set((state) => {
        if (!state.stagedPiece) return {};
        useInventoryManager.getState().addPieceToInventory(state.stagedPiece.pieceId, 1);
        return {
          pieces: state.pieces.filter((p) => p.key !== state.stagedPiece?.key),
          stagedPiece: null,
        };
      }),

    import: (levelData: {
      pieces: Array<{
        pieceId: string;
        color: string;
        position: Position3;
        rotation: Position3;
      }>;
    }) => {
      set((state) => {
        // Clear existing pieces
        const newPieces = levelData.pieces.map((piece, index) => ({
          key: (state.nextKey + index).toString(),
          pieceId: piece.pieceId,
          pos: piece.position,
          rot: piece.rotation,
          color: piece.color,
        }));

        return {
          pieces: newPieces,
          nextKey: state.nextKey + newPieces.length,
        };
      });
    },
  })
);
