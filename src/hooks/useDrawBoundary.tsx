
import { useState, useCallback, useEffect } from 'react';
import * as THREE from 'three';
import { useThree } from '@react-three/fiber';

export type BoundaryPoint = [number, number]; // [x, z] coordinates

interface UseDrawBoundaryProps {
  enabled: boolean;
  onComplete?: (points: BoundaryPoint[]) => void;
}

export function useDrawBoundary({ enabled, onComplete }: UseDrawBoundaryProps) {
  const [isDrawing, setIsDrawing] = useState(false);
  const [points, setPoints] = useState<BoundaryPoint[]>([]);
  const { camera, raycaster, scene, gl } = useThree();

  // Create a plane that represents the ground for raycasting
  const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  
  // Get the intersection point on the ground
  const getIntersectionPoint = useCallback((event: MouseEvent) => {
    // Convert mouse position to normalized device coordinates
    const mouse = new THREE.Vector2(
      (event.clientX / gl.domElement.clientWidth) * 2 - 1,
      -(event.clientY / gl.domElement.clientHeight) * 2 + 1
    );
    
    // Update the ray with the camera and mouse position
    raycaster.setFromCamera(mouse, camera);
    
    // Use a temporary vector to store the result
    const intersectionPoint = new THREE.Vector3();
    raycaster.ray.intersectPlane(groundPlane, intersectionPoint);
    
    return [intersectionPoint.x, intersectionPoint.z] as BoundaryPoint;
  }, [camera, raycaster, gl.domElement]);

  // Handle mouse down event to start drawing
  const handleMouseDown = useCallback((event: MouseEvent) => {
    if (!enabled) return;
    
    // Only respond to left mouse button
    if (event.button !== 0) return;
    
    const point = getIntersectionPoint(event);
    setPoints([point]);
    setIsDrawing(true);
  }, [enabled, getIntersectionPoint]);

  // Handle mouse move to add points while drawing
  const handleMouseMove = useCallback((event: MouseEvent) => {
    if (!isDrawing || !enabled) return;
    
    const point = getIntersectionPoint(event);
    setPoints(prev => [...prev, point]);
  }, [isDrawing, enabled, getIntersectionPoint]);

  // Handle mouse up to complete the drawing
  const handleMouseUp = useCallback(() => {
    if (!isDrawing || !enabled) return;
    
    setIsDrawing(false);
    
    // Only save if we have enough points to form a boundary
    if (points.length > 2 && onComplete) {
      onComplete(points);
    }
  }, [isDrawing, enabled, points, onComplete]);

  // Add and remove event listeners
  useEffect(() => {
    if (enabled) {
      window.addEventListener('mousedown', handleMouseDown);
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    
    return () => {
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [enabled, handleMouseDown, handleMouseMove, handleMouseUp]);

  // Function to clear the current drawing
  const clearDrawing = useCallback(() => {
    setPoints([]);
    setIsDrawing(false);
  }, []);

  return {
    points,
    isDrawing,
    clearDrawing
  };
}
