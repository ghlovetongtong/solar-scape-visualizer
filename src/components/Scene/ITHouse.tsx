
import React, { useRef } from 'react';
import { useGLTF } from '@react-three/drei';
import { ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import { useDraggable } from '@/hooks/useDraggable';

interface ITHouseProps {
  position: [number, number, number];
  isSelected?: boolean;
  onSelect?: () => void;
  onPositionChange?: (position: THREE.Vector3) => void;
  onDragStart?: () => void;
}

export default function ITHouse({
  position,
  isSelected = false,
  onSelect,
  onPositionChange,
  onDragStart
}: ITHouseProps) {
  const groupRef = useRef<THREE.Group>(null);
  
  // Convert position array to Vector3 for proper handling
  const positionVector = new THREE.Vector3(position[0], position[1], position[2]);
  
  const { bind } = useDraggable({
    enabled: isSelected,
    onDragStart,
    onDragEnd: (newPosition) => {
      if (onPositionChange) {
        onPositionChange(newPosition);
      }
    }
  });
  
  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    if (e.nativeEvent) {
      e.nativeEvent.stopPropagation();
    }
    if (onSelect) {
      onSelect();
    }
  };
  
  return (
    <group 
      position={positionVector}
      onClick={handleClick}
      onPointerDown={bind.onPointerDown}
      userData={{ type: 'selectable', category: 'itHouse' }}
      ref={bind.ref}
    >
      <mesh castShadow receiveShadow>
        <boxGeometry args={[5, 3, 4]} />
        <meshStandardMaterial 
          color={isSelected ? '#88ccff' : '#777777'} 
          metalness={0.2} 
          roughness={0.7}
        />
      </mesh>
      
      {/* Roof */}
      <mesh position={[0, 3.5, 0]} castShadow>
        <coneGeometry args={[3.5, 2, 4]} />
        <meshStandardMaterial color={isSelected ? '#aaddff' : '#555555'} />
      </mesh>
      
      {/* Door */}
      <mesh position={[0, 0.5, 2.01]} receiveShadow>
        <planeGeometry args={[1, 2]} />
        <meshStandardMaterial color="#333333" />
      </mesh>
      
      {/* Windows */}
      <mesh position={[-1.5, 1.5, 2.01]} receiveShadow>
        <planeGeometry args={[0.8, 0.8]} />
        <meshStandardMaterial color="#aaccff" />
      </mesh>
      
      <mesh position={[1.5, 1.5, 2.01]} receiveShadow>
        <planeGeometry args={[0.8, 0.8]} />
        <meshStandardMaterial color="#aaccff" />
      </mesh>
      
      {isSelected && (
        <mesh position={[0, 4.5, 0]}>
          <sphereGeometry args={[0.3, 16, 16]} />
          <meshBasicMaterial color="#ffaa00" wireframe />
        </mesh>
      )}
    </group>
  );
}
