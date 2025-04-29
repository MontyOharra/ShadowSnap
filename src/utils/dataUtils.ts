import { Position3 } from "@/types";

// Interface for a single piece in a level
export interface LevelPiece {
  pieceId: string; // Unique identifier for the piece
  color: string; // Color of the piece
  position: number[]; // 3D position of the piece [x, y, z]
  rotation: number[]; // 3D rotation of the piece [x, y, z]
}

// Interface for a complete level's data
interface LevelData {
  id: string; // Unique identifier for the level
  name: string; // Display name of the level
  pieces: LevelPiece[]; // Array of pieces in the level
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
      pieces: data.pieces,
    };
  } catch (error) {
    console.error("Error loading level data:", error);
    throw error;
  }
}

// Generates a unique level ID
function generateLevelId(): string {
  return `level_${Math.random().toString(36).substring(2, 9)}`;
}


export async function saveLevelData(
  /*
  Saves level data to a JSON file in downloads of the user's browser

  levelName - The name of the level (used in the JSON data)
  pieces - The array of pieces to save

 */
  levelName: string,
  pieces: LevelPiece[]
): Promise<void> {
  try {
    // Generate a unique level ID
    const levelId = generateLevelId();

    // Create the level data object
    const levelData: LevelData = {
      id: levelId,
      name: levelName,
      pieces: pieces,
    };

    // Add createdBy field for compatibility with level loader
    const fullLevelData = {
      ...levelData,
      createdBy: "user",
    };

    // Create a blob with the level data
    const blob = new Blob([JSON.stringify(fullLevelData, null, 2)], {
      type: "application/json",
    });

    // Create a download link
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    // Save with the level ID as the filename
    a.download = `${levelId}.json`;

    // Trigger the download
    document.body.appendChild(a);
    a.click();

    // Cleanup
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Error saving level data:", error);
    throw error;
  }
}
