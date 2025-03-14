
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
  const { camera, gl } = useThree();
  const plane = useRef(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0));
  const planeNormal = new THREE.Vector3(0, 1, 0);
  const startPoint = new THREE.Vector3();
  const pointerId = useRef<number | null>(null);

  // Set initial position
  useEffect(() => {
    if (groupRef.current && initialPosition) {
      groupRef.current.position.copy(initialPosition);
    }
  }, [initialPosition]);

  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    if (!enabled || !groupRef.current) return;
    
    // Prevent event from propagating to parent elements
    e.stopPropagation();
    setIsDragging(true);
    gl.domElement.style.cursor = 'grabbing';
    
    // Store pointer ID for tracking
    pointerId.current = e.pointerId;
    
    // Save the original position for reference during dragging
    originalPosition.current = groupRef.current.position.clone();
    
    // Calculate the plane's position (at the current object's y position)
    const planePosition = new THREE.Vector3(0, groupRef.current.position.y, 0);
    plane.current.setFromNormalAndCoplanarPoint(planeNormal, planePosition);
    
    // Cast a ray from the camera to the pointer position
    const coords = {
      x: (e.clientX / window.innerWidth) * 2 - 1,
      y: -(e.clientY / window.innerHeight) * 2 + 1,
    };
    
    // Create a raycaster
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(coords.x, coords.y), camera);
    
    // Find intersection with the horizontal plane
    if (raycaster.ray.intersectPlane(plane.current, startPoint)) {
      dragStartPoint.current = startPoint.clone();
    }
    
    if (onDragStart) {
      onDragStart(groupRef.current.position.clone());
    }
    
    // Capture pointer to ensure we get all events
    e.target.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: ThreeEvent<PointerEvent>) => {
    if (!isDragging || !groupRef.current || !originalPosition.current || !dragStartPoint.current || pointerId.current !== e.pointerId) return;
    
    // Update the raycaster with current pointer position
    const coords = {
      x: (e.clientX / window.innerWidth) * 2 - 1,
      y: -(e.clientY / window.innerHeight) * 2 + 1,
    };
    
    // Create a raycaster
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(coords.x, coords.y), camera);
    
    // Find intersection with the horizontal plane
    const intersection = new THREE.Vector3();
    if (raycaster.ray.intersectPlane(plane.current, intersection)) {
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
    if (!isDragging || pointerId.current !== e.pointerId) return;
    
    // Release pointer capture
    if (e.target.hasPointerCapture(e.pointerId)) {
      e.target.releasePointerCapture(e.pointerId);
    }
    
    setIsDragging(false);
    gl.domElement.style.cursor = 'auto';
    pointerId.current = null;
    
    if (onDragEnd && groupRef.current) {
      onDragEnd(groupRef.current.position.clone());
    }
    
    dragStartPoint.current = null;
    originalPosition.current = null;
  };

  const handlePointerCancel = (e: ThreeEvent<PointerEvent>) => {
    if (pointerId.current !== e.pointerId) return;
    
    // Release pointer capture
    if (e.target.hasPointerCapture(e.pointerId)) {
      e.target.releasePointerCapture(e.pointerId);
    }
    
    setIsDragging(false);
    gl.domElement.style.cursor = 'auto';
    pointerId.current = null;
    
    // Reset to original position if available
    if (groupRef.current && originalPosition.current) {
      groupRef.current.position.copy(originalPosition.current);
    }
    
    dragStartPoint.current = null;
    originalPosition.current = null;
  };

  return {
    isDragging,
    groupRef,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handlePointerCancel
  };
}
