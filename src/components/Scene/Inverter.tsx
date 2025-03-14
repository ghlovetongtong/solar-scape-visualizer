
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
        <boxGeometry args={[3.0, 2.2, 1.8]} />
        <meshPhysicalMaterial 
          color="#2b2d42" 
          roughness={0.6} 
          metalness={0.4}
        />
      </mesh>
      
      {/* Cooling fins */}
      <mesh 
        castShadow 
        position={[0, 1, 0.95]}
      >
        <boxGeometry args={[2.7, 2.0, 0.15]} />
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
        <boxGeometry args={[2.4, 0.6, 1.2]} />
        <meshPhysicalMaterial 
          color="#222222" 
          roughness={0.5} 
          metalness={0.5}
        />
      </mesh>
      
      {/* Status indicator light */}
      <mesh
        position={[1.1, 1.6, 0.95]}
      >
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshStandardMaterial 
          color="#00ff00" 
          emissive="#00ff00"
          emissiveIntensity={1.0}
        />
      </mesh>

      {/* Ventilation grille */}
      <mesh
        position={[-1.0, 1.6, 0.95]}
      >
        <boxGeometry args={[1.0, 1.0, 0.08]} />
        <meshStandardMaterial 
          color="#333333"
          roughness={0.2}
        />
      </mesh>

      {/* Cables */}
      <mesh
        position={[0, 0.3, 0.9]}
      >
        <cylinderGeometry args={[0.15, 0.15, 1.8, 8]} />
        <meshStandardMaterial color="#111111" />
      </mesh>

      {/* Inverter label */}
      <Text
        position={[0, 2.7, 0]}
        rotation={[0, 0, 0]}
        fontSize={0.5}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.06}
        outlineColor="#000000"
      >
        {`Inverter ${inverterIndex + 1}`}
      </Text>
    </group>
  );
}
