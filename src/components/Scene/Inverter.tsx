
import React, { useCallback, useRef, useState, useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { useThree, useFrame } from '@react-three/fiber';
import { createDeviceLabel } from '../../utils/deviceLabels';

interface InverterProps {
  position: THREE.Vector3;
  inverterIndex: number;
  isSelected?: boolean;
  isDragging?: boolean;
  onClick?: (event: any) => void;
  onDragStart?: (index: number) => void;
  onDragEnd?: (index: number, position: [number, number, number]) => void;
  onDrag?: (index: number, position: [number, number, number]) => void;
}

export default function Inverter({ 
  position, 
  inverterIndex, 
  isSelected = false,
  isDragging = false,
  onClick,
  onDragStart,
  onDragEnd,
  onDrag
}: InverterProps) {
  
  const groupRef = useRef<THREE.Group>(null);
  const [dragOffset, setDragOffset] = useState<THREE.Vector3 | null>(null);
  const { raycaster, camera, mouse, gl } = useThree();
  
  // Add useMemo for the Inverter label with dynamic color based on selection
  const inverterLabel = useMemo(() => {
    return createDeviceLabel(`Inverter ${inverterIndex + 1}`, {
      textColor: isSelected ? "#9b87f5" : "#ffffff"
    });
  }, [inverterIndex, isSelected]);
  
  // Define materials based on selection and dragging state
  const baseMaterial = isSelected
    ? <meshPhysicalMaterial color="#9b87f5" roughness={0.4} metalness={0.6} emissive="#9b87f5" emissiveIntensity={0.5} />
    : <meshPhysicalMaterial color="#2b2d42" roughness={0.6} metalness={0.4} />;
  
  const connectionMaterial = isSelected
    ? <meshPhysicalMaterial color="#222222" roughness={0.3} metalness={0.7} emissive="#222222" emissiveIntensity={0.3} />
    : <meshPhysicalMaterial color="#222222" roughness={0.5} metalness={0.5} />;
  
  const finsMaterial = isSelected
    ? <meshPhysicalMaterial color="#6e7494" roughness={0.2} metalness={0.8} emissive="#6e7494" emissiveIntensity={0.3} />
    : <meshPhysicalMaterial color="#4a4e69" roughness={0.3} metalness={0.7} />;

  // Setup scene-level event listeners for dragging
  useEffect(() => {
    if (!isDragging) return;
    
    const handleGlobalMouseMove = () => {
      if (isDragging && onDrag && dragOffset) {
        // Create a plane parallel to the ground at the object's height
        const dragPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -position.y);
        
        // Cast ray from mouse position
        raycaster.setFromCamera(mouse, camera);
        
        // Find intersection with drag plane
        const intersection = new THREE.Vector3();
        raycaster.ray.intersectPlane(dragPlane, intersection);
        
        if (intersection) {
          // Apply the drag offset to maintain relative position
          intersection.sub(dragOffset);
          
          // Only update X and Z positions (keep Y constant)
          const newPosition: [number, number, number] = [
            intersection.x,
            position.y, // Keep Y position constant
            intersection.z
          ];
          
          // Call the drag callback with the new position
          onDrag(inverterIndex, newPosition);
        }
      }
    };
    
    const handleGlobalMouseUp = () => {
      if (isDragging && onDragEnd) {
        const newPosition: [number, number, number] = [position.x, position.y, position.z];
        onDragEnd(inverterIndex, newPosition);
        setDragOffset(null);
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
  }, [isDragging, onDrag, onDragEnd, camera, mouse, raycaster, position.y, inverterIndex, dragOffset, gl.domElement]);

  // Improved click handler to ensure event propagation is stopped correctly
  const handleClick = useCallback((event: any) => {
    // Stop propagation at all levels to prevent scene click
    event.stopPropagation();
    if (event.nativeEvent) {
      event.nativeEvent.stopPropagation();
    }
    
    // Log the click for debugging
    console.log(`Inverter ${inverterIndex + 1} clicked with isSelected=${isSelected}`);
    
    // Call the parent's onClick if provided
    if (onClick) {
      onClick(event);
    }
  }, [inverterIndex, isSelected, onClick]);
  
  const handlePointerDown = (e: THREE.Event) => {
    e.stopPropagation();
    
    if (onDragStart) {
      onDragStart(inverterIndex);
      
      // Calculate and store the offset between the object position and the intersection point
      if (groupRef.current) {
        const dragPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -position.y);
        raycaster.setFromCamera(mouse, camera);
        
        const intersection = new THREE.Vector3();
        raycaster.ray.intersectPlane(dragPlane, intersection);
        
        if (intersection) {
          // Store the offset from intersection to object position
          setDragOffset(intersection.clone().sub(new THREE.Vector3(position.x, position.y, position.z)));
        }
      }
    }
  };

  return (
    <group 
      position={position}
      onClick={handleClick}
      userData={{ type: 'inverter', inverterIndex }}
      ref={groupRef}
      onPointerDown={handlePointerDown}
    >
      {/* Main inverter box */}
      <mesh 
        castShadow 
        receiveShadow
        position={[0, 1, 0]}
        userData={{ type: 'inverter', inverterIndex }}
        onClick={handleClick}
      >
        <boxGeometry args={[3.0, 2.2, 1.8]} />
        {baseMaterial}
      </mesh>
      
      {/* Cooling fins */}
      <mesh 
        castShadow 
        position={[0, 1, 0.95]}
        userData={{ type: 'inverter', inverterIndex }}
        onClick={handleClick}
      >
        <boxGeometry args={[2.7, 2.0, 0.15]} />
        {finsMaterial}
      </mesh>
      
      {/* Connection box */}
      <mesh 
        castShadow 
        position={[0, 0, 0]}
        userData={{ type: 'inverter', inverterIndex }}
        onClick={handleClick}
      >
        <boxGeometry args={[2.4, 0.6, 1.2]} />
        {connectionMaterial}
      </mesh>
      
      {/* Status indicator light */}
      <mesh
        position={[1.1, 1.6, 0.95]}
        userData={{ type: 'inverter', inverterIndex }}
        onClick={handleClick}
      >
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshStandardMaterial 
          color={isSelected ? "#9b87f5" : "#00ff00"} 
          emissive={isSelected ? "#9b87f5" : "#00ff00"}
          emissiveIntensity={isSelected ? 1.5 : 1.0}
        />
      </mesh>

      {/* Ventilation grille */}
      <mesh
        position={[-1.0, 1.6, 0.95]}
        userData={{ type: 'inverter', inverterIndex }}
        onClick={handleClick}
      >
        <boxGeometry args={[1.0, 1.0, 0.08]} />
        <meshStandardMaterial 
          color={isSelected ? "#444444" : "#333333"}
          roughness={0.2}
        />
      </mesh>

      {/* Cables */}
      <mesh
        position={[0, 0.3, 0.9]}
        userData={{ type: 'inverter', inverterIndex }}
        onClick={handleClick}
      >
        <cylinderGeometry args={[0.15, 0.15, 1.8, 8]} />
        <meshStandardMaterial color="#111111" />
      </mesh>

      {/* Inverter label using the new utility */}
      {inverterLabel && (
        <mesh position={[0, 6, 0]} rotation={[0, 0, 0]}>
          <planeGeometry args={[24, 12]} />
          <meshBasicMaterial 
            map={inverterLabel} 
            transparent={true}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}
    </group>
  );
}
