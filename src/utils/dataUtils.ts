import { Position3 } from "@/types";

interface LevelPiece {
  pieceId: string;
  color: string;
  position: number[];
  rotation: number[];
}

interface LevelData {
  id: string;
  name: string;
  createdBy: string;
  pieces: LevelPiece[];
}

export function transformLevelData(data: LevelData): {
  pieces: Array<{
    pieceId: string;
    color: string;
    position: Position3;
    rotation: Position3;
  }>;
} {
  return {
    pieces: data.pieces.map((piece) => ({
      pieceId: piece.pieceId,
      color: piece.color,
      position: piece.position as Position3,
      rotation: piece.rotation as Position3,
    })),
  };
}

export async function loadLevelData(file: File): Promise<LevelData> {
  try {
    const text = await file.text();
    const data = JSON.parse(text);

    // Validate the data structure
    if (
      !data.id ||
      !data.name ||
      !data.createdBy ||
      !Array.isArray(data.pieces)
    ) {
      throw new Error("Invalid level data format");
    }

    return {
      id: data.id,
      name: data.name,
      createdBy: data.createdBy,
      pieces: data.pieces,
    };
  } catch (error) {
    console.error("Error loading level data:", error);
    throw error;
  }
}
