// BuildMode.jsx
import { useRef, useState, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useKeyboardControls } from "@react-three/drei";
import * as THREE from "three";
import { useGame } from "../../stores/useGame";
import * as LegoBrick from "../legoPieces/LegoBrick";
import { LegoBasePlate16x16 } from "../legoPieces/LegoPlate";

export default function BuildMode() {
  const { scene } = useThree();
  const wallsRef = useRef();
  const directionalLightRef = useRef();
  const directionalLightRef2 = useRef();
  const lightTargetRef = useRef();
  const lightTargetRef2 = useRef();

  useEffect(() => {
    // Create light targets
    const target = new THREE.Object3D();
    target.position.set(0, 8, -16.25); // Point at front wall's center
    scene.add(target);
    lightTargetRef.current = target;

    const target2 = new THREE.Object3D();
    target2.position.set(-16.25, 8, 0); // Point at back wall's center
    scene.add(target2);
    lightTargetRef2.current = target2;

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
      scene.remove(target);
      scene.remove(target2);
      wallGeometry.dispose();
      wallMaterial.dispose();
    };
  }, [scene]);
  /* keyboard --------------------------------------------------------- */
  const [, getKeys] = useKeyboardControls();

  /* game actions ------------------------------------------------------ */
  const moveSel = useGame((s) => s.moveSel);
  const rotateSel = useGame((s) => s.rotateSel);
  const rotateBaseplate = useGame((s) => s.rotateBaseplate);
  const stageNewPiece = useGame((s) => s.stageNewPiece);
  const stageExistingPiece = useGame((s) => s.stageExistingPiece);
  const unstagePiece = useGame((s) => s.unstagePiece);
  const pieces = useGame((s) => s.pieces);
  const stagedPiece = useGame((s) => s.stagedPiece);
  const confirmPlace = useGame((s) => s.confirmPlace);
  const ghostValid = useGame((s) => s.ghostValid);
  const addBasePlate = useGame((s) => s.addBasePlate);
  const groupRotation = useGame((s) => s.groupRotation);

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
    onPress("toggle1", () => setCurrentPieceType("brick-1x1x1"));
    onPress("toggle2", () => setCurrentPieceType("brick-2x2x1"));
    onPress("toggle3", () => setCurrentPieceType("brick-3x3x.5"));
    onPress("add", () => stageNewPiece(currentPieceType, [0, 0, 0], [0, 0, 0]));
    onPress("place", () => confirmPlace());
    onPress("esc", () => unstagePiece());
    onPress("rotateBaseplate", () => rotateBaseplate());

    prev.current = keys;
  });

  return (
    <>
      <directionalLight
        ref={directionalLightRef}
        position={[0, 8, 20]} // Position light in front of the wall
        intensity={1.5}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0001}
        shadow-camera-far={50}
        shadow-camera-left={-25}
        shadow-camera-right={25}
        shadow-camera-top={25}
        shadow-camera-bottom={-25}
        target={lightTargetRef.current}
      />
      <directionalLight
        ref={directionalLightRef2}
        position={[20, 8, 0]} // Light position for back wall
        intensity={1.5}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0001}
        shadow-camera-far={50}
        shadow-camera-left={-25}
        shadow-camera-right={25}
        shadow-camera-top={25}
        shadow-camera-bottom={-25}
        target={lightTargetRef2.current}
      />
      {/* Ambient light for overall scene illumination */}
      <ambientLight intensity={0.15} />
      <group>
        {/* Render placed pieces */}
        <group rotation={groupRotation}>
          {pieces.map((p) => {
            const props = {
              position: p.pos,
              rotation: p.rot,
              selected: stagedPiece?.piece.id === p.id,
              color: p.isBasePlate ? "#00a651" : // Classic LEGO green for baseplate
                     p.type === "brick-1x1x1" ? "#0055bf" : // Classic LEGO blue
                     p.type === "brick-2x2x1" ? "#c91a09" : // Classic LEGO red
                     "#ffd700", // Classic LEGO yellow
              onClick: p.isBasePlate ? undefined : () => stageExistingPiece(p.id),
            };
            return getBrick(p.type, p.id, props);
          })}
        </group>

        {/* Render staged piece if it exists */}
        {stagedPiece && (
          <group rotation={groupRotation}>
            {getBrick(stagedPiece.piece.type, "staged", {
              position: stagedPiece.piece.pos,
              rotation: stagedPiece.piece.rot,
              selected: true,
              color: ghostValid ? "#0080ff" : "#ff4040",
              onClick: undefined
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
      return <LegoBasePlate16x16 key={"base"} {...props} />;
    default:
      return null;
  }
}
