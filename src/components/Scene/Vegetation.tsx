import React, { useMemo, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { usePanelPositions } from '@/hooks/usePanelPositions';
import { getHeightAtPosition } from './Ground';
import { BoundaryPoint } from '@/hooks/useDrawBoundary';

interface VegetationProps {
  count?: number;
  minRadius?: number;
  maxRadius?: number;
  roadBoundary?: BoundaryPoint[];
  savedBoundaries?: BoundaryPoint[][];
}

export default function Vegetation({ 
  count = 500, // Reduced from 1000 to 500 (half)
  minRadius = 120, 
  maxRadius = 180,
  roadBoundary = [],
  savedBoundaries = []
}: VegetationProps) {
  // Vegetation density is now halved compared to before
  const actualCount = count;
  
  const instancedGrass = useRef<THREE.InstancedMesh>(null);
  const instancedRocks = useRef<THREE.InstancedMesh>(null);
  const instancedSmallRocks = useRef<THREE.InstancedMesh>(null);
  const instancedTallGrass = useRef<THREE.InstancedMesh>(null);
  
  // Get panel positions from the hook to accurately determine the solar panel area
  const { panelPositions, isInitialized } = usePanelPositions();
  
  // Calculate bounds of solar panel area
  const panelBounds = useMemo(() => {
    if (!isInitialized || panelPositions.length === 0) {
      return { minX: -120, maxX: 120, minZ: -120, maxZ: 120, positions: [] };
    }
    
    let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity;
    
    // Extract all panel positions for more precise checking
    const positions: [number, number, number][] = panelPositions.map(panel => panel.position);
    
    positions.forEach(pos => {
      minX = Math.min(minX, pos[0]);
      maxX = Math.max(maxX, pos[0]);
      minZ = Math.min(minZ, pos[2]);
      maxZ = Math.max(maxZ, pos[2]);
    });
    
    // Add some margin to the bounds (5 units)
    const margin = 5;
    return {
      minX: minX - margin,
      maxX: maxX + margin,
      minZ: minZ - margin,
      maxZ: maxZ + margin,
      positions
    };
  }, [isInitialized, panelPositions]);
  
  // Process road boundary if provided
  const roadBoundaryPolygon = useMemo(() => {
    if (!roadBoundary || roadBoundary.length < 2) return null;
    
    // Convert the road boundary to a simplified polygon for easier collision checks
    // For a road with just two points, create a wider corridor
    if (roadBoundary.length === 2) {
      const [startPoint, endPoint] = roadBoundary;
      const roadVector = {
        x: endPoint[0] - startPoint[0],
        z: endPoint[1] - startPoint[1]
      };
      const length = Math.sqrt(roadVector.x * roadVector.x + roadVector.z * roadVector.z);
      
      // Normalize the road vector
      const normalizedRoad = {
        x: roadVector.x / length,
        z: roadVector.z / length
      };
      
      // Calculate perpendicular vector (rotate 90 degrees)
      const perpendicular = {
        x: -normalizedRoad.z,
        z: normalizedRoad.x
      };
      
      // Road width is 15 units, make the corridor a bit wider (20 units)
      const roadWidth = 10;
      
      // Create four corners of the road corridor
      return [
        [startPoint[0] + perpendicular.x * roadWidth, startPoint[1] + perpendicular.z * roadWidth] as BoundaryPoint,
        [endPoint[0] + perpendicular.x * roadWidth, endPoint[1] + perpendicular.z * roadWidth] as BoundaryPoint,
        [endPoint[0] - perpendicular.x * roadWidth, endPoint[1] - perpendicular.z * roadWidth] as BoundaryPoint,
        [startPoint[0] - perpendicular.x * roadWidth, startPoint[1] - perpendicular.z * roadWidth] as BoundaryPoint
      ];
    }
    
    // Just return the boundary points for more complex road shapes
    return roadBoundary;
  }, [roadBoundary]);

  // Add saved boundaries to no-vegetation zones
  const allBoundaries = useMemo(() => {
    const boundaries: BoundaryPoint[][] = [];
    
    // Add road boundary if it exists
    if (roadBoundaryPolygon) {
      boundaries.push(roadBoundaryPolygon);
    }
    
    // Add other saved boundaries
    if (savedBoundaries && savedBoundaries.length > 0) {
      boundaries.push(...savedBoundaries);
    }
    
    return boundaries;
  }, [roadBoundaryPolygon, savedBoundaries]);
  
  // Check if a point is inside a polygon (using ray casting algorithm)
  const isPointInPolygon = (point: [number, number], polygon: BoundaryPoint[]): boolean => {
    if (!polygon || polygon.length < 3) return false;
    
    let inside = false;
    const x = point[0];
    const y = point[1];
    
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const xi = polygon[i][0];
      const yi = polygon[i][1];
      const xj = polygon[j][0];
      const yj = polygon[j][1];
      
      const intersect = ((yi > y) !== (yj > y)) &&
          (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
      
      if (intersect) inside = !inside;
    }
    
    return inside;
  };
  
  // Check if a point is inside any boundary
  const isPointInAnyBoundary = (point: [number, number]): boolean => {
    if (!allBoundaries || allBoundaries.length === 0) return false;
    
    for (const boundary of allBoundaries) {
      if (isPointInPolygon(point, boundary)) {
        return true;
      }
    }
    
    return false;
  };
  
  // Check if a position is near any solar panel
  const isNearSolarPanel = (x: number, z: number): boolean => {
    if (!isInitialized) return false;
    
    // Quick bounds check first
    if (x < panelBounds.minX || x > panelBounds.maxX || z < panelBounds.minZ || z > panelBounds.maxZ) {
      return false;
    }
    
    // If within the general bounds, check distance to each panel
    // This is more precise but more computationally expensive
    const safeDistance = 3; // Safe distance from any panel
    
    for (const pos of panelBounds.positions) {
      const dx = x - pos[0];
      const dz = z - pos[2];
      const distanceSquared = dx * dx + dz * dz;
      
      if (distanceSquared < safeDistance * safeDistance) {
        return true;
      }
    }
    
    return false;
  };
  
  // Generate positions for grass tufts
  const grassPositions = useMemo(() => {
    const positions = [];
    for (let i = 0; i < actualCount; i++) {
      // Position grass more densely across the terrain
      let x, z;
      
      // Try up to 10 times to find a valid position
      let tries = 0;
      let validPosition = false;
      
      while (!validPosition && tries < 10) {
        tries++;
        
        // Distribute vegetation widely across the whole terrain
        const angle = Math.random() * Math.PI * 2;
        const radius = minRadius + Math.random() * (maxRadius - minRadius); // Use minRadius to ensure minimum distance
        
        x = Math.cos(angle) * radius;
        z = Math.sin(angle) * radius;
        
        // Add more irregularity and natural clustering
        x += (Math.random() - 0.5) * 40;
        z += (Math.random() - 0.5) * 40;
        
        // Check if the position is within or near any solar panel
        if (isNearSolarPanel(x, z)) {
          continue;
        }
        
        // Check if the position is within any boundary (road, etc.)
        if (isPointInAnyBoundary([x, z])) {
          continue;
        }
        
        validPosition = true;
      }
      
      if (!validPosition) {
        continue; // Skip this element if we couldn't find a valid position
      }
      
      // Add slight elevation to make grass more visible (0.1 to 0.3 units above ground)
      const y = 0.1 + Math.random() * 0.2;
      positions.push([x, y, z]);
    }
    return positions;
  }, [actualCount, minRadius, maxRadius, panelBounds, isInitialized, isNearSolarPanel, isPointInAnyBoundary, allBoundaries]);
  
  // Generate positions for tall grass (a different type of grass)
  const tallGrassPositions = useMemo(() => {
    const positions = [];
    const tallGrassCount = Math.floor(actualCount / 2); // Half as many tall grass as regular grass
    
    for (let i = 0; i < tallGrassCount; i++) {
      let x, z;
      let tries = 0;
      let validPosition = false;
      
      while (!validPosition && tries < 10) {
        tries++;
        
        // Create more patches of tall grass across the terrain
        const angle = Math.random() * Math.PI * 2;
        const radius = minRadius + Math.random() * (maxRadius - minRadius);
        
        x = Math.cos(angle) * radius;
        z = Math.sin(angle) * radius;
        
        // Create more defined clusters for tall grass
        if (Math.random() > 0.3) { // Increase cluster probability
          x += (Math.random() - 0.5) * 25;
          z += (Math.random() - 0.5) * 25;
        }
        
        // Check if the position is within or near any solar panel
        if (isNearSolarPanel(x, z)) {
          continue;
        }
        
        // Check if the position is within any boundary (road, etc.)
        if (isPointInAnyBoundary([x, z])) {
          continue;
        }
        
        validPosition = true;
      }
      
      if (!validPosition) {
        continue; // Skip this element if we couldn't find a valid position
      }
      
      // Add more significant elevation to tall grass (0.15 to 0.4 units above ground)
      const y = 0.15 + Math.random() * 0.25;
      positions.push([x, y, z]);
    }
    return positions;
  }, [actualCount, minRadius, maxRadius, panelBounds, isInitialized, isNearSolarPanel, isPointInAnyBoundary, allBoundaries]);
  
  // Generate positions for rocks
  const rockPositions = useMemo(() => {
    const positions = [];
    // Reduce rock count to 1/4 of the total (was 1/3)
    const rockCount = Math.floor(actualCount / 4);
    
    for (let i = 0; i < rockCount; i++) {
      let x, z;
      let tries = 0;
      let validPosition = false;
      
      while (!validPosition && tries < 10) {
        tries++;
        
        // Distribute rocks more widely
        const angle = Math.random() * Math.PI * 2;
        const radius = minRadius + Math.random() * (maxRadius - minRadius);
        
        x = Math.cos(angle) * radius;
        z = Math.sin(angle) * radius;
        
        // Create more clusters of rocks
        if (Math.random() > 0.5) {
          x += (Math.random() - 0.5) * 50;
          z += (Math.random() - 0.5) * 50;
        }
        
        // Check if the position is within or near any solar panel
        if (isNearSolarPanel(x, z)) {
          continue;
        }
        
        // Check if the position is within any boundary (road, etc.)
        if (isPointInAnyBoundary([x, z])) {
          continue;
        }
        
        validPosition = true;
      }
      
      if (!validPosition) {
        continue; // Skip this element if we couldn't find a valid position
      }
      
      // Add slight elevation for rocks (0.1 to 0.5 units above ground)
      const y = 0.1 + Math.random() * 0.4;
      positions.push([x, y, z]);
    }
    return positions;
  }, [actualCount, minRadius, maxRadius, panelBounds, isInitialized, isNearSolarPanel, isPointInAnyBoundary, allBoundaries]);
  
  // Generate positions for small rocks
  const smallRockPositions = useMemo(() => {
    const positions = [];
    // Reduce small rock count to 1/4 of the total (was 1/2)
    const smallRockCount = Math.floor(actualCount / 4);
    
    for (let i = 0; i < smallRockCount; i++) {
      let x, z;
      let tries = 0;
      let validPosition = false;
      
      while (!validPosition && tries < 10) {
        tries++;
        
        // Small rocks can be more widespread
        const angle = Math.random() * Math.PI * 2;
        const radius = minRadius + Math.random() * (maxRadius - minRadius);
        
        x = Math.cos(angle) * radius;
        z = Math.sin(angle) * radius;
        
        // Small rocks tend to appear in larger groups
        if (Math.random() > 0.3) { // Increase clustering
          x += (Math.random() - 0.5) * 60; 
          z += (Math.random() - 0.5) * 60;
        }
        
        // Check if the position is within or near any solar panel
        if (isNearSolarPanel(x, z)) {
          continue;
        }
        
        // Check if the position is within any boundary (road, etc.)
        if (isPointInAnyBoundary([x, z])) {
          continue;
        }
        
        validPosition = true;
      }
      
      if (!validPosition) {
        continue; // Skip this element if we couldn't find a valid position
      }
      
      // Add slight elevation for small rocks (0.05 to 0.2 units above ground)
      const y = 0.05 + Math.random() * 0.15;
      positions.push([x, y, z]);
    }
    return positions;
  }, [actualCount, minRadius, maxRadius, panelBounds, isInitialized, isNearSolarPanel, isPointInAnyBoundary, allBoundaries]);
  
  // Use useEffect instead of useMemo for updating instanced meshes
  // so we can properly rely on the ref values being available
  useEffect(() => {
    if (instancedGrass.current) {
      const dummy = new THREE.Object3D();
      
      grassPositions.forEach((position, i) => {
        dummy.position.set(position[0], position[1], position[2]);
        
        // Increase size for better visibility, with more variation
        const scale = 0.5 + Math.random() * 1.0; // Larger scale range
        dummy.scale.set(scale, scale + Math.random() * 0.9, scale);
        
        // Random rotation
        dummy.rotation.y = Math.random() * Math.PI * 2;
        
        dummy.updateMatrix();
        instancedGrass.current.setMatrixAt(i, dummy.matrix);
      });
      
      // Update the instance matrix
      instancedGrass.current.instanceMatrix.needsUpdate = true;
    }
  }, [grassPositions, instancedGrass]);
  
  // Update instanced tall grass mesh matrices
  useEffect(() => {
    if (instancedTallGrass.current) {
      const dummy = new THREE.Object3D();
      
      tallGrassPositions.forEach((position, i) => {
        dummy.position.set(position[0], position[1], position[2]);
        
        // Increase size for better visibility
        const baseScale = 0.4 + Math.random() * 0.6; // Wider base
        const heightScale = 1.5 + Math.random() * 1.2; // Taller
        dummy.scale.set(baseScale, heightScale, baseScale);
        
        // Random rotation
        dummy.rotation.y = Math.random() * Math.PI * 2;
        
        dummy.updateMatrix();
        instancedTallGrass.current.setMatrixAt(i, dummy.matrix);
      });
      
      instancedTallGrass.current.instanceMatrix.needsUpdate = true;
    }
  }, [tallGrassPositions, instancedTallGrass]);
  
  // Update instanced rocks mesh matrices
  useEffect(() => {
    if (instancedRocks.current) {
      const dummy = new THREE.Object3D();
      
      rockPositions.forEach((position, i) => {
        dummy.position.set(position[0], position[1], position[2]);
        
        // Increase size for better visibility
        const scale = 0.4 + Math.random() * 1.1; // Larger rocks
        dummy.scale.set(
          scale * (0.7 + Math.random() * 0.6), 
          scale * (0.6 + Math.random() * 0.8), 
          scale * (0.7 + Math.random() * 0.6)
        );
        
        // Random rotation for natural look
        dummy.rotation.x = Math.random() * Math.PI;
        dummy.rotation.y = Math.random() * Math.PI * 2;
        dummy.rotation.z = Math.random() * Math.PI;
        
        dummy.updateMatrix();
        instancedRocks.current.setMatrixAt(i, dummy.matrix);
      });
      
      instancedRocks.current.instanceMatrix.needsUpdate = true;
    }
  }, [rockPositions, instancedRocks]);
  
  // Update instanced small rocks mesh matrices
  useEffect(() => {
    if (instancedSmallRocks.current) {
      const dummy = new THREE.Object3D();
      
      smallRockPositions.forEach((position, i) => {
        dummy.position.set(position[0], position[1], position[2]);
        
        // Increase size slightly for visibility
        const scale = 0.12 + Math.random() * 0.5; // Slightly larger
        dummy.scale.set(
          scale * (0.8 + Math.random() * 0.4),
          scale * (0.6 + Math.random() * 0.8),
          scale * (0.8 + Math.random() * 0.4)
        );
        
        // Random rotation for variety
        dummy.rotation.x = Math.random() * Math.PI;
        dummy.rotation.y = Math.random() * Math.PI * 2;
        dummy.rotation.z = Math.random() * Math.PI;
        
        dummy.updateMatrix();
        instancedSmallRocks.current.setMatrixAt(i, dummy.matrix);
      });
      
      instancedSmallRocks.current.instanceMatrix.needsUpdate = true;
    }
  }, [smallRockPositions, instancedSmallRocks]);
  
  return (
    <>
      {/* Instanced grass - brighter color */}
      <instancedMesh
        ref={instancedGrass}
        args={[undefined, undefined, grassPositions.length]}
        castShadow
        receiveShadow
      >
        <coneGeometry args={[1, 3, 8]} />
        <meshStandardMaterial 
          color="#85b555" // Brighter green for better visibility
          roughness={0.8}
          flatShading={true}
        />
      </instancedMesh>
      
      {/* Instanced tall grass - brighter color */}
      <instancedMesh
        ref={instancedTallGrass}
        args={[undefined, undefined, tallGrassPositions.length]}
        castShadow
        receiveShadow
      >
        <coneGeometry args={[0.8, 5, 6]} />
        <meshStandardMaterial 
          color="#7da348" // Brighter green for better visibility
          roughness={0.9}
          flatShading={true}
        />
      </instancedMesh>
      
      {/* Instanced rocks - lighter color */}
      <instancedMesh
        ref={instancedRocks}
        args={[undefined, undefined, rockPositions.length]}
        castShadow
        receiveShadow
      >
        <dodecahedronGeometry args={[1, 0]} />
        <meshStandardMaterial 
          color="#a9a9ad" // Lighter grey for better visibility
          roughness={0.9}
          metalness={0.1}
          flatShading={true}
        />
      </instancedMesh>
      
      {/* Instanced small rocks - lighter color */}
      <instancedMesh
        ref={instancedSmallRocks}
        args={[undefined, undefined, smallRockPositions.length]}
        castShadow
        receiveShadow
      >
        <icosahedronGeometry args={[1, 0]} />
        <meshStandardMaterial 
          color="#b8b8bd" // Lighter grey for better visibility
          roughness={0.8}
          metalness={0.2}
          flatShading={true}
        />
      </instancedMesh>
    </>
  );
}
