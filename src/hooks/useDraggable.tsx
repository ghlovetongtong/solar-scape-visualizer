
import { useRef, useEffect, useState } from 'react';
import { useThree, ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';

export interface DraggableOptions {
  enabled?: boolean;
  onDragStart?: () => void;
  onDragEnd?: (position: THREE.Vector3) => void;
}

export function useDraggable(options: DraggableOptions = {}) {
  const { camera, gl } = useThree();
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState(new THREE.Vector3());
  const dragRef = useRef<THREE.Group>(null);
  const initialPositionRef = useRef(new THREE.Vector3());
  const offsetRef = useRef(new THREE.Vector3());
  const planeRef = useRef(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0));
  
  // Setup raycaster for plane intersection
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  const intersection = new THREE.Vector3();
  
  const handleDragStart = (e: ThreeEvent<PointerEvent>) => {
    if (!options.enabled) return;
    if (!dragRef.current) return;
    
    // Store the mouse event to use later
    e.stopPropagation();
    // For ThreeEvent, we can't use preventDefault() directly
    // as it's a synthetic event
    if (e.nativeEvent) {
      e.nativeEvent.preventDefault();
      e.nativeEvent.stopPropagation();
    }
    
    // Store initial position
    initialPositionRef.current.copy(dragRef.current.position);
    
    // Calculate offset
    setIsDragging(true);
    
    // Calculate intersection with the plane
    mouse.x = (e.nativeEvent.clientX / gl.domElement.clientWidth) * 2 - 1;
    mouse.y = -(e.nativeEvent.clientY / gl.domElement.clientHeight) * 2 + 1;
    
    raycaster.setFromCamera(mouse, camera);
    
    if (raycaster.ray.intersectPlane(planeRef.current, intersection)) {
      offsetRef.current.copy(intersection).sub(dragRef.current.position);
    }
    
    if (options.onDragStart) {
      options.onDragStart();
    }
    
    // Disable orbit controls while dragging
    const domElement = gl.domElement;
    const orbitControls = domElement['__r3f']?.objects?.filter(obj => obj.name === 'OrbitControls')[0]?.object;
    if (orbitControls) {
      orbitControls.enabled = false;
    }
    
    document.body.style.cursor = 'grabbing';
  };
  
  const handleDragMove = (e: PointerEvent) => {
    if (!isDragging || !dragRef.current) return;
    
    // Calculate the new position
    mouse.x = (e.clientX / gl.domElement.clientWidth) * 2 - 1;
    mouse.y = -(e.clientY / gl.domElement.clientHeight) * 2 + 1;
    
    raycaster.setFromCamera(mouse, camera);
    
    if (raycaster.ray.intersectPlane(planeRef.current, intersection)) {
      dragRef.current.position.copy(intersection).sub(offsetRef.current);
      setPosition(dragRef.current.position.clone());
    }
  };
  
  const handleDragEnd = () => {
    if (!isDragging || !dragRef.current) return;
    
    setIsDragging(false);
    
    if (options.onDragEnd) {
      options.onDragEnd(dragRef.current.position.clone());
    }
    
    // Re-enable orbit controls
    const domElement = gl.domElement;
    const orbitControls = domElement['__r3f']?.objects?.filter(obj => obj.name === 'OrbitControls')[0]?.object;
    if (orbitControls) {
      orbitControls.enabled = true;
    }
    
    document.body.style.cursor = 'auto';
  };
  
  // Add and remove event listeners
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('pointermove', handleDragMove);
      window.addEventListener('pointerup', handleDragEnd);
    } else {
      window.removeEventListener('pointermove', handleDragMove);
      window.removeEventListener('pointerup', handleDragEnd);
    }
    
    return () => {
      window.removeEventListener('pointermove', handleDragMove);
      window.removeEventListener('pointerup', handleDragEnd);
    };
  }, [isDragging]);
  
  return {
    bind: {
      ref: dragRef,
      onPointerDown: handleDragStart,
    },
    isDragging,
    position
  };
}
