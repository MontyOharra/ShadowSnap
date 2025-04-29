import { useRef, useEffect, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { useKeyboardControls } from "@react-three/drei";

import { useBuildManager } from "../stores/useBuildManager";
import { getLegoPiece } from "./Lego";
import { Direction } from "@/types";
import { loadLevelData, transformLevelData } from "@/utils/dataUtils";
import { useBasePlateStore } from "@/stores/useBasePlateStore";

interface UserBuildRendererProps {
  levelFile?: File;
}

export default function UserBuildRenderer({
  levelFile,
}: UserBuildRendererProps) {
  const [isLevelLoaded, setIsLevelLoaded] = useState(false);

  /* keyboard --------------------------------------------------------- */
  const [, getKeys] = useKeyboardControls();

  // Game state
  const pieces = useBuildManager((s) => s.pieces);
  const basePlateRotation = useBasePlateStore((s) => s.rotation);
  const stagedPiece = useBuildManager((s) => s.stagedPiece);

  /* game actions ------------------------------------------------------ */
  const stageNewPiece = useBuildManager((s) => s.stageNewPiece);
  const stageExistingPiece = useBuildManager((s) => s.stageExistingPiece);
  const unstagePiece = useBuildManager((s) => s.unstagePiece);
  const moveStagedPiece = useBuildManager((s) => s.moveStagedPiece);
  const rotateStagedPiece = useBuildManager((s) => s.rotateStagedPiece);
  const confirmPlace = useBuildManager((s) => s.confirmPlace);
  const removePiece = useBuildManager((s) => s.removePiece);
  const importLevel = useBuildManager((s) => s.import);

  /* prev‑state ref to catch rising edges ----------------------------- */
  const prev = useRef<Record<string, boolean>>({});
  const lastMoveTime = useRef(0);
  const MOVE_COOLDOWN = 200; // milliseconds between moves

  useEffect(() => {
    if (!isLevelLoaded) {
      const loadLevel = async () => {
        try {
          let levelData;
          if (levelFile) {
            levelData = await loadLevelData(levelFile);
            const transformedData = transformLevelData(levelData);
            importLevel(transformedData);
            setIsLevelLoaded(true);
          }
        } catch (error) {
          console.error("Failed to load level:", error);
          // Handle error appropriately (e.g., show error message to user)
        }
      };
      loadLevel();
    }
  }, [isLevelLoaded, levelFile, importLevel]);

  useFrame(() => {
    const keys = getKeys(); // current pressed map
    const currentTime = Date.now();

    /* helper to run cb on first frame key is down -------------------- */
    function onPress(name: string, cb: () => void) {
      if (keys[name] && !prev.current[name]) cb();
    }

    /* helper to run cb with cooldown -------------------------------- */
    function onMove(name: Direction, cb: () => void) {
      if (keys[name] && currentTime - lastMoveTime.current >= MOVE_COOLDOWN) {
        cb();
        lastMoveTime.current = currentTime;
      }
    }

    onMove("left", () => moveStagedPiece("left"));
    onMove("right", () => moveStagedPiece("right"));
    onMove("up", () => moveStagedPiece("up"));
    onMove("down", () => moveStagedPiece("down"));

    onPress("add", () => stageNewPiece([0, 0])); // Space bar to select a new piece
    onPress("place", () => confirmPlace()); // P to place the piece
    onPress("esc", () => unstagePiece());
    onPress("q", () => rotateStagedPiece("left"));
    onPress("e", () => rotateStagedPiece("right"));
    onPress("delete", () => removePiece());

    prev.current = keys;
  });

  return (
    <group rotation={basePlateRotation}>
      {/* Render base plate */}

      {/* Render placed pieces */}
      {pieces.map((p) => {
        const props = {
          position: p.pos,
          rotation: p.rot,
          staged: false,
          color: p.color,
          onClick: () => stageExistingPiece(parseInt(p.key)),
        };
        return getLegoPiece(p.pieceId, p.key.toString(), props);
      })}

      {stagedPiece && (
        <group>
          {getLegoPiece(stagedPiece.pieceId, "staged", {
            position: stagedPiece.pos,
            rotation: stagedPiece.rot,
            staged: true,
            isValidPosition: stagedPiece.isValidPosition,
            onClick: undefined,
          })}
        </group>
      )}
    </group>
  );
}
