import React, { useRef } from 'react';
import * as THREE from 'three';
import { Text } from '@react-three/drei';
import { useThree, useFrame } from '@react-three/fiber';

interface TransformerStationProps {
  position: THREE.Vector3;
  transformerIndex: number;
  isDragging?: boolean;
  onDragStart?: (index: number) => void;
  onDragEnd?: (index: number, position: [number, number, number]) => void;
  onDrag?: (index: number, position: [number, number, number]) => void;
}

export default function TransformerStation({ 
  position, 
  transformerIndex,
  isDragging = false,
  onDragStart,
  onDragEnd,
  onDrag
}: TransformerStationProps) {
  const groupRef = useRef<THREE.Group>(null);
  const { raycaster, camera, mouse } = useThree();
  
  useFrame(() => {
    if (isDragging && groupRef.current && onDrag) {
      // Create a plane parallel to the ground at y=0
      const dragPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
      
      // Cast ray from mouse position
      raycaster.setFromCamera(mouse, camera);
      
      // Find intersection with drag plane
      const intersection = new THREE.Vector3();
      if (raycaster.ray.intersectPlane(dragPlane, intersection)) {
        // Only update X and Z positions (keep Y constant)
        const newPosition: [number, number, number] = [
          intersection.x,
          position.y, // Keep Y position constant
          intersection.z
        ];
        
        // Call the drag callback with the new position
        onDrag(transformerIndex, newPosition);
      }
    }
  });
  
  const handlePointerDown = (e: THREE.Event) => {
    e.stopPropagation();
    
    if (onDragStart) {
      onDragStart(transformerIndex);
    }
  };
  
  const handlePointerUp = (e: THREE.Event) => {
    e.stopPropagation();
    
    if (isDragging && onDragEnd) {
      const newPosition: [number, number, number] = [position.x, position.y, position.z];
      onDragEnd(transformerIndex, newPosition);
    }
  };

  return (
    <group 
      position={position} 
      ref={groupRef}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerOut={handlePointerUp}
    >
      <mesh 
        receiveShadow 
        position={[0, 0.3, 0]}
      >
        <boxGeometry args={[10, 0.6, 8]} />
        <meshStandardMaterial color={isDragging ? "#aaaaaa" : "#555555"} roughness={0.8} />
      </mesh>
      
      <mesh 
        castShadow 
        receiveShadow 
        position={[0, 2.5, 0]}
      >
        <boxGeometry args={[6, 4, 4]} />
        <meshStandardMaterial color={isDragging ? "#a9a8bc" : "#8a898c"} roughness={0.5} metalness={0.4} />
      </mesh>
      
      <mesh 
        castShadow 
        position={[-3.01, 2.5, 0]}
      >
        <boxGeometry args={[0.2, 3.5, 3.5]} />
        <meshStandardMaterial color={isDragging ? "#999999" : "#777777"} roughness={0.3} metalness={0.6} />
      </mesh>
      
      <mesh 
        castShadow 
        position={[3.01, 2.5, 0]}
      >
        <boxGeometry args={[0.2, 3.5, 3.5]} />
        <meshStandardMaterial color={isDragging ? "#999999" : "#777777"} roughness={0.3} metalness={0.6} />
      </mesh>
      
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
