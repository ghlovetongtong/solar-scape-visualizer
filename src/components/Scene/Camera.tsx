
import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { Text } from '@react-three/drei';

interface CameraProps {
  position: THREE.Vector3;
  cameraIndex: number;
  isDragging?: boolean;
  onDragStart?: (index: number) => void;
  onDragEnd?: (index: number, position: [number, number, number]) => void;
  onDrag?: (index: number, position: [number, number, number]) => void;
}

export default function Camera({ 
  position, 
  cameraIndex,
  isDragging = false,
  onDragStart,
  onDragEnd,
  onDrag
}: CameraProps) {
  const cameraRef = useRef<THREE.Group>(null);
  const { raycaster, camera, mouse } = useThree();
  
  // Rotate camera to face center and add subtle animation
  useFrame((state) => {
    if (cameraRef.current) {
      if (isDragging && onDrag) {
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
          onDrag(cameraIndex, newPosition);
        }
      } else {
        // Rotate the camera to face inward toward the center
        const targetPosition = new THREE.Vector3(0, 0, 0); // Center of the scene
        const cameraPosition = cameraRef.current.position;
        const direction = new THREE.Vector3().subVectors(targetPosition, cameraPosition).normalize();
        
        // Calculate angle to face center
        const angle = Math.atan2(direction.x, direction.z);
        
        // Add subtle oscillation based on time and camera index for visual variety
        const oscillation = Math.sin(state.clock.getElapsedTime() * 0.1 + cameraIndex) * 0.1;
        
        // Set the rotation to face center with slight movement
        cameraRef.current.rotation.y = angle + oscillation;
      }
    }
  });
  
  const handlePointerDown = (e: THREE.Event) => {
    e.stopPropagation();
    
    if (onDragStart) {
      onDragStart(cameraIndex);
    }
  };
  
  const handlePointerUp = (e: THREE.Event) => {
    e.stopPropagation();
    
    if (isDragging && onDragEnd) {
      const newPosition: [number, number, number] = [position.x, position.y, position.z];
      onDragEnd(cameraIndex, newPosition);
    }
  };

  return (
    <group 
      position={position} 
      ref={cameraRef}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerOut={handlePointerUp}
    >
      {/* Camera mount/pole */}
      <mesh castShadow position={[0, -5, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 10, 8]} />
        <meshStandardMaterial color={isDragging ? "#aaaaaa" : "#888888"} roughness={0.6} />
      </mesh>
      
      {/* Camera housing */}
      <group rotation={[0, 0, 0]}>
        {/* Main camera body */}
        <mesh castShadow position={[0, 0, 0.2]}>
          <boxGeometry args={[0.3, 0.3, 0.8]} />
          <meshStandardMaterial color={isDragging ? "#555555" : "#333333"} roughness={0.5} metalness={0.7} />
        </mesh>
        
        {/* Camera lens */}
        <mesh castShadow position={[0, 0, 0.6]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.12, 0.15, 0.1, 16]} />
          <meshPhysicalMaterial 
            color="#111111" 
            roughness={0.1} 
            clearcoat={1} 
            clearcoatRoughness={0.1}
          />
        </mesh>
        
        {/* Indicator light */}
        <mesh position={[0, 0.12, 0.2]}>
          <sphereGeometry args={[0.03, 8, 8]} />
          <meshStandardMaterial 
            color="#ff0000" 
            emissive="#ff0000" 
            emissiveIntensity={2} 
          />
        </mesh>
      </group>
      
      {/* Camera label */}
      <Text
        position={[0, 0.5, 0]}
        rotation={[0, 0, 0]}
        fontSize={0.2}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="#000000"
      >
        {`Camera ${cameraIndex + 1}`}
      </Text>
    </group>
  );
}
