
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
    if (points.length > 2) {
      // Make a simplified copy of the points to ensure we have a clean boundary
      const simplifiedPoints = simplifyBoundary([...points]);
      
      // Use setTimeout to ensure the completion event occurs after the current render cycle
      // This should help avoid the "Cannot read properties of undefined (reading 'lov')" error
      setTimeout(() => {
        if (onComplete && simplifiedPoints.length > 2) {
          onComplete(simplifiedPoints);
        }
      }, 0);
    }
  }, [isDrawing, enabled, points, onComplete]);

  // Helper function to simplify boundary by removing redundant points
  const simplifyBoundary = (points: BoundaryPoint[]): BoundaryPoint[] => {
    if (points.length < 4) return points;
    
    // Remove points that are too close to each other
    const minDistance = 0.5; // Minimum distance between points
    const result: BoundaryPoint[] = [points[0]];
    
    for (let i = 1; i < points.length; i++) {
      const [x, z] = points[i];
      const [prevX, prevZ] = result[result.length - 1];
      
      const distance = Math.sqrt(Math.pow(x - prevX, 2) + Math.pow(z - prevZ, 2));
      if (distance > minDistance) {
        result.push(points[i]);
      }
    }
    
    return result;
  };

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
