
import React from 'react';
import * as THREE from 'three';
import { Text } from '@react-three/drei';
import { useDraggable } from '@/hooks/useDraggable';
import { ThreeEvent } from '@react-three/fiber';

interface ITHouseProps {
  position: THREE.Vector3;
  isSelected?: boolean;
  onSelect?: () => void;
  onPositionChange?: (position: THREE.Vector3) => void;
}

export default function ITHouse({ 
  position, 
  isSelected = false,
  onSelect,
  onPositionChange
}: ITHouseProps) {
  const { groupRef, handlePointerDown, handlePointerMove, handlePointerUp, isDragging } = useDraggable(position, {
    enabled: isSelected,
    onDragEnd: (newPosition) => {
      if (onPositionChange) {
        onPositionChange(newPosition);
      }
    }
  });

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    if (onSelect) {
      onSelect();
    }
  };

  return (
    <group 
      ref={groupRef}
      onClick={handleClick}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      userData={{ type: 'selectable', componentType: 'itHouse', draggable: true }}
    >
      {/* Main building */}
      <mesh 
        castShadow 
        receiveShadow 
        position={[0, 2, 0]}
      >
        <boxGeometry args={[10, 4, 6]} />
        <meshStandardMaterial 
          color={isDragging ? "#f8f8ff" : isSelected ? "#f8f8ff" : "#f1f1f1"} 
          roughness={0.7}
          emissive={isSelected ? "#e2e8f0" : "#000000"}
          emissiveIntensity={isSelected ? 0.2 : 0}
        />
      </mesh>
      
      {/* Roof */}
      <mesh 
        castShadow 
        position={[0, 4.5, 0]}
      >
        <boxGeometry args={[11, 1, 7]} />
        <meshStandardMaterial 
          color={isSelected ? "#6b7280" : "#555555"} 
          roughness={0.6} 
        />
      </mesh>
      
      {/* Door */}
      <mesh 
        position={[0, 1.2, 3.01]}
      >
        <planeGeometry args={[1.2, 2.4]} />
        <meshStandardMaterial 
          color={isSelected ? "#4b5563" : "#333333"} 
          roughness={0.5} 
          metalness={0.3} 
        />
      </mesh>
      
      {/* Windows */}
      <mesh 
        position={[-3, 2.5, 3.01]}
      >
        <planeGeometry args={[1.5, 1.5]} />
        <meshPhysicalMaterial 
          color={isSelected ? "#93c5fd" : "#88a8df"} 
          roughness={0.1} 
          metalness={0.2} 
          transmission={0.9}
          thickness={0.5}
        />
      </mesh>
      
      <mesh 
        position={[3, 2.5, 3.01]}
      >
        <planeGeometry args={[1.5, 1.5]} />
        <meshPhysicalMaterial 
          color={isSelected ? "#93c5fd" : "#88a8df"} 
          roughness={0.1} 
          metalness={0.2} 
          transmission={0.9}
          thickness={0.5}
        />
      </mesh>
      
      {/* AC unit */}
      <mesh 
        castShadow 
        position={[5.5, 2, 0]}
      >
        <boxGeometry args={[1, 1, 2]} />
        <meshStandardMaterial 
          color={isSelected ? "#9ca3af" : "#888888"} 
          roughness={0.5} 
        />
      </mesh>
      
      {/* Antenna */}
      <mesh 
        position={[4, 5.5, 2]}
      >
        <cylinderGeometry args={[0.05, 0.05, 2, 8]} />
        <meshStandardMaterial color="#333333" roughness={0.5} />
      </mesh>
      
      {/* Antenna dish */}
      <mesh 
        position={[4, 6.5, 2]}
        rotation={[0, 0, Math.PI / 2]}
      >
        <sphereGeometry args={[0.4, 16, 16, 0, Math.PI]} />
        <meshStandardMaterial 
          color={isSelected ? "#f1f5f9" : "#dddddd"} 
          roughness={0.4} 
        />
      </mesh>
      
      {/* Building Label */}
      <Text
        position={[0, 5, 3.5]}
        rotation={[0, 0, 0]}
        fontSize={0.5}
        color="#333333"
        anchorX="center"
        anchorY="middle"
      >
        IT House
      </Text>
    </group>
  );
}
