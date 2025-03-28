import React, { useRef, useState, useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { useThree, useFrame } from '@react-three/fiber';
import { createDeviceLabel } from '../../utils/deviceLabels';

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
  const { raycaster, camera, mouse, gl } = useThree();
  
  const houseLabel = useMemo(() => {
    return createDeviceLabel('IT House');
  }, []);
  
  useEffect(() => {
    if (!isDragging) return;
    
    const handleGlobalMouseMove = () => {
      if (isDragging && dragOffset && onDrag) {
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
    };
    
    const handleGlobalMouseUp = () => {
      if (isDragging && onDragEnd) {
        const newPosition: [number, number, number] = [position.x, position.y, position.z];
        onDragEnd(newPosition);
        setDragOffset(null);
      }
    };
    
    const domElement = gl.domElement;
    domElement.addEventListener('mousemove', handleGlobalMouseMove);
    domElement.addEventListener('mouseup', handleGlobalMouseUp);
    window.addEventListener('mouseup', handleGlobalMouseUp);
    
    return () => {
      domElement.removeEventListener('mousemove', handleGlobalMouseMove);
      domElement.removeEventListener('mouseup', handleGlobalMouseUp);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isDragging, onDrag, onDragEnd, camera, mouse, raycaster, position.y, dragOffset, gl.domElement]);
  
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

  return (
    <group 
      position={position}
      ref={groupRef}
      onPointerDown={handlePointerDown}
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
      
      {houseLabel && (
        <mesh position={[0, 10, 0]} rotation={[0, 0, 0]}>
          <planeGeometry args={[24, 12]} />
          <meshBasicMaterial 
            map={houseLabel} 
            transparent={true}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}
    </group>
  );
}
