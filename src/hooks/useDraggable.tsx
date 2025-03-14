
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
  const plane = useRef(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0));

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
    
    // Create intersection point where the user clicked
    const intersectionPoint = new THREE.Vector3().copy(e.point);
    dragStartPoint.current = intersectionPoint;
    
    if (onDragStart) {
      onDragStart(groupRef.current.position.clone());
    }
    
    // This is crucial: capture the pointer to ensure we get all pointer events even outside the canvas
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: ThreeEvent<PointerEvent>) => {
    if (!isDragging || !groupRef.current || !originalPosition.current || !dragStartPoint.current) return;
    
    // Update the raycaster with current pointer position
    const coords = {
      x: (e.clientX / window.innerWidth) * 2 - 1,
      y: -(e.clientY / window.innerHeight) * 2 + 1,
    };
    
    raycaster.setFromCamera(new THREE.Vector2(coords.x, coords.y), camera);
    
    // Find intersection with the horizontal plane
    const intersection = new THREE.Vector3();
    raycaster.ray.intersectPlane(plane.current, intersection);
    
    if (intersection) {
      // Calculate the movement delta from the drag start point
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

  const handlePointerUp = (e: ThreeEvent<PointerEvent>) => {
    if (!isDragging || !groupRef.current) return;
    
    // Release the pointer capture
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    
    setIsDragging(false);
    gl.domElement.style.cursor = 'auto';
    
    if (onDragEnd && groupRef.current) {
      onDragEnd(groupRef.current.position.clone());
    }
    
    dragStartPoint.current = null;
    originalPosition.current = null;
  };

  return {
    isDragging,
    groupRef,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp
  };
}
