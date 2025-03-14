
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
  const { camera, gl, invalidate } = useThree();
  const plane = useRef(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0));
  const planeNormal = new THREE.Vector3(0, 1, 0);
  const intersection = useRef(new THREE.Vector3());
  const pointerId = useRef<number | null>(null);
  const orbitControlsEnabledRef = useRef<boolean | null>(null);

  // Set initial position
  useEffect(() => {
    if (groupRef.current && initialPosition) {
      groupRef.current.position.copy(initialPosition);
    }
  }, [initialPosition]);

  // Function to get OrbitControls instance from scene
  const getOrbitControls = () => {
    // Try to find orbit controls in the scene
    const orbitControls = gl.domElement.parentElement?.querySelector('canvas')?.__r3f?.controls;
    return orbitControls;
  };

  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    if (!enabled || !groupRef.current) return;
    
    console.log("Pointer down on draggable object", e.pointerId);
    
    // Get orbit controls and disable them temporarily
    const orbitControls = getOrbitControls();
    if (orbitControls) {
      orbitControlsEnabledRef.current = orbitControls.enabled;
      orbitControls.enabled = false;
    }
    
    // Prevent event from propagating to parent elements
    e.stopPropagation();
    e.preventDefault(); // Add preventDefault to stop orbit controls interactions
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
    const raycaster = new THREE.Raycaster();
    const coords = {
      x: (e.clientX / window.innerWidth) * 2 - 1,
      y: -(e.clientY / window.innerHeight) * 2 + 1,
    };
    raycaster.setFromCamera(new THREE.Vector2(coords.x, coords.y), camera);
    
    // Find intersection with the horizontal plane
    if (raycaster.ray.intersectPlane(plane.current, intersection.current)) {
      dragStartPoint.current = intersection.current.clone();
    }
    
    if (onDragStart) {
      onDragStart(groupRef.current.position.clone());
    }
    
    // Capture pointer to ensure we get all events, safely with type checking
    if (e.target) {
      const element = e.target as unknown as HTMLElement;
      if (element && typeof element.setPointerCapture === 'function') {
        try {
          element.setPointerCapture(e.pointerId);
          console.log("Pointer capture set successfully");
        } catch (error) {
          console.error("Error setting pointer capture:", error);
        }
      }
    }
    
    // Add extra event listeners to the window to ensure drag detection
    window.addEventListener('pointermove', handleGlobalPointerMove);
    window.addEventListener('pointerup', handleGlobalPointerUp);
  };

  // Global handlers to ensure dragging works even if the pointer leaves the object
  const handleGlobalPointerMove = (e: PointerEvent) => {
    if (!isDragging || !groupRef.current || !originalPosition.current || !dragStartPoint.current || pointerId.current !== e.pointerId) return;
    
    // Update the raycaster with current pointer position
    const raycaster = new THREE.Raycaster();
    const coords = {
      x: (e.clientX / window.innerWidth) * 2 - 1,
      y: -(e.clientY / window.innerHeight) * 2 + 1,
    };
    raycaster.setFromCamera(new THREE.Vector2(coords.x, coords.y), camera);
    
    // Find intersection with the horizontal plane
    if (raycaster.ray.intersectPlane(plane.current, intersection.current)) {
      // Calculate the movement delta from the drag start point
      const deltaX = intersection.current.x - dragStartPoint.current.x;
      const deltaZ = intersection.current.z - dragStartPoint.current.z;
      
      // Update the object position
      groupRef.current.position.x = originalPosition.current.x + deltaX;
      if (!lockY) {
        groupRef.current.position.y = originalPosition.current.y;
      }
      groupRef.current.position.z = originalPosition.current.z + deltaZ;
      
      if (onDrag) {
        onDrag(groupRef.current.position.clone());
      }
      
      // Force a re-render
      invalidate();
    }
  };

  const handleGlobalPointerUp = (e: PointerEvent) => {
    if (!isDragging || pointerId.current !== e.pointerId) return;
    
    // Clean up global event listeners
    window.removeEventListener('pointermove', handleGlobalPointerMove);
    window.removeEventListener('pointerup', handleGlobalPointerUp);
    
    // Re-enable orbit controls
    const orbitControls = getOrbitControls();
    if (orbitControls && orbitControlsEnabledRef.current !== null) {
      orbitControls.enabled = orbitControlsEnabledRef.current;
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

  const handlePointerMove = (e: ThreeEvent<PointerEvent>) => {
    if (!isDragging || !groupRef.current || !originalPosition.current || !dragStartPoint.current || pointerId.current !== e.pointerId) return;
    
    console.log("Pointer move while dragging", e.pointerId);
    
    // Update the raycaster with current pointer position
    const raycaster = new THREE.Raycaster();
    const coords = {
      x: (e.clientX / window.innerWidth) * 2 - 1,
      y: -(e.clientY / window.innerHeight) * 2 + 1,
    };
    raycaster.setFromCamera(new THREE.Vector2(coords.x, coords.y), camera);
    
    // Find intersection with the horizontal plane
    if (raycaster.ray.intersectPlane(plane.current, intersection.current)) {
      // Calculate the movement delta from the drag start point
      const deltaX = intersection.current.x - dragStartPoint.current.x;
      const deltaZ = intersection.current.z - dragStartPoint.current.z;
      
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
    
    console.log("Pointer up after dragging", e.pointerId);
    
    // Release pointer capture safely
    if (e.target) {
      const element = e.target as unknown as HTMLElement;
      if (element && typeof element.hasPointerCapture === 'function' && 
          typeof element.releasePointerCapture === 'function') {
        try {
          if (element.hasPointerCapture(e.pointerId)) {
            element.releasePointerCapture(e.pointerId);
            console.log("Pointer capture released successfully");
          }
        } catch (error) {
          console.error("Error releasing pointer capture:", error);
        }
      }
    }
    
    // Re-enable orbit controls
    const orbitControls = getOrbitControls();
    if (orbitControls && orbitControlsEnabledRef.current !== null) {
      orbitControls.enabled = orbitControlsEnabledRef.current;
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
    
    console.log("Pointer cancel event", e.pointerId);
    
    // Clean up global event listeners
    window.removeEventListener('pointermove', handleGlobalPointerMove);
    window.removeEventListener('pointerup', handleGlobalPointerUp);
    
    // Release pointer capture safely
    if (e.target) {
      const element = e.target as unknown as HTMLElement;
      if (element && typeof element.hasPointerCapture === 'function' && 
          typeof element.releasePointerCapture === 'function') {
        try {
          if (element.hasPointerCapture(e.pointerId)) {
            element.releasePointerCapture(e.pointerId);
            console.log("Pointer capture released on cancel");
          }
        } catch (error) {
          console.error("Error releasing pointer capture on cancel:", error);
        }
      }
    }
    
    // Re-enable orbit controls
    const orbitControls = getOrbitControls();
    if (orbitControls && orbitControlsEnabledRef.current !== null) {
      orbitControls.enabled = orbitControlsEnabledRef.current;
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

  // Clean up event listeners on unmount
  useEffect(() => {
    return () => {
      window.removeEventListener('pointermove', handleGlobalPointerMove);
      window.removeEventListener('pointerup', handleGlobalPointerUp);
    };
  }, []);

  return {
    isDragging,
    groupRef,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handlePointerCancel
  };
}
