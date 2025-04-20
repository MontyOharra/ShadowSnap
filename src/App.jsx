import React, { useMemo, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Stats } from '@react-three/drei'
import BuildScene from './components/buildScene.jsx'
import * as THREE from 'three'

// Helper function to create different LEGO piece geometries
const createLegoGeometry = (type) => {
  switch(type) {
    case '2x2':
      return new THREE.BoxGeometry(2, 1, 2)
    case '2x4':
      return new THREE.BoxGeometry(2, 1, 4)
    case 'slope':
      const geometry = new THREE.BoxGeometry(2, 1, 2)
      // Create a slope by modifying vertices
      const vertices = geometry.attributes.position.array
      for (let i = 0; i < vertices.length; i += 3) {
        if (vertices[i + 1] > 0) { // Top vertices
          vertices[i + 1] = vertices[i + 1] - (vertices[i] + 1) * 0.5
        }
      }
      geometry.attributes.position.needsUpdate = true
      return geometry
    default:
      return new THREE.BoxGeometry(2, 1, 2)
  }
}

export default function App() {
  const [selectedPiece, setSelectedPiece] = useState(null)
  const [pieces, setPieces] = useState([
    { id: 1, type: '2x2', position: [0, 3.5, 0], rotation: 0 },
    { id: 2, type: '2x4', position: [3, 3.5, 0], rotation: 0 }
  ])

  // Memoize geometries to prevent recreation on every render
  const geometries = useMemo(() => {
    return {
      '2x2': createLegoGeometry('2x2'),
      '2x4': createLegoGeometry('2x4'),
      'slope': createLegoGeometry('slope')
    }
  }, [])

  // Handle keyboard movement
  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if (!selectedPiece) return
      
      setPieces(prev => prev.map(piece => {
        if (piece.id !== selectedPiece) return piece
        
        const newPosition = [...piece.position]
        switch(e.key) {
          case 'ArrowLeft':
            newPosition[0] -= 1
            break
          case 'ArrowRight':
            newPosition[0] += 1
            break
          case 'ArrowUp':
            newPosition[2] -= 1
            break
          case 'ArrowDown':
            newPosition[2] += 1
            break
          case 'r':
            return { ...piece, rotation: (piece.rotation + Math.PI/2) % (Math.PI * 2) }
        }
        return { ...piece, position: newPosition }
      }))
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedPiece])

  const handlePieceClick = (index) => {
    setSelectedPiece(pieces[index].id)
  }

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <div style={{ position: 'absolute', top: 10, left: 10, color: 'white', zIndex: 1 }}>
        <h3>Controls:</h3>
        <p>Click a piece to select it</p>
        <p>Arrow keys to move selected piece</p>
        <p>R to rotate selected piece</p>
        <p>Click empty space to deselect</p>
      </div>

      <Canvas
        camera={{ position: [10, 10, 10], fov: 50 }}
        style={{ background: '#222' }}
        shadows
        gl={{
          antialias: true,
          alpha: true
        }}
      >
        <color attach="background" args={['#222']} />
        
        {/* helpers to confirm we're in the right place */}
        <axesHelper args={[2]} />
        <gridHelper args={[10, 10]} />

        {/* base scene with walls and lighting */}
        <BuildScene 
          pieces={pieces.map(piece => ({
            geometry: geometries[piece.type],
            position: piece.position,
            rotation: [0, piece.rotation, 0],
            isSelected: piece.id === selectedPiece
          }))}
          onPieceClick={handlePieceClick}
        />

        {/* Click handler for deselection */}
        <mesh
          visible={false}
          position={[0, 0, 0]}
          scale={[1000, 1000, 1000]}
          onClick={() => setSelectedPiece(null)}
        >
          <planeGeometry />
          <meshBasicMaterial />
        </mesh>

        {/* orbit controls so you can drag around */}
        <OrbitControls />
        <Stats />
      </Canvas>
    </div>
  )
}
