import { useThree } from "@react-three/fiber";
import { PerspectiveCamera } from "@react-three/drei";
function SceneCamera() {
  const { set } = useThree();
  return (
    <PerspectiveCamera
      makeDefault
      position={[15, 13, 20]}
      fov={50}
      near={0.1}
      far={1000}
      onUpdate={(self) => set({ camera: self })}
    />
  );
}

export default SceneCamera;