import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { useKeyboardControls } from "@react-three/drei";

import { useSandboxMode } from "../../../stores/useSandboxMode";
import { getLegoPiece, getLegoBasePlate } from "../../../components/Lego";
import { Direction } from "@/types";
import SceneBuilder from "./SceneBuilder";

export default function SandboxManager() {
  /* keyboard --------------------------------------------------------- */
  const [, getKeys] = useKeyboardControls();

  // Game state
  const pieces = useSandboxMode((s) => s.pieces);
  const basePlate = useSandboxMode((s) => s.basePlate);
  const basePlateRotation = useSandboxMode((s) => s.basePlateRotation);
  const stagedPiece = useSandboxMode((s) => s.stagedPiece);
  const stagedPieceColor = useSandboxMode((s) => s.stagedPieceColor);

  /* game actions ------------------------------------------------------ */
  const setBasePlate = useSandboxMode((s) => s.setBasePlate);
  const rotateBasePlate = useSandboxMode((s) => s.rotateBasePlate);
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
    setBasePlate("base-plate-8x3", "#00a651");
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
    onPress("rotateBaseplate", () => rotateBasePlate(1));
    onPress("q", () => rotateStagedPiece("left"));
    onPress("e", () => rotateStagedPiece("right"));

    prev.current = keys;
  });

  return (
    <>
      <SceneBuilder />
      <group rotation={basePlateRotation}>
        {/* Render base plate */}
        {basePlate &&
          getLegoBasePlate(basePlate.pieceId, basePlate.key, {
            position: basePlate.pos,
            rotation: basePlate.rot,
            color: basePlate.color,
          })}

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
    </>
  );
}
