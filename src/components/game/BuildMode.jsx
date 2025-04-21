// BuildMode.jsx
import { useRef, useState, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useKeyboardControls } from "@react-three/drei";
import * as THREE from "three";
import { useGame } from "../../stores/useGame";
import * as LegoBrick from "../legoPieces/LegoBrick";
import { LegoBasePlate16x16 } from "../legoPieces/LegoPlate";
import { LegoSlant1 } from "../legoPieces/LegoSlant";
import { PI } from "three/tsl";

export default function BuildMode() {
  const { scene } = useThree();
  const wallsRef = useRef();
  const directionalLightRef = useRef();
  const lightTargetRef = useRef();

  useEffect(() => {
    // Create light target
    const target = new THREE.Object3D();
    target.position.set(25, 0, 25); // Point light towards the right wall
    scene.add(target);
    lightTargetRef.current = target;

    // Create walls
    const wallGeometry = new THREE.BoxGeometry(32, 16, 0.5);
    const wallMaterial = new THREE.MeshStandardMaterial({
      color: "#f8f8f8",
      transparent: false,
      opacity: 0.8,
    });

    // Create walls group
    const walls = new THREE.Group();
    wallsRef.current = walls;

    // Create two walls
    const wallPositions = [
      [-16.25, 8, 0], // back wall
      [0, 8, -16.25], // front wall
    ];

    const wallRotations = [
      [0, Math.PI / 2, 0], // back wall
      [0, 0, 0], // front wall
    ];

    wallPositions.forEach((pos, i) => {
      const wall = new THREE.Mesh(wallGeometry, wallMaterial);
      wall.position.set(...pos);
      wall.rotation.set(...wallRotations[i]);
      wall.receiveShadow = true;
      wall.castShadow = true;
      walls.add(wall);
    });

    scene.add(walls);

    return () => {
      scene.remove(walls);
      scene.remove(target); // Clean up target
      wallGeometry.dispose();
      wallMaterial.dispose();
    };
  }, [scene]);
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
  const changeNewPieceType = useGame((s) => s.changeNewPieceType);

  /* local UI state ---------------------------------------------------- */
  const [currentPieceType, setCurrentPieceType] = useState("brick-1x1x1");

  /* prev‑state ref to catch rising edges ----------------------------- */
  const prev = useRef({});
  const lastMoveTime = useRef(0);
  const MOVE_COOLDOWN = 200; // milliseconds between moves

  // Add baseplate on component mount
  useEffect(() => {
    addBasePlate();
  }, []);

  useFrame(() => {
    const keys = getKeys(); // current pressed map
    const currentTime = Date.now();

    /* helper to run cb on first frame key is down -------------------- */
    const onPress = (name, cb) => {
      if (keys[name] && !prev.current[name]) cb();
    };

    /* helper to run cb with cooldown -------------------------------- */
    const onMove = (name, cb) => {
      if (keys[name] && currentTime - lastMoveTime.current >= MOVE_COOLDOWN) {
        cb();
        lastMoveTime.current = currentTime;
      }
    };

    onMove("left", () => moveSel("left"));
    onMove("right", () => moveSel("right"));
    onMove("up", () => moveSel("up"));
    onMove("down", () => moveSel("down"));
    onPress("rotate", () => rotateSel());

    onPress("toggle1", () => {
      setCurrentPieceType("brick-1x1x1");
      if (stagedPiece) changeNewPieceType("brick-1x1x1");
    });
    onPress("toggle2", () => {
      setCurrentPieceType("brick-2x2x1");
      if (stagedPiece) changeNewPieceType("brick-2x2x1");
    });
    onPress("toggle3", () => {
      setCurrentPieceType("brick-3x3x.5");
      if (stagedPiece) changeNewPieceType("brick-3x3x.5");
    });
    onPress("toggle4", () => {
      setCurrentPieceType("slant-1");
      if (stagedPiece) changeNewPieceType("slant-1");
    });
    onPress("add", () => stageNewPiece(currentPieceType, [0, 0, 0], [0, 0, 0]));
    onPress("place", () => confirmPlace());
    onPress("esc", () => unstagePiece());

    prev.current = keys;
  });

  return (
    <>
      <directionalLight
        ref={directionalLightRef}
        position={[20, 5, 0]} // Positioned to create dramatic shadows from the back-left
        rotation={[0, PI, 0]}
        intensity={1.5}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0001}
        shadow-camera-far={50}
        shadow-camera-left={-25}
        shadow-camera-right={25}
        shadow-camera-top={25}
        shadow-camera-bottom={-25}
      />
      {/* Ambient light for overall scene illumination */}
      <ambientLight intensity={0.15} />
      {directionalLightRef.current && (
        <directionalLightHelper args={[directionalLightRef.current, 5]} />
      )}
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
    </>
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
      return <LegoBasePlate16x16 key={key} {...props} />;
    case "slant-1":
      return <LegoSlant1 key={key} {...props} />;
    default:
      return null;
  }
}
