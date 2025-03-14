
import React from 'react';
import * as THREE from 'three';
import { Text } from '@react-three/drei';

interface InverterProps {
  position: THREE.Vector3;
  inverterIndex: number;
}

export default function Inverter({ position, inverterIndex }: InverterProps) {
  return (
    <group position={position}>
      {/* Main inverter box */}
      <mesh 
        castShadow 
        receiveShadow
        position={[0, 1, 0]}
      >
        <boxGeometry args={[2.5, 2, 1.5]} />
        <meshPhysicalMaterial 
          color="#2b2d42" 
          roughness={0.6} 
          metalness={0.4}
        />
      </mesh>
      
      {/* Cooling fins */}
      <mesh 
        castShadow 
        position={[0, 1, 0.8]}
      >
        <boxGeometry args={[2.2, 1.8, 0.1]} />
        <meshPhysicalMaterial 
          color="#4a4e69" 
          roughness={0.3} 
          metalness={0.7}
        />
      </mesh>
      
      {/* Connection box */}
      <mesh 
        castShadow 
        position={[0, 0, 0]}
      >
        <boxGeometry args={[2, 0.5, 1]} />
        <meshPhysicalMaterial 
          color="#222222" 
          roughness={0.5} 
          metalness={0.5}
        />
      </mesh>
      
      {/* Status indicator light */}
      <mesh
        position={[0.9, 1.5, 0.8]}
      >
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial 
          color="#00ff00" 
          emissive="#00ff00"
          emissiveIntensity={0.8}
        />
      </mesh>

      {/* Ventilation grille */}
      <mesh
        position={[-0.9, 1.5, 0.8]}
      >
        <boxGeometry args={[0.8, 0.8, 0.05]} />
        <meshStandardMaterial 
          color="#333333"
          roughness={0.2}
        />
      </mesh>

      {/* Cables */}
      <mesh
        position={[0, 0.3, 0.8]}
      >
        <cylinderGeometry args={[0.1, 0.1, 1.5, 8]} />
        <meshStandardMaterial color="#111111" />
      </mesh>

      {/* Inverter label */}
      <Text
        position={[0, 2.5, 0]}
        rotation={[0, 0, 0]}
        fontSize={0.4}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.04}
        outlineColor="#000000"
      >
        {`Inverter ${inverterIndex + 1}`}
      </Text>
    </group>
  );
}
