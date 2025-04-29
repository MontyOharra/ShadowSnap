import { create } from "zustand";
import { snapAndValidate, isStudUnderPieces } from "../utils/studUtils";
import {
  Piece,
  StagedPiece,
  Position3,
  Direction,
  DefinedPieceId,
} from "@/types";
import { useInventoryManager } from "./useInventoryManager";
import { useBasePlateStore } from "./useBasePlateStore";
import { LevelPiece } from "../utils/dataUtils";

// Define the state interface for the build manager
interface BuildManagerState {
  pieces: Piece[]; // An array of all the pieces in the build
  stagedPiece: StagedPiece | null; // The piece that is currently being staged
  nextKey: number; // The next key for the piece
}

// Define the actions interface for the build manager
interface BuildManagerActions {
  stageNewPiece: (pos?: [number, number]) => void; // Stage a new piece at the given position
  stageExistingPiece: (key: number) => void; // Stage an existing piece by its key
  unstagePiece: () => void; // Remove the currently staged piece
  moveStagedPiece: (dir: Direction) => void; // Move the staged piece in a direction
  rotateStagedPiece: (direction: "left" | "right") => void; // Rotate the staged piece
  confirmPlace: (color?: string) => void; // Place the staged piece in the build
  removePiece: () => void; // Remove a piece from the build
  import: (levelData: { pieces: LevelPiece[] }) => void; // Import a level's pieces
  export: () => { pieces: LevelPiece[] }; // Export the current build's pieces
}

export const useBuildManager = create<BuildManagerState & BuildManagerActions>(
  (set, get) => ({
    // Initial state
    pieces: [], // No pieces initially
    stagedPiece: null, // No staged piece initially
    nextKey: 1, // Start with key 1

    // Update the ID of the currently staged piece
    setNewPieceId: (newPieceId: string) =>
      set((state) => {
        // If no staged piece, do nothing
        if (!state.stagedPiece) return {};
        // If the new piece id is the same as the staged piece id, do nothing
        if (state.stagedPiece.pieceId === newPieceId) return {};

        // Update the staged piece id
        const updatedStagedPiece: StagedPiece = {
          ...state.stagedPiece,
          pieceId: newPieceId,
        };

        // Get baseplate from the baseplate store
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

    // Stage a new piece at the given position
    stageNewPiece: (pos = [0, 0]) =>
      set((state) => {
        const selectedPieceId = useInventoryManager.getState().selectedPieceId;
        if (!selectedPieceId) return {};
        if (state.stagedPiece) return {};

        // Get baseplate from the store
        const { basePlate } = useBasePlateStore
          .getState()
          .getBasePlateDetails();

        const key = state.nextKey; // The key for the new piece
        const newStagedPiece: StagedPiece = {
          key: key.toString(),
          pieceId: selectedPieceId,
          pos: [pos[0], 0, pos[1]] as Position3, // The position of the new piece
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

    // Stage an existing piece by its key
    stageExistingPiece: (key: number) =>
      set((state) => {
        // If there is already a staged piece, do nothing
        if (state.stagedPiece) return {};
        // Find the piece to be staged
        const pieceToBeStaged = state.pieces.find(
          (p) => p.key === key.toString()
        );
        if (!pieceToBeStaged) return {};

        // Check to see if piece is under another piece. If so, do not allow user to stage it
        if (isStudUnderPieces(pieceToBeStaged, state.pieces)) {
          return {};
        }

        // Set the selected piece color to match the staged piece's color
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

    // Move the staged piece in a direction
    moveStagedPiece: (dir: Direction) =>
      set((state) => {
        if (!state.stagedPiece) return {};

        // Get baseplate from the store
        const { basePlate } = useBasePlateStore
          .getState()
          .getBasePlateDetails();

        const step = 1; // The step size for the movement
        const updatedStagedPiece: StagedPiece = {
          ...state.stagedPiece,
          // Update the position of the staged piece by adding or subtracting
          //  the step size to the x or z axis depending on the direction
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

    // Rotate the staged piece
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

    // Place the staged piece in the build
    confirmPlace: (color?: string) =>
      set((state) => {
        if (!state.stagedPiece || !state.stagedPiece.isValidPosition) return {};

        // Consume the piece from inventory
        const newPlacedPiece: Piece = {
          key: state.stagedPiece.key,
          pieceId: state.stagedPiece.pieceId,
          pos: state.stagedPiece.pos,
          rot: state.stagedPiece.rot,
          color:
            color ??
            state.stagedPiece.color ??
            useInventoryManager.getState().selectedPieceColor,
        };
        if (state.stagedPiece.isNew) {
          useInventoryManager.getState().consumePiece();
        }
        return {
          pieces: [...state.pieces, newPlacedPiece],
          stagedPiece: null,
        };
      }),

    // Remove the currently staged piece
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

    // Remove a piece from the build
    removePiece: () =>
      set((state) => {
        if (!state.stagedPiece) return {};

        // Use the correct type for piece ID
        const pieceId = state.stagedPiece.pieceId as DefinedPieceId;

        useInventoryManager.getState().addPieceToInventory(pieceId, 1);

        return {
          pieces: state.pieces.filter((p) => p.key !== state.stagedPiece?.key),
          stagedPiece: null,
        };
      }),

    // Import a level's pieces
    import: (levelData: { pieces: LevelPiece[] }) => {
      set((state) => {
        // Clear existing pieces and import new ones
        const newPieces = levelData.pieces.map((piece, index) => ({
          key: (state.nextKey + index).toString(),
          pieceId: piece.pieceId,
          pos: piece.position as Position3,
          rot: piece.rotation as Position3,
          color: piece.color,
        }));

        return {
          pieces: newPieces,
          nextKey: state.nextKey + newPieces.length,
        };
      });
    },

    // Export the current build's pieces
    export: () => {
      const state = get();
      return {
        pieces: state.pieces.map((piece) => ({
          pieceId: piece.pieceId,
          color: piece.color ?? "#ffffff",
          position: piece.pos,
          rotation: piece.rot,
        })),
      };
    },
  })
);
