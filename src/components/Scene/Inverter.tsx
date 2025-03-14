
import React from 'react';
import * as THREE from 'three';
import { Text } from '@react-three/drei';
import { useDraggable } from '@/hooks/useDraggable';

interface InverterProps {
  position: THREE.Vector3;
  rotation?: THREE.Euler;
  inverterIndex?: number;
  isSelected?: boolean;
  onSelect?: () => void;
  onPositionChange?: (position: THREE.Vector3) => void;
  onRotationChange?: (rotation: THREE.Euler) => void;
}

export default function Inverter({ 
  position, 
  rotation = new THREE.Euler(), 
  inverterIndex = 0, 
  isSelected = false, 
  onSelect,
  onPositionChange,
  onRotationChange
}: InverterProps) {
  
  const { groupRef, handlePointerDown, isDragging } = useDraggable(position, {
    enabled: isSelected,
    onDragEnd: (newPosition) => {
      if (onPositionChange) {
        onPositionChange(newPosition);
      }
    }
  });
  
  const handleClick = (e: THREE.Event) => {
    e.stopPropagation();
    if (onSelect) {
      onSelect();
    }
  };
  
  return (
    <group 
      ref={groupRef}
      rotation={rotation} 
      onClick={handleClick}
      onPointerDown={handlePointerDown}
      userData={{ type: 'selectable', componentType: 'inverter', draggable: true }}
    >
      {/* Main inverter box */}
      <mesh 
        castShadow 
        receiveShadow
        position={[0, 1, 0]}
      >
        <boxGeometry args={[3.0, 2.2, 1.8]} />
        <meshPhysicalMaterial 
          color={isDragging ? "#60cdff" : isSelected ? "#38BDF8" : "#2b2d42"} 
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
      >
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshStandardMaterial 
          color={isDragging ? "#ffffff" : isSelected ? "#ffffff" : "#00ff00"} 
          emissive={isDragging ? "#ffffff" : isSelected ? "#ffffff" : "#00ff00"}
          emissiveIntensity={isDragging ? 2.0 : isSelected ? 1.5 : 1.0}
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
