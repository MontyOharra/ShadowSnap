import React from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Stats } from '@react-three/drei'

export default function App() {
  const [blueBoxPosition, setBlueBoxPosition] = React.useState([0, 0, 0])
  React.useEffect(() => {
    console.log('Blue box at:', blueBoxPosition)
  }, [blueBoxPosition])
  
  function handleClick() { 
    setBlueBoxPosition(prevPos => [prevPos[0] + 1, prevPos[1], prevPos[2]])
  }

  return (
    <>
    <button
      onClick={handleClick}
    >click me</button>
    <Canvas
      // make sure we have a camera that looks at the origin
      camera={{ position: [3, 3, 3], fov: 60 }}
      style={{ background: '#222' }}
    >
      {/* helpers to confirm we're in the right place */}
      <axesHelper args={[2]} />
      <gridHelper args={[10, 10]} />

      {/* lights */}
      <ambientLight intensity={0.3} />
      <directionalLight position={[5, 5, 5]} intensity={1} />

      {/* a simple red box at the origin */}
      <mesh>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="orangered" />
      </mesh>
      <mesh position={blueBoxPosition} >
        <boxGeometry args={[0.5, 0.5, 0.5]}/>
        <meshStandardMaterial color="blue" />
      </mesh>

      {/* orbit controls so you can drag around */}
      <OrbitControls />
    </Canvas>
    </>
  )
}
