
import React, { useMemo, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { usePanelPositions } from '@/hooks/usePanelPositions';
import { getHeightAtPosition } from './Ground';
import { BoundaryPoint } from '@/hooks/useDrawBoundary';

interface VegetationProps {
  count?: number;
  minRadius?: number;
  maxRadius?: number;
  savedBoundaries?: BoundaryPoint[][]; // Add boundaries for roads
}

export default function Vegetation({ 
  count = 1000, 
  minRadius = 120, 
  maxRadius = 180,
  savedBoundaries = []
}: VegetationProps) {
  // Vegetation density
  const actualCount = count * 2;
  
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
  
  // Check if a position is within any boundary (road)
  const isWithinBoundary = (x: number, z: number): boolean => {
    for (const boundary of savedBoundaries) {
      if (boundary.length < 3) continue; // Skip invalid boundaries
      
      // Use ray casting algorithm to determine if point is inside polygon
      let inside = false;
      for (let i = 0, j = boundary.length - 1; i < boundary.length; j = i++) {
        const xi = boundary[i][0], zi = boundary[i][1];
        const xj = boundary[j][0], zj = boundary[j][1];
        
        const intersect = ((zi > z) !== (zj > z)) && 
                          (x < (xj - xi) * (z - zi) / (zj - zi) + xi);
        if (intersect) inside = !inside;
      }
      
      // Also check if too close to boundary edges (buffer zone around roads)
      if (!inside) {
        const roadBuffer = 3; // Buffer distance from road edges
        for (let i = 0, j = boundary.length - 1; i < boundary.length; j = i++) {
          const xi = boundary[i][0], zi = boundary[i][1];
          const xj = boundary[j][0], zj = boundary[j][1];
          
          // Calculate distance from point to line segment
          const lineLength = Math.sqrt((xj - xi) * (xj - xi) + (zj - zi) * (zj - zi));
          if (lineLength === 0) continue;
          
          const t = Math.max(0, Math.min(1, ((x - xi) * (xj - xi) + (z - zi) * (zj - zi)) / (lineLength * lineLength)));
          const projX = xi + t * (xj - xi);
          const projZ = zi + t * (zj - zi);
          
          const distance = Math.sqrt((x - projX) * (x - projX) + (z - projZ) * (z - projZ));
          if (distance < roadBuffer) return true;
        }
      }
      
      if (inside) return true;
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
  
  // Use Perlin noise-like distribution for more natural clustering
  const noise2D = (x: number, y: number): number => {
    // Simple hash function
    const hash = (n: number): number => Math.sin(n) * 43758.5453 % 1;
    
    // Floor values
    const xi = Math.floor(x);
    const yi = Math.floor(y);
    
    // Fractional parts
    const xf = x - xi;
    const yf = y - yi;
    
    // Smooth interpolation
    const u = xf * xf * (3 - 2 * xf);
    const v = yf * yf * (3 - 2 * yf);
    
    // Four corners
    const a = hash(xi + yi * 57);
    const b = hash(xi + 1 + yi * 57);
    const c = hash(xi + (yi + 1) * 57);
    const d = hash(xi + 1 + (yi + 1) * 57);
    
    // Interpolate
    return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
  };
  
  // Generate positions with improved natural distribution
  const generatePositions = (count: number, type: 'grass' | 'tallGrass' | 'rock' | 'smallRock'): [number, number, number][] => {
    const positions: [number, number, number][] = [];
    const attempts = count * 3; // Allow more attempts to ensure we get close to the desired count
    
    // Define density maps for different vegetation types
    const densityFactor = {
      grass: 1.5,      // Higher density for grass
      tallGrass: 1.2,  // Medium-high density for tall grass
      rock: 0.8,       // Lower density for rocks
      smallRock: 1.0   // Medium density for small rocks
    };
    
    // Create clusters by dividing the space into sections
    const gridSize = 30;
    const gridCount = Math.ceil(maxRadius * 2 / gridSize);
    const clusterCenters: {x: number, z: number, strength: number}[] = [];
    
    // Generate random cluster centers
    for (let i = 0; i < 40; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = minRadius * 0.7 + Math.random() * (maxRadius - minRadius * 0.7);
      
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      
      // Avoid placing clusters near equipment
      if (isNearSolarPanel(x, z) || isWithinBoundary(x, z)) continue;
      
      clusterCenters.push({
        x,
        z,
        strength: 0.5 + Math.random() * 0.8 // Random cluster density
      });
    }
    
    // For rocks, create some rocky areas
    const rockyClusters: {x: number, z: number, radius: number}[] = [];
    if (type === 'rock' || type === 'smallRock') {
      for (let i = 0; i < 15; i++) {
        const angle = Math.random() * Math.PI * 2;
        const radius = minRadius * 0.5 + Math.random() * (maxRadius - minRadius * 0.5);
        
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        
        // Avoid placing rocky areas near equipment
        if (isNearSolarPanel(x, z) || isWithinBoundary(x, z)) continue;
        
        rockyClusters.push({
          x,
          z,
          radius: 15 + Math.random() * 30 // Size of rocky area
        });
      }
    }
    
    for (let i = 0; i < attempts && positions.length < count; i++) {
      let x, z;
      
      // First approach: completely random points across the terrain
      if (Math.random() < 0.3) {
        const angle = Math.random() * Math.PI * 2;
        const radius = minRadius + Math.random() * (maxRadius - minRadius);
        
        x = Math.cos(angle) * radius;
        z = Math.sin(angle) * radius;
        
        // Add more natural randomness
        x += (Math.random() - 0.5) * 50;
        z += (Math.random() - 0.5) * 50;
      }
      // Second approach: cluster-based positioning
      else {
        // Select a random cluster as a starting point
        if (clusterCenters.length === 0) {
          continue; // Skip if no valid clusters
        }
        
        const clusterIndex = Math.floor(Math.random() * clusterCenters.length);
        const cluster = clusterCenters[clusterIndex];
        
        // Generate position near the cluster
        const distance = Math.random() * 40 * cluster.strength; // Stronger clusters create denser vegetation
        const angle = Math.random() * Math.PI * 2;
        
        x = cluster.x + Math.cos(angle) * distance;
        z = cluster.z + Math.sin(angle) * distance;
      }
      
      // For rocks, preferentially place them in rocky areas
      if ((type === 'rock' || type === 'smallRock') && rockyClusters.length > 0 && Math.random() < 0.7) {
        const clusterIndex = Math.floor(Math.random() * rockyClusters.length);
        const cluster = rockyClusters[clusterIndex];
        
        // Calculate distance from center of cluster
        const distance = Math.random() * cluster.radius;
        const angle = Math.random() * Math.PI * 2;
        
        x = cluster.x + Math.cos(angle) * distance;
        z = cluster.z + Math.sin(angle) * distance;
      }
      
      // Avoid being too close to the center (0,0)
      const distanceFromCenter = Math.sqrt(x * x + z * z);
      if (distanceFromCenter < 10) continue;
      
      // Check if the position is near any solar panel or within a road
      if (isNearSolarPanel(x, z) || isWithinBoundary(x, z)) {
        continue;
      }
      
      // Use noise to create more natural variations in density
      const noiseValue = noise2D(x / 100, z / 100);
      if (noiseValue < 0.4 && Math.random() > densityFactor[type]) {
        continue; // Skip based on noise value and density factor
      }
      
      // Place item at valid position
      const y = type === 'tallGrass' ? 0.15 + Math.random() * 0.25 :
               type === 'grass' ? 0.1 + Math.random() * 0.2 :
               type === 'rock' ? 0.1 + Math.random() * 0.4 :
               0.05 + Math.random() * 0.15; // smallRock
      
      positions.push([x, y, z]);
    }
    
    return positions;
  };
  
  // Generate positions for each vegetation type
  const grassPositions = useMemo(() => 
    generatePositions(actualCount, 'grass'), 
    [actualCount, minRadius, maxRadius, panelBounds, isInitialized, isWithinBoundary, isNearSolarPanel]);
  
  const tallGrassPositions = useMemo(() => 
    generatePositions(Math.floor(actualCount / 2), 'tallGrass'), 
    [actualCount, minRadius, maxRadius, panelBounds, isInitialized, isWithinBoundary, isNearSolarPanel]);
  
  const rockPositions = useMemo(() => 
    generatePositions(Math.floor(actualCount / 3), 'rock'), 
    [actualCount, minRadius, maxRadius, panelBounds, isInitialized, isWithinBoundary, isNearSolarPanel]);
  
  const smallRockPositions = useMemo(() => 
    generatePositions(Math.floor(actualCount / 2), 'smallRock'), 
    [actualCount, minRadius, maxRadius, panelBounds, isInitialized, isWithinBoundary, isNearSolarPanel]);
  
  // Use useEffect for updating instanced meshes
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
        args={[undefined, undefined, actualCount]}
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
        args={[undefined, undefined, Math.floor(actualCount / 2)]}
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
        args={[undefined, undefined, Math.floor(actualCount / 3)]}
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
        args={[undefined, undefined, Math.floor(actualCount / 2)]}
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
