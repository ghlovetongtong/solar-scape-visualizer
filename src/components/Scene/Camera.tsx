
import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';

interface CameraProps {
  position: THREE.Vector3;
  rotation?: THREE.Euler;
  cameraIndex: number;
  isSelected?: boolean;
  onSelect?: () => void;
}

export default function Camera({ 
  position, 
  rotation = new THREE.Euler(), 
  cameraIndex, 
  isSelected = false, 
  onSelect 
}: CameraProps) {
  const cameraRef = useRef<THREE.Group>(null);
  
  // Rotate camera slightly over time - only if not selected
  useFrame((state) => {
    if (cameraRef.current && !isSelected) {
      // Rotate the camera back and forth
      cameraRef.current.rotation.y = Math.sin(state.clock.getElapsedTime() * 0.1 + cameraIndex) * 0.2;
    }
  });

  const handleClick = (e: any) => {
    e.stopPropagation();
    if (onSelect) {
      onSelect();
    }
  };

  return (
    <group 
      position={position} 
      rotation={rotation} 
      ref={cameraRef}
      onClick={handleClick}
    >
      {/* Camera mount/pole */}
      <mesh castShadow position={[0, -5, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 10, 8]} />
        <meshStandardMaterial 
          color={isSelected ? "#93c5fd" : "#888888"} 
          roughness={0.6}
          emissive={isSelected ? "#93c5fd" : "#000000"}
          emissiveIntensity={isSelected ? 0.3 : 0}
        />
      </mesh>
      
      {/* Camera housing */}
      <group rotation={[0, 0, 0]}>
        {/* Main camera body */}
        <mesh castShadow position={[0, 0, 0.2]}>
          <boxGeometry args={[0.3, 0.3, 0.8]} />
          <meshStandardMaterial 
            color={isSelected ? "#3b82f6" : "#333333"} 
            roughness={0.5} 
            metalness={0.7}
            emissive={isSelected ? "#3b82f6" : "#000000"}
            emissiveIntensity={isSelected ? 0.5 : 0}
          />
        </mesh>
        
        {/* Camera lens */}
        <mesh castShadow position={[0, 0, 0.6]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.12, 0.15, 0.1, 16]} />
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
            color={isSelected ? "#ffffff" : "#ff0000"} 
            emissive={isSelected ? "#ffffff" : "#ff0000"} 
            emissiveIntensity={isSelected ? 3 : 2} 
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
