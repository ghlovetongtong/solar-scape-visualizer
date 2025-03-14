
import React, { useRef } from 'react';
import { useGLTF } from '@react-three/drei';
import { ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import { useDraggable } from '@/hooks/useDraggable';

interface TransformerStationProps {
  id: number;
  position: [number, number, number];
  rotation: [number, number, number];
  isSelected?: boolean;
  onSelect?: (id: number) => void;
  onPositionChange?: (id: number, position: THREE.Vector3) => void;
  onDragStart?: () => void;
}

export default function TransformerStation({
  id,
  position,
  rotation,
  isSelected = false,
  onSelect,
  onPositionChange,
  onDragStart
}: TransformerStationProps) {
  const groupRef = useRef<THREE.Group>(null);
  
  // Convert position array to Vector3 for proper handling
  const positionVector = new THREE.Vector3(position[0], position[1], position[2]);
  const eulerRotation = new THREE.Euler(rotation[0], rotation[1], rotation[2]);
  
  const { bind } = useDraggable({
    enabled: isSelected,
    onDragStart,
    onDragEnd: (newPosition) => {
      if (onPositionChange) {
        onPositionChange(id, newPosition);
      }
    }
  });
  
  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    if (e.nativeEvent) {
      e.nativeEvent.stopPropagation();
    }
    if (onSelect) {
      onSelect(id);
    }
  };
  
  return (
    <group 
      ref={bind.ref}
      position={positionVector}
      rotation={eulerRotation}
      onClick={handleClick}
      onPointerDown={bind.onPointerDown}
      userData={{ type: 'selectable', id, category: 'transformer' }}
    >
      <mesh castShadow receiveShadow>
        <boxGeometry args={[3, 2.5, 2]} />
        <meshStandardMaterial 
          color={isSelected ? '#88ccff' : '#555577'} 
          metalness={0.5} 
          roughness={0.3}
        />
      </mesh>
      
      {isSelected && (
        <mesh position={[0, 3, 0]}>
          <sphereGeometry args={[0.3, 16, 16]} />
          <meshBasicMaterial color="#ffaa00" wireframe />
        </mesh>
      )}
    </group>
  );
}
