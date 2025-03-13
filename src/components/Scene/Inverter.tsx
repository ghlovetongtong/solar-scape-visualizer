
import React from 'react';
import * as THREE from 'three';
import { useGLTF } from '@react-three/drei';
import { Text } from '@react-three/drei';

interface InverterProps {
  position: THREE.Vector3;
  inverterIndex: number;
}

export default function Inverter({ position, inverterIndex }: InverterProps) {
  // Create a simple geometry for the inverter
  return (
    <group position={position}>
      {/* Main inverter box */}
      <mesh 
        castShadow 
        receiveShadow
        position={[0, 1, 0]}
      >
        <boxGeometry args={[2, 2, 0.8]} />
        <meshPhysicalMaterial 
          color="#403e43" 
          roughness={0.6} 
          metalness={0.4}
        />
      </mesh>
      
      {/* Cooling fins */}
      <mesh 
        castShadow 
        position={[0, 1, 0.45]}
      >
        <boxGeometry args={[1.8, 1.8, 0.1]} />
        <meshPhysicalMaterial 
          color="#333333" 
          roughness={0.3} 
          metalness={0.7}
        />
      </mesh>
      
      {/* Connection box */}
      <mesh 
        castShadow 
        position={[0, 0, 0]}
      >
        <boxGeometry args={[1.5, 0.5, 0.6]} />
        <meshPhysicalMaterial 
          color="#222222" 
          roughness={0.5} 
          metalness={0.5}
        />
      </mesh>
      
      {/* Status indicator light */}
      <mesh
        position={[0.7, 1.5, 0.45]}
      >
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial 
          color="#00ff00" 
          emissive="#00ff00"
          emissiveIntensity={0.5}
        />
      </mesh>

      {/* Inverter label */}
      <Text
        position={[0, 2.2, 0]}
        rotation={[0, 0, 0]}
        fontSize={0.3}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="#000000"
      >
        {`Inverter ${inverterIndex + 1}`}
      </Text>
    </group>
  );
}
