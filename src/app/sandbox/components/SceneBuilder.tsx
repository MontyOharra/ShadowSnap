import { useRef, useEffect } from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";

export default function SceneBuilder() {
  const { scene } = useThree();
  const wallsRef = useRef<THREE.Group | null>(null);
  const directionalLightRef = useRef<THREE.DirectionalLight | null>(null);
  const directionalLightRef2 = useRef<THREE.DirectionalLight | null>(null);
  const lightTargetRef = useRef<THREE.Object3D | null>(null);
  const lightTargetRef2 = useRef<THREE.Object3D | null>(null);

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
      wall.position.set(pos[0], pos[1], pos[2]);
      wall.rotation.set(
        wallRotations[i][0],
        wallRotations[i][1],
        wallRotations[i][2]
      );
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

  return (
    <>
      <directionalLight
        ref={directionalLightRef}
        position={[0, 8, 20]} // Position light in front of the wall
        intensity={2}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0001}
        shadow-camera-far={50}
        shadow-camera-left={-25}
        shadow-camera-right={25}
        shadow-camera-top={25}
        shadow-camera-bottom={-25}
        target={lightTargetRef.current || undefined}
      />
      <directionalLight
        ref={directionalLightRef2}
        position={[20, 8, 0]} // Light position for back wall
        intensity={2}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0001}
        shadow-camera-far={50}
        shadow-camera-left={-25}
        shadow-camera-right={25}
        shadow-camera-top={25}
        shadow-camera-bottom={-25}
        target={lightTargetRef2.current || undefined}
      />
      {/* Ambient light for overall scene illumination */}
      <ambientLight intensity={0.6} />
      <pointLight
        position={[10, 25, 10]}
        intensity={3}
      />
      <directionalLight position={[-10, 15, -10]} intensity={0.6} />
    </>
  );
}
