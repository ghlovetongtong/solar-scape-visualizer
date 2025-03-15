import React, { useRef, useEffect, useState } from 'react';
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
  onClick?: (index: number) => void;
  autoRotate?: boolean;
}

export default function Camera({ 
  position, 
  cameraIndex,
  isDragging = false,
  onDragStart,
  onDragEnd,
  onDrag,
  onClick,
  autoRotate = true
}: CameraProps) {
  const cameraRef = useRef<THREE.Group>(null);
  const dragOffsetRef = useRef<THREE.Vector3 | null>(null);
  const { raycaster, camera, mouse, gl } = useThree();
  const [hovered, setHovered] = useState(false);
  const rotationSpeedRef = useRef(Math.random() * 0.02 + 0.01); // Random speed between 0.01 and 0.03
  
  // Setup scene-level event listeners for dragging
  useEffect(() => {
    if (!isDragging) return;
    
    const handleGlobalMouseMove = () => {
      if (isDragging && onDrag) {
        // Create a plane parallel to the ground at the object's height
        const dragPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -position.y);
        
        // Cast ray from mouse position
        raycaster.setFromCamera(mouse, camera);
        
        // Find intersection with drag plane
        const intersection = new THREE.Vector3();
        raycaster.ray.intersectPlane(dragPlane, intersection);
        
        if (intersection && dragOffsetRef.current) {
          // Apply the drag offset to maintain relative position
          intersection.sub(dragOffsetRef.current);
          
          // Only update X and Z positions (keep Y constant)
          const newPosition: [number, number, number] = [
            intersection.x,
            position.y, // Keep Y position constant
            intersection.z
          ];
          
          // Call the drag callback with the new position
          onDrag(cameraIndex, newPosition);
        }
      }
    };
    
    const handleGlobalMouseUp = () => {
      if (isDragging && onDragEnd) {
        const newPosition: [number, number, number] = [position.x, position.y, position.z];
        onDragEnd(cameraIndex, newPosition);
        dragOffsetRef.current = null;
      }
    };
    
    // Add event listeners to the canvas
    const domElement = gl.domElement;
    domElement.addEventListener('mousemove', handleGlobalMouseMove);
    domElement.addEventListener('mouseup', handleGlobalMouseUp);
    window.addEventListener('mouseup', handleGlobalMouseUp);
    
    return () => {
      domElement.removeEventListener('mousemove', handleGlobalMouseMove);
      domElement.removeEventListener('mouseup', handleGlobalMouseUp);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isDragging, onDrag, onDragEnd, camera, mouse, raycaster, position.y, cameraIndex, gl.domElement]);
  
  // Rotate camera slightly over time
  useFrame((state) => {
    if (cameraRef.current) {
      if (isDragging) {
        // Stop rotation when dragging
        return;
      }
      
      if (autoRotate) {
        // Continuous rotation with slight variation based on camera index
        cameraRef.current.rotation.y += rotationSpeedRef.current * 0.01;
        
        // Optional: Add slight swaying motion for more natural look
        cameraRef.current.rotation.z = Math.sin(state.clock.getElapsedTime() * 0.2 + cameraIndex) * 0.03;
      } else {
        // If autoRotate is false, just keep the subtle back and forth motion
        cameraRef.current.rotation.y = Math.sin(state.clock.getElapsedTime() * 0.1 + cameraIndex) * 0.2;
      }
    }
  });
  
  const handlePointerDown = (e: THREE.Event) => {
    e.stopPropagation();
    
    if (e.button === 0) { // Left click
      if (onClick) {
        onClick(cameraIndex);
      }
    }
    
    if (onDragStart) {
      onDragStart(cameraIndex);
      
      // Calculate and store the offset between the object position and the intersection point
      if (cameraRef.current) {
        const dragPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -position.y);
        raycaster.setFromCamera(mouse, camera);
        
        const intersection = new THREE.Vector3();
        raycaster.ray.intersectPlane(dragPlane, intersection);
        
        if (intersection) {
          dragOffsetRef.current = intersection.clone().sub(new THREE.Vector3(position.x, position.y, position.z));
        }
      }
    }
  };
  
  // Add hover effects
  const handlePointerOver = (e: THREE.Event) => {
    e.stopPropagation();
    setHovered(true);
    document.body.style.cursor = 'pointer';
  };
  
  const handlePointerOut = (e: THREE.Event) => {
    e.stopPropagation();
    setHovered(false);
    document.body.style.cursor = 'auto';
  };

  return (
    <group 
      position={position} 
      ref={cameraRef}
      onPointerDown={handlePointerDown}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      userData={{ type: 'camera', cameraIndex }}
    >
      {/* Camera mount/pole */}
      <mesh castShadow position={[0, -5, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 10, 8]} />
        <meshStandardMaterial color={hovered ? "#aaaaaa" : (isDragging ? "#aaaaaa" : "#888888")} roughness={0.6} />
      </mesh>
      
      {/* Camera housing */}
      <group rotation={[0, 0, 0]}>
        {/* Main camera body */}
        <mesh castShadow position={[0, 0, 0.2]}>
          <boxGeometry args={[0.3, 0.3, 0.8]} />
          <meshStandardMaterial color={hovered ? "#555555" : (isDragging ? "#555555" : "#333333")} roughness={0.5} metalness={0.7} />
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
        fontSize={0.5}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.05}
        outlineColor="#000000"
      >
        {`Camera ${cameraIndex + 1}`}
      </Text>
    </group>
  );
}
