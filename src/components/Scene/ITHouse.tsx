import React, { useRef, useState } from 'react';
import * as THREE from 'three';
import { Text } from '@react-three/drei';
import { useThree, useFrame } from '@react-three/fiber';

interface ITHouseProps {
  position: THREE.Vector3;
  isDragging?: boolean;
  onDragStart?: () => void;
  onDragEnd?: (position: [number, number, number]) => void;
  onDrag?: (position: [number, number, number]) => void;
}

export default function ITHouse({ 
  position,
  isDragging = false,
  onDragStart,
  onDragEnd,
  onDrag
}: ITHouseProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [dragOffset, setDragOffset] = useState<THREE.Vector3 | null>(null);
  const { raycaster, camera, mouse } = useThree();
  
  useFrame(() => {
    if (isDragging && dragOffset && groupRef.current && onDrag) {
      const dragPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -position.y);
      
      raycaster.setFromCamera(mouse, camera);
      
      const intersection = new THREE.Vector3();
      raycaster.ray.intersectPlane(dragPlane, intersection);
      
      if (intersection) {
        intersection.sub(dragOffset);
        
        const newPosition: [number, number, number] = [
          intersection.x,
          position.y,
          intersection.z
        ];
        
        onDrag(newPosition);
      }
    }
  });
  
  const handlePointerDown = (e: THREE.Event) => {
    e.stopPropagation();
    
    if (onDragStart) {
      onDragStart();
      
      if (groupRef.current) {
        const dragPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -position.y);
        raycaster.setFromCamera(mouse, camera);
        
        const intersection = new THREE.Vector3();
        raycaster.ray.intersectPlane(dragPlane, intersection);
        
        if (intersection) {
          setDragOffset(intersection.clone().sub(new THREE.Vector3(position.x, position.y, position.z)));
        }
      }
    }
  };
  
  const handlePointerUp = (e: THREE.Event) => {
    e.stopPropagation();
    
    if (isDragging && onDragEnd) {
      if (groupRef.current) {
        const newPosition: [number, number, number] = [position.x, position.y, position.z];
        onDragEnd(newPosition);
      }
      setDragOffset(null);
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
        castShadow 
        receiveShadow 
        position={[0, 2, 0]}
      >
        <boxGeometry args={[10, 4, 6]} />
        <meshStandardMaterial color={isDragging ? "#f8f8f8" : "#f1f1f1"} roughness={0.7} />
      </mesh>
      
      <mesh 
        castShadow 
        position={[0, 4.5, 0]}
      >
        <boxGeometry args={[11, 1, 7]} />
        <meshStandardMaterial color={isDragging ? "#777777" : "#555555"} roughness={0.6} />
      </mesh>
      
      <mesh 
        position={[0, 1.2, 3.01]}
      >
        <planeGeometry args={[1.2, 2.4]} />
        <meshStandardMaterial color="#333333" roughness={0.5} metalness={0.3} />
      </mesh>
      
      <mesh 
        position={[-3, 2.5, 3.01]}
      >
        <planeGeometry args={[1.5, 1.5]} />
        <meshPhysicalMaterial 
          color="#88a8df" 
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
          color="#88a8df" 
          roughness={0.1} 
          metalness={0.2} 
          transmission={0.9}
          thickness={0.5}
        />
      </mesh>
      
      <mesh 
        castShadow 
        position={[5.5, 2, 0]}
      >
        <boxGeometry args={[1, 1, 2]} />
        <meshStandardMaterial color="#888888" roughness={0.5} />
      </mesh>
      
      <mesh 
        position={[4, 5.5, 2]}
      >
        <cylinderGeometry args={[0.05, 0.05, 2, 8]} />
        <meshStandardMaterial color="#333333" roughness={0.5} />
      </mesh>
      
      <mesh 
        position={[4, 6.5, 2]}
        rotation={[0, 0, Math.PI / 2]}
      >
        <sphereGeometry args={[0.4, 16, 16, 0, Math.PI]} />
        <meshStandardMaterial color="#dddddd" roughness={0.4} />
      </mesh>
      
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
