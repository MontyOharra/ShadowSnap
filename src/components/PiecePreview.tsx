import { Canvas } from "@react-three/fiber";
import { getLegoPiece } from "./Lego";
import { getPieceFromId } from "@/data/pieceDetails";
import * as THREE from "three";
import { OrbitControls } from "@react-three/drei";

interface PiecePreviewProps {
  pieceId: string;
  color?: string;
  isDisabled?: boolean;
}

export default function PiecePreview({
  pieceId,
  color,
  isDisabled = false,
}: PiecePreviewProps) {
  // Get piece details to calculate dimensions
  const piece = getPieceFromId(pieceId);
  const geometry = piece.geometry();
  const boundingBox = new THREE.Box3();
  geometry.computeBoundingBox();
  boundingBox.copy(geometry.boundingBox!);
  const size = new THREE.Vector3();
  boundingBox.getSize(size);

  // Calculate camera distance based on the largest dimension
  const maxDimension = Math.max(size.x, size.y, size.z);
  const cameraDistance = maxDimension ** 0.9 * 1.7; // Adjust multiplier to get desired zoom level

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        overflow: "hidden",
        pointerEvents: isDisabled ? "none" : "auto",
      }}
    >
      <Canvas
        camera={{
          position: [cameraDistance, cameraDistance + 1, cameraDistance],
          fov: 50,
        }}
        style={{
          background: "transparent",
          margin: 0,
          padding: 0,
          border: "none",
          outline: "none",
        }}
      >
        {/* Main directional light */}
        <directionalLight
          position={[10, 15, 10]}
          intensity={1.2}
          castShadow
          shadow-mapSize={[1024, 1024]}
        />
        {/* Fill light */}
        <directionalLight position={[-10, 10, -10]} intensity={0.5} />
        {/* Rim light */}
        <directionalLight position={[0, 0, -15]} intensity={0.3} />
        {/* Ambient light for overall illumination */}
        <ambientLight intensity={0.3} />
        <OrbitControls target={[0, 1, 0]} enabled={!isDisabled} />
        {getLegoPiece(pieceId, "preview", {
          position: [0, 0, 0],
          rotation: [0, 0, 0],
          color,
        })}
      </Canvas>
    </div>
  );
}
