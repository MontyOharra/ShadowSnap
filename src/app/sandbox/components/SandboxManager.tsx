import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { useKeyboardControls } from "@react-three/drei";

import { useSandboxMode } from "../../../stores/useSandboxMode";
import { getLegoPiece } from "../../../components/Lego";
import { Direction } from "@/types";
import SceneBuilder from "./SceneBuilder";

export default function SandboxManager() {
  /* keyboard --------------------------------------------------------- */
  const [, getKeys] = useKeyboardControls();

  // Game state
  const pieces = useSandboxMode((s) => s.pieces);
  const basePiece = useSandboxMode((s) => s.basePiece); 
  const basePieceRotation = useSandboxMode((s) => s.basePieceRotation);
  const stagedPiece = useSandboxMode((s) => s.stagedPiece);
  const stagedPieceColor = useSandboxMode((s) => s.stagedPieceColor);

  /* game actions ------------------------------------------------------ */
  const setBasePiece = useSandboxMode((s) => s.setBasePiece);
  const rotateBasePiece = useSandboxMode((s) => s.rotateBasePiece);
  const stageNewPiece = useSandboxMode((s) => s.stageNewPiece);
  const stageExistingPiece = useSandboxMode((s) => s.stageExistingPiece);
  const unstagePiece = useSandboxMode((s) => s.unstagePiece);
  const moveStagedPiece = useSandboxMode((s) => s.moveStagedPiece);
  const rotateStagedPiece = useSandboxMode((s) => s.rotateStagedPiece);
  const confirmPlace = useSandboxMode((s) => s.confirmPlace);

  /* prev‑state ref to catch rising edges ----------------------------- */
  const prev = useRef<Record<string, boolean>>({});
  const lastMoveTime = useRef(0);
  const MOVE_COOLDOWN = 200; // milliseconds between moves

  useEffect(() => {
    setBasePiece("base-plate-16x16", "#00a651");
  }, []);

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

    onPress("add", () => stageNewPiece([0, 0]));
    onPress("place", () => confirmPlace(stagedPieceColor));
    onPress("esc", () => unstagePiece());   
    onPress("rotateBaseplate", () => rotateBasePiece(1));
    onPress("q", () => rotateStagedPiece("left"));
    onPress("e", () => rotateStagedPiece("right"));

    prev.current = keys;
  });

  return (
    <>
      <SceneBuilder />
      <group rotation={basePieceRotation}>
        {/* Render base plate */}
        {basePiece && getLegoPiece(basePiece.pieceId, "base", {
          position: basePiece.pos,
          rotation: basePiece.rot,
          color: basePiece.color,
        })}

        {/* Render placed pieces */}
        {pieces.map((p) => {
          const isBasePlate = p.pieceId === "base-plate-16x16";
          const props = {
            position: p.pos,
            rotation: p.rot,
            staged: false,
            color: isBasePlate ? "#00a651" : p.color,
            onClick: isBasePlate
              ? undefined
              : () => stageExistingPiece(p.key),
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
    </>
  );
}
