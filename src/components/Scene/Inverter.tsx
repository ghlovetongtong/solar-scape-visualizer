
import React from 'react';
import * as THREE from 'three';
import { Text } from '@react-three/drei';

interface InverterProps {
  position: THREE.Vector3;
  rotation?: THREE.Euler;
  inverterIndex: number;
  isSelected?: boolean;
  onSelect?: () => void;
}

export default function Inverter({ 
  position, 
  rotation = new THREE.Euler(), 
  inverterIndex, 
  isSelected = false, 
  onSelect 
}: InverterProps) {
  
  const handleClick = (e: THREE.Event) => {
    e.stopPropagation();
    if (onSelect) {
      onSelect();
    }
  };
  
  return (
    <group position={position} rotation={rotation} onClick={handleClick} userData={{ type: 'selectable', componentType: 'inverter' }}>
      {/* Main inverter box */}
      <mesh 
        castShadow 
        receiveShadow
        position={[0, 1, 0]}
        userData={{ type: 'selectable', componentType: 'inverter' }}
      >
        <boxGeometry args={[3.0, 2.2, 1.8]} />
        <meshPhysicalMaterial 
          color={isSelected ? "#38BDF8" : "#2b2d42"} 
          roughness={0.6} 
          metalness={0.4}
          emissive={isSelected ? "#38BDF8" : "#000000"}
          emissiveIntensity={isSelected ? 0.4 : 0}
        />
      </mesh>
      
      {/* Cooling fins */}
      <mesh 
        castShadow 
        position={[0, 1, 0.95]}
        userData={{ type: 'selectable', componentType: 'inverter' }}
      >
        <boxGeometry args={[2.7, 2.0, 0.15]} />
        <meshPhysicalMaterial 
          color={isSelected ? "#60a5fa" : "#4a4e69"} 
          roughness={0.3} 
          metalness={0.7}
        />
      </mesh>
      
      {/* Connection box */}
      <mesh 
        castShadow 
        position={[0, 0, 0]}
        userData={{ type: 'selectable', componentType: 'inverter' }}
      >
        <boxGeometry args={[2.4, 0.6, 1.2]} />
        <meshPhysicalMaterial 
          color={isSelected ? "#3b82f6" : "#222222"} 
          roughness={0.5} 
          metalness={0.5}
        />
      </mesh>
      
      {/* Status indicator light */}
      <mesh
        position={[1.1, 1.6, 0.95]}
        userData={{ type: 'selectable', componentType: 'inverter' }}
      >
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshStandardMaterial 
          color={isSelected ? "#ffffff" : "#00ff00"} 
          emissive={isSelected ? "#ffffff" : "#00ff00"}
          emissiveIntensity={isSelected ? 1.5 : 1.0}
        />
      </mesh>

      {/* Ventilation grille */}
      <mesh
        position={[-1.0, 1.6, 0.95]}
        userData={{ type: 'selectable', componentType: 'inverter' }}
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
        userData={{ type: 'selectable', componentType: 'inverter' }}
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
