// BuildMode.jsx
import { useRef, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { useKeyboardControls } from "@react-three/drei";
import { useGame } from "../../stores/useGame";
import * as LegoBrick from "../legoPieces/LegoBrick";
import { LegoBasePlate16x16 } from "../legoPieces/LegoPlate";

export default function BuildMode() {
  /* keyboard --------------------------------------------------------- */
  const [, getKeys] = useKeyboardControls();

  /* game actions ------------------------------------------------------ */
  const moveSel = useGame((s) => s.moveSel);
  const rotateSel = useGame((s) => s.rotateSel);
  const stageNewPiece = useGame((s) => s.stageNewPiece);
  const stageExistingPiece = useGame((s) => s.stageExistingPiece);
  const unstagePiece = useGame((s) => s.unstagePiece);
  const pieces = useGame((s) => s.pieces);
  const stagedPiece = useGame((s) => s.stagedPiece);
  const confirmPlace = useGame((s) => s.confirmPlace);
  const ghostValid = useGame((s) => s.ghostValid);
  const addBasePlate = useGame((s) => s.addBasePlate);

  /* local UI state ---------------------------------------------------- */
  const [currentPieceType, setCurrentPieceType] = useState("brick-1x1x1");

  /* prev‑state ref to catch rising edges ----------------------------- */
  const prev = useRef({});

  // Add baseplate on component mount
  useEffect(() => {
    addBasePlate();
  }, []);

  useFrame(() => {
    const keys = getKeys(); // current pressed map

    /* helper to run cb on first frame key is down -------------------- */
    const onPress = (name, cb) => {
      if (keys[name] && !prev.current[name]) cb();
    };

    onPress("left", () => moveSel("left"));
    onPress("right", () => moveSel("right"));
    onPress("up", () => moveSel("up"));
    onPress("down", () => moveSel("down"));
    onPress("rotate", () => rotateSel());

    onPress("toggle1", () => setCurrentPieceType("brick-1x1x1"));
    onPress("toggle2", () => setCurrentPieceType("brick-2x2x1"));
    onPress("toggle3", () => setCurrentPieceType("brick-3x3x.5"));
    onPress("add", () => stageNewPiece(currentPieceType, [0, 0, 0], [0, 0, 0]));
    onPress("place", () => confirmPlace());
    onPress("esc", () => unstagePiece());

    prev.current = keys;
  });

  return (
    <group>
      {/* Render placed pieces */}
      
      {pieces.map((p) => {
        const props = {
          position: p.pos,
          rotation: p.rot,
          selected: false,
          color: "#ffffff",
          onClick: p.isBasePlate ? undefined : () => stageExistingPiece(p.id),
        };
        return getBrick(p.type, p.id, props);
      })}

      {/* Render staged piece if it exists */}
      {stagedPiece && (
        <group>
          {getBrick(stagedPiece.piece.type, "staged", {
            position: stagedPiece.piece.pos,
            rotation: stagedPiece.piece.rot,
            selected: true,
            color: ghostValid ? "#0080ff" : "#ff4040",
            onClick: undefined,
          })}
        </group>
      )}
    </group>
  );
}

/* helper to return the right brick component ------------------------- */
function getBrick(type, key, props) {
  switch (type) {
    case "brick-1x1x1":
      return <LegoBrick.LegoBrick1x1x1 key={key} {...props} />;
    case "brick-2x2x1":
      return <LegoBrick.LegoBrick2x2x1 key={key} {...props} />;
    case "brick-3x3x.5":
      return <LegoBrick.LegoBrick3x3xmed key={key} {...props} />;
    case "base-plate-16x16":
      return <LegoBasePlate16x16 key={"base"} {...props} />;
    default:
      return null;
  }
}
