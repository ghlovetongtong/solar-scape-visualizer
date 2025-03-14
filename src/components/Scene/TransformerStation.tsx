
import React from 'react';
import * as THREE from 'three';
import { Text } from '@react-three/drei';
import { useDraggable } from '@/hooks/useDraggable';

interface TransformerStationProps {
  position: THREE.Vector3;
  rotation?: THREE.Euler;
  transformerIndex?: number;
  isSelected?: boolean;
  onSelect?: () => void;
  onPositionChange?: (position: THREE.Vector3) => void;
  onRotationChange?: (rotation: THREE.Euler) => void;
}

export default function TransformerStation({ 
  position, 
  rotation = new THREE.Euler(), 
  transformerIndex = 0, 
  isSelected = false, 
  onSelect,
  onPositionChange,
  onRotationChange
}: TransformerStationProps) {
  
  const { groupRef, handlePointerDown, isDragging } = useDraggable(position, {
    enabled: isSelected,
    onDragEnd: (newPosition) => {
      if (onPositionChange) {
        onPositionChange(newPosition);
      }
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
      ref={groupRef}
      position={position} 
      rotation={rotation} 
      onClick={handleClick}
      onPointerDown={handlePointerDown}
      userData={{ type: 'selectable', componentType: 'transformer', draggable: true }}
    >
      {/* Platform/base */}
      <mesh 
        receiveShadow 
        position={[0, 0.3, 0]}
      >
        <boxGeometry args={[10, 0.6, 8]} />
        <meshStandardMaterial 
          color={isDragging ? "#b1cdff" : isSelected ? "#94a3b8" : "#555555"} 
          roughness={0.8} 
          emissive={isSelected ? "#94a3b8" : "#000000"}
          emissiveIntensity={isSelected ? 0.2 : 0}
        />
      </mesh>
      
      {/* Main transformer cabinet */}
      <mesh 
        castShadow 
        receiveShadow 
        position={[0, 2.5, 0]}
      >
        <boxGeometry args={[6, 4, 4]} />
        <meshStandardMaterial 
          color={isDragging ? "#87c2ff" : isSelected ? "#60a5fa" : "#8a898c"} 
          roughness={0.5} 
          metalness={0.4}
          emissive={isSelected ? "#60a5fa" : "#000000"}
          emissiveIntensity={isSelected ? 0.4 : 0}
        />
      </mesh>
      
      {/* Cooling fins */}
      <mesh 
        castShadow 
        position={[-3.01, 2.5, 0]}
      >
        <boxGeometry args={[0.2, 3.5, 3.5]} />
        <meshStandardMaterial 
          color={isSelected ? "#93c5fd" : "#777777"} 
          roughness={0.3} 
          metalness={0.6}
        />
      </mesh>
      
      <mesh 
        castShadow 
        position={[3.01, 2.5, 0]}
      >
        <boxGeometry args={[0.2, 3.5, 3.5]} />
        <meshStandardMaterial 
          color={isSelected ? "#93c5fd" : "#777777"} 
          roughness={0.3} 
          metalness={0.6}
        />
      </mesh>
      
      {/* High voltage warning signs */}
      <mesh position={[0, 2.5, 2.01]}>
        <planeGeometry args={[2, 1.5]} />
        <meshBasicMaterial 
          color="#ffff00"
          side={THREE.DoubleSide}
        />
      </mesh>
      
      <mesh position={[0, 3.3, 2.02]}>
        <planeGeometry args={[1, 0.5]} />
        <meshBasicMaterial 
          color="#000000"
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {/* Electrical poles/insulators */}
      <mesh 
        castShadow 
        position={[2, 5, 0]}
      >
        <cylinderGeometry args={[0.1, 0.1, 3, 8]} />
        <meshStandardMaterial color="#dddddd" roughness={0.4} />
      </mesh>
      
      <mesh 
        castShadow 
        position={[0, 5, 0]}
      >
        <cylinderGeometry args={[0.1, 0.1, 3, 8]} />
        <meshStandardMaterial color="#dddddd" roughness={0.4} />
      </mesh>
      
      <mesh 
        castShadow 
        position={[-2, 5, 0]}
      >
        <cylinderGeometry args={[0.1, 0.1, 3, 8]} />
        <meshStandardMaterial color="#dddddd" roughness={0.4} />
      </mesh>
      
      {/* Transformer label */}
      <Text
        position={[0, 5, 2.5]}
        rotation={[0, 0, 0]}
        fontSize={0.5}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.04}
        outlineColor="#000000"
      >
        {`Transformer ${transformerIndex + 1}`}
      </Text>
    </group>
  );
}
