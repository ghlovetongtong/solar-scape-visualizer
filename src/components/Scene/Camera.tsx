
import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';

interface CameraProps {
  position: THREE.Vector3;
  cameraIndex: number;
}

export default function Camera({ position, cameraIndex }: CameraProps) {
  const cameraRef = useRef<THREE.Group>(null);
  
  // Rotate camera slightly over time
  useFrame((state) => {
    if (cameraRef.current) {
      // Rotate the camera back and forth
      cameraRef.current.rotation.y = Math.sin(state.clock.getElapsedTime() * 0.1 + cameraIndex) * 0.2;
    }
  });

  return (
    <group position={position} ref={cameraRef}>
      {/* Camera mount/pole */}
      <mesh castShadow position={[0, -5, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 10, 8]} />
        <meshStandardMaterial color="#888888" roughness={0.6} />
      </mesh>
      
      {/* Camera housing */}
      <group rotation={[0, 0, 0]}>
        {/* Main camera body */}
        <mesh castShadow position={[0, 0, 0.2]}>
          <boxGeometry args={[0.3, 0.3, 0.8]} />
          <meshStandardMaterial color="#333333" roughness={0.5} metalness={0.7} />
        </mesh>
        
        {/* Camera lens */}
        <mesh castShadow position={[0, 0, 0.6]}>
          <cylinderGeometry args={[0.12, 0.15, 0.1, 16]} rotation={[Math.PI / 2, 0, 0]} />
          <meshPhysicalMaterial 
            color="#111111" 
            roughness={0.1} 
            clearcoat={1} 
            clearcoatRoughness={0.1}
          />
        </mesh>
        
        {/* Indicator light */}
        <mesh position={[0, 0.12, 0.2]}>
          <sphereGeometry args={[0.03, 8, 8]} />
          <meshStandardMaterial 
            color="#ff0000" 
            emissive="#ff0000" 
            emissiveIntensity={2} 
          />
        </mesh>
      </group>
      
      {/* Camera label */}
      <Text
        position={[0, 0.5, 0]}
        rotation={[0, 0, 0]}
        fontSize={0.2}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="#000000"
      >
        {`Camera ${cameraIndex + 1}`}
      </Text>
    </group>
  );
}
