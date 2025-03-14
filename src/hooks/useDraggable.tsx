
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { ThreeEvent, useThree } from '@react-three/fiber';

interface DraggableOptions {
  enabled?: boolean;
  onDragStart?: (position: THREE.Vector3) => void;
  onDrag?: (position: THREE.Vector3) => void;
  onDragEnd?: (position: THREE.Vector3) => void;
  lockY?: boolean;
}

export function useDraggable(
  initialPosition: THREE.Vector3, 
  options: DraggableOptions = {}
) {
  const { 
    enabled = true, 
    onDragStart, 
    onDrag, 
    onDragEnd,
    lockY = true 
  } = options;
  
  const [isDragging, setIsDragging] = useState(false);
  const groupRef = useRef<THREE.Group>(null);
  const dragStartPoint = useRef<THREE.Vector3 | null>(null);
  const originalPosition = useRef<THREE.Vector3 | null>(null);
  const { camera, raycaster, gl } = useThree();
  const plane = useRef<THREE.Plane>(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0));

  // Set initial position
  useEffect(() => {
    if (groupRef.current && initialPosition) {
      groupRef.current.position.copy(initialPosition);
    }
  }, [initialPosition]);

  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    if (!enabled || !groupRef.current) return;
    
    e.stopPropagation();
    setIsDragging(true);
    gl.domElement.style.cursor = 'grabbing';
    
    // Save the original position for reference during dragging
    originalPosition.current = groupRef.current.position.clone();
    dragStartPoint.current = new THREE.Vector3(e.point.x, e.point.y, e.point.z);
    
    if (onDragStart) {
      onDragStart(groupRef.current.position.clone());
    }
  };

  const handlePointerMove = (e: PointerEvent) => {
    if (!isDragging || !groupRef.current || !originalPosition.current || !dragStartPoint.current) return;
    
    // Get screen coordinates
    const x = (e.clientX / window.innerWidth) * 2 - 1;
    const y = -(e.clientY / window.innerHeight) * 2 + 1;
    
    // Set up raycaster with screen coordinates
    raycaster.setFromCamera(new THREE.Vector2(x, y), camera);
    
    // Find intersection with the horizontal plane
    const intersection = new THREE.Vector3();
    raycaster.ray.intersectPlane(plane.current, intersection);
    
    if (intersection) {
      // Calculate the movement delta from the original position
      const deltaX = intersection.x - dragStartPoint.current.x;
      const deltaZ = intersection.z - dragStartPoint.current.z;
      
      // Update the object position
      groupRef.current.position.x = originalPosition.current.x + deltaX;
      if (!lockY) {
        groupRef.current.position.y = originalPosition.current.y;
      }
      groupRef.current.position.z = originalPosition.current.z + deltaZ;
      
      if (onDrag) {
        onDrag(groupRef.current.position.clone());
      }
    }
  };

  const handlePointerUp = () => {
    if (!isDragging || !groupRef.current) return;
    
    setIsDragging(false);
    gl.domElement.style.cursor = 'auto';
    
    if (onDragEnd && groupRef.current) {
      onDragEnd(groupRef.current.position.clone());
    }
    
    dragStartPoint.current = null;
    originalPosition.current = null;
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
      
      // Add these to make sure dragging stops if we leave the window
      window.addEventListener('pointerleave', handlePointerUp);
      window.addEventListener('pointercancel', handlePointerUp);
    }
    
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointerleave', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
    };
  }, [isDragging]);

  return {
    isDragging,
    groupRef,
    handlePointerDown
  };
}
