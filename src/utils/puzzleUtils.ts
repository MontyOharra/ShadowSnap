interface PieceData {
  pieceId: string;
  position: [number, number, number];
  rotation?: [number, number, number];
  color?: string;
}

interface UserPiece {
  pieceId: string;
  pos: [number, number, number];
  rot: [number, number, number];
}

/**
 * Checks if two sets of pieces match in terms of count, position, and rotation
 * @param userPieces - Array of pieces from the user's build
 * @param targetPieces - Array of target pieces to compare against
 * @returns True if the pieces match, false otherwise
 */
export function checkPiecesMatch(
  userPieces: UserPiece[],
  targetPieces: PieceData[]
): boolean {
  // Quick check - if counts don't match, return false immediately
  if (userPieces.length !== targetPieces.length) return false;

  // Create maps for efficient comparison
  const userPieceMap = new Map<string, number>();
  const targetPieceMap = new Map<string, number>();

  // Build maps of piece types and their counts
  userPieces.forEach((piece) => {
    const key = piece.pieceId;
    const count = userPieceMap.get(key) || 0;
    userPieceMap.set(key, count + 1);
  });

  targetPieces.forEach((piece) => {
    const key = piece.pieceId;
    const count = targetPieceMap.get(key) || 0;
    targetPieceMap.set(key, count + 1);
  });

  // Check if maps have the same keys and counts
  if (userPieceMap.size !== targetPieceMap.size) {
    return false;
  }

  for (const [key, count] of userPieceMap.entries()) {
    if (targetPieceMap.get(key) !== count) {
      return false;
    }
  }

  // If piece counts match, check exact positions and rotations
  // Create a map of expected positions and rotations for each piece type
  const targetPositionMap = new Map<
    string,
    { position: number[]; rotation: number[] }[]
  >();

  targetPieces.forEach((targetPiece) => {
    const key = targetPiece.pieceId;
    if (!targetPositionMap.has(key)) {
      targetPositionMap.set(key, []);
    }
    // Store both position and rotation for each piece
    targetPositionMap.get(key)?.push({
      position: targetPiece.position,
      rotation: targetPiece.rotation || [0, 0, 0],
    });
  });

  // For each user piece, check if there's a matching target piece with same position and rotation
  for (const userPiece of userPieces) {
    const key = userPiece.pieceId;
    const expectedPieces = targetPositionMap.get(key) || [];

    // Find a matching position and rotation
    const matchIndex = expectedPieces.findIndex((expected) => {
      const positionMatches = checkPositionMatch(
        userPiece.pos,
        expected.position
      );
      const rotationMatches = checkRotationMatch(
        userPiece.rot,
        expected.rotation,
        userPiece.pieceId
      );
      return positionMatches && rotationMatches;
    });

    // If no match found for this piece, the puzzle isn't solved
    if (matchIndex === -1) {
      return false;
    } else {
      // Remove the matched piece so it doesn't get matched again
      expectedPieces.splice(matchIndex, 1);
    }
  }

  // Ensure all target pieces were matched
  for (const [, positions] of targetPositionMap.entries()) {
    if (positions.length > 0) {
      return false;
    }
  }

  return true;
}

/**
 * Helper function to check if positions match, handling floating point errors
 */
function checkPositionMatch(
  userPosition: number[],
  expectedPosition: number[]
): boolean {
  return (
    roundValue(expectedPosition[0]) === roundValue(userPosition[0]) &&
    roundValue(expectedPosition[1]) === roundValue(userPosition[1]) &&
    roundValue(expectedPosition[2]) === roundValue(userPosition[2])
  );
}

/**
 * Helper function to check if rotations match, handling symmetrical pieces
 */
function checkRotationMatch(
  userRotation: number[],
  expectedRotation: number[],
  pieceId: string
): boolean {
  const userNormRot = [
    normalizeRotation(userRotation[0], pieceId),
    normalizeRotation(userRotation[1], pieceId),
    normalizeRotation(userRotation[2], pieceId),
  ];

  const expectedNormRot = [
    normalizeRotation(expectedRotation[0], pieceId),
    normalizeRotation(expectedRotation[1], pieceId),
    normalizeRotation(expectedRotation[2], pieceId),
  ];

  return (
    userNormRot[0] === expectedNormRot[0] &&
    userNormRot[1] === expectedNormRot[1] &&
    userNormRot[2] === expectedNormRot[2]
  );
}

/**
 * Helper function to round numbers and handle floating point errors
 */
function roundValue(value: number): number {
  // For very small values that are essentially zero (less than 1e-10)
  if (Math.abs(value) < 1e-10) {
    return 0;
  }
  // Round other values to 5 decimal places
  return Number(value.toFixed(5));
}

/**
 * Helper function to normalize rotation angles (in radians)
 */
function normalizeRotation(angle: number, pieceId: string): number {
  const isRadiallySymmetric =
    pieceId.includes("1x1") || pieceId.includes("2x2");

  if (isRadiallySymmetric) {
    return 0;
  }

  const normalized = ((angle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);

  let result =
    (Math.round(normalized / (Math.PI / 2)) * (Math.PI / 2)) % (2 * Math.PI);

  if (
    Math.abs(result - Math.PI) < 0.001 ||
    Math.abs(result) < 0.001 ||
    Math.abs(result - 2 * Math.PI) < 0.001
  ) {
    result = 0;
  } else if (
    Math.abs(result - Math.PI / 2) < 0.001 ||
    Math.abs(result - (3 * Math.PI) / 2) < 0.001
  ) {
    result = Math.PI / 2;
  }

  return Number(result.toFixed(3));
}
