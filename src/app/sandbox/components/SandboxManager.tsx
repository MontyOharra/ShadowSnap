import { useRef, useEffect, useCallback, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useKeyboardControls } from "@react-three/drei";
import * as THREE from "three";

import { useSandboxMode } from "../../../stores/useSandboxMode";
import { getLegoPiece } from "../../../components/lego/Lego";
import { Direction } from "@/types";
import SceneBuilder from "./SceneBuilder";

interface SandboxManagerProps {
  mousePosition: {
    x: number;
    y: number;
  };
}

export default function SandboxManager({ mousePosition }: SandboxManagerProps) {
  const { camera, size, scene } = useThree();
  const raycaster = useRef(new THREE.Raycaster());
  const mouse = useRef(new THREE.Vector2());
  const intersectionPoint = useRef(new THREE.Vector3());
  const lastMousePosition = useRef({ x: 0, y: 0 });
  const MOUSE_MOVE_THRESHOLD = 2; // pixels of movement before updating
  const [spherePosition, setSpherePosition] = useState<
    [number, number, number]
  >([0, 0, 0]);
  const piecesRef = useRef<THREE.Group>(null);

  // Create a memoized material for the sphere
  const sphereMaterial = useRef(
    new THREE.MeshPhysicalMaterial({
      color: "#0088ff",
      transparent: true,
      opacity: 0.5,
      roughness: 0.1,
      metalness: 0.0,
    })
  );

  /* keyboard --------------------------------------------------------- */
  const [, getKeys] = useKeyboardControls();

  // Game state
  const pieces = useSandboxMode((s) => s.pieces);
  const basePlateRotation = useSandboxMode((s) => s.basePlateRotation);
  const ghostValid = useSandboxMode((s) => s.ghostValid);
  const stagedPiece = useSandboxMode((s) => s.stagedPiece);
  const stagedPieceColor = useSandboxMode((s) => s.stagedPieceColor);

  /* game actions ------------------------------------------------------ */
  const addBasePlate = useSandboxMode((s) => s.addBasePlate);
  const rotateBasePlate = useSandboxMode((s) => s.rotateBasePlate);
  const changeNewPiece = useSandboxMode((s) => s.changeNewPiece);
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

  // Memoized raycast function
  const performRaycast = useCallback(() => {
    // Update mouse position for raycasting
    mouse.current.x = (mousePosition.x / size.width) * 2 - 1;
    mouse.current.y = -(mousePosition.y / size.height) * 2 + 1;

    // Update the raycaster
    raycaster.current.setFromCamera(mouse.current, camera);

    // Find intersections with all pieces
    const intersects = raycaster.current.intersectObjects(scene.children, true);

    if (intersects.length > 0) {
      const firstIntersect = intersects[0];
      setSpherePosition([
        firstIntersect.point.x,
        firstIntersect.point.y,
        firstIntersect.point.z,
      ]);
    }
  }, [camera, mousePosition, size, scene]);

  useEffect(() => {
    addBasePlate();
  }, []);

  useFrame(() => {
    const keys = getKeys(); // current pressed map
    const currentTime = Date.now();

    // Only update raycast if mouse has moved significantly
    const mouseMoved =
      Math.abs(mousePosition.x - lastMousePosition.current.x) >
        MOUSE_MOVE_THRESHOLD ||
      Math.abs(mousePosition.y - lastMousePosition.current.y) >
        MOUSE_MOVE_THRESHOLD;

    if (mouseMoved) {
      performRaycast();
      lastMousePosition.current = { ...mousePosition };
    }

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

    onPress("toggle1", () => changeNewPiece("brick-1x1x1", stagedPieceColor));
    onPress("toggle2", () => changeNewPiece("brick-2x2x1", stagedPieceColor));
    onPress("toggle3", () => changeNewPiece("brick-3x3x.5", stagedPieceColor));
    onPress("toggle4", () => changeNewPiece("slant-1", stagedPieceColor));
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
      <group rotation={basePlateRotation} ref={piecesRef}>
        {/* Render placed pieces */}
        {pieces.map((p) => {
          const props = {
            position: p.pos,
            rotation: p.rot,
            staged: false,
            color: p.isBasePlate ? "#00a651" : p.color,
            onClick: p.isBasePlate
              ? undefined
              : () => stageExistingPiece(p.key),
          };
          return getLegoPiece(p.pieceId, p.key.toString(), props);
        })}

        {stagedPiece && (
          <group>
            {getLegoPiece(stagedPiece.piece.pieceId, "staged", {
              position: stagedPiece.piece.pos,
              rotation: stagedPiece.piece.rot,
              staged: true,
              isValidPosition: ghostValid,
              onClick: undefined,
            })}
          </group>
        )}

        {/* Mouse position indicator sphere */}
        <mesh position={spherePosition} material={sphereMaterial.current}>
          <sphereGeometry args={[0.5, 32, 32]} />
        </mesh>
      </group>
    </>
  );
}
