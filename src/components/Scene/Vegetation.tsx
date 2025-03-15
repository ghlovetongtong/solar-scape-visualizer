import React, { useMemo, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { usePanelPositions } from '@/hooks/usePanelPositions';
import { getHeightAtPosition } from './Ground';
import { BoundaryPoint } from '@/hooks/useDrawBoundary';

interface VegetationProps {
  count?: number;
  minRadius?: number;
  maxRadius?: number;
  savedBoundaries?: BoundaryPoint[][];
}

export default function Vegetation({ 
  count = 500, 
  minRadius = 120, 
  maxRadius = 180,
  savedBoundaries = []
}: VegetationProps) {
  const actualCount = count;
  
  const instancedGrass = useRef<THREE.InstancedMesh>(null);
  const instancedRocks = useRef<THREE.InstancedMesh>(null);
  const instancedSmallRocks = useRef<THREE.InstancedMesh>(null);
  const instancedTallGrass = useRef<THREE.InstancedMesh>(null);
  
  const { panelPositions, isInitialized } = usePanelPositions();
  
  const panelBounds = useMemo(() => {
    if (!isInitialized || panelPositions.length === 0) {
      return { minX: -120, maxX: 120, minZ: -120, maxZ: 120, positions: [] };
    }
    
    let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity;
    
    const positions: [number, number, number][] = panelPositions.map(panel => panel.position);
    
    positions.forEach(pos => {
      minX = Math.min(minX, pos[0]);
      maxX = Math.max(maxX, pos[0]);
      minZ = Math.min(minZ, pos[2]);
      maxZ = Math.max(maxZ, pos[2]);
    });
    
    const margin = 5;
    return {
      minX: minX - margin,
      maxX: maxX + margin,
      minZ: minZ - margin,
      maxZ: maxZ + margin,
      positions
    };
  }, [isInitialized, panelPositions]);
  
  const isWithinBoundary = (x: number, z: number): boolean => {
    const roadBuffer = 5;
    
    for (const boundary of savedBoundaries) {
      if (boundary.length < 3) continue;
      
      let inside = false;
      for (let i = 0, j = boundary.length - 1; i < boundary.length; j = i++) {
        const xi = boundary[i][0], zi = boundary[i][1];
        const xj = boundary[j][0], zj = boundary[j][1];
        
        const intersect = ((zi > z) !== (zj > z)) && 
                          (x < (xj - xi) * (z - zi) / (zj - zi) + xi);
        if (intersect) inside = !inside;
      }
      
      if (inside) return true;
      
      for (let i = 0, j = boundary.length - 1; i < boundary.length; j = i++) {
        const xi = boundary[i][0], zi = boundary[i][1];
        const xj = boundary[j][0], zj = boundary[j][1];
        
        const lineLength = Math.sqrt((xj - xi) * (xj - xi) + (zj - zi) * (zj - zi));
        if (lineLength === 0) continue;
        
        const t = Math.max(0, Math.min(1, ((x - xi) * (xj - xi) + (z - zi) * (zj - zi)) / (lineLength * lineLength)));
        const projX = xi + t * (xj - xi);
        const projZ = zi + t * (zj - zi);
        
        const distance = Math.sqrt((x - projX) * (x - projX) + (z - projZ) * (z - projZ));
        if (distance < roadBuffer) return true;
      }
    }
    return false;
  };
  
  const isNearSolarPanel = (x: number, z: number): boolean => {
    if (!isInitialized) return false;
    
    if (x < panelBounds.minX || x > panelBounds.maxX || z < panelBounds.minZ || z > panelBounds.maxZ) {
      return false;
    }
    
    const safeDistance = 5;
    
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
  
  const noise2D = (x: number, y: number): number => {
    const hash = (n: number): number => Math.sin(n) * 43758.5453 % 1;
    
    const xi = Math.floor(x);
    const yi = Math.floor(y);
    
    const xf = x - xi;
    const yf = y - yi;
    
    const u = xf * xf * (3 - 2 * xf);
    const v = yf * yf * (3 - 2 * yf);
    
    const a = hash(xi + yi * 57);
    const b = hash(xi + 1 + yi * 57);
    const c = hash(xi + (yi + 1) * 57);
    const d = hash(xi + 1 + (yi + 1) * 57);
    
    return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
  };
  
  const generatePositions = (count: number, type: 'grass' | 'tallGrass' | 'rock' | 'smallRock'): [number, number, number][] => {
    const positions: [number, number, number][] = [];
    const maxAttempts = count * 5;
    let attempts = 0;
    
    const densityFactor = {
      grass: 1.0,
      tallGrass: 0.8,
      rock: 0.6,
      smallRock: 0.7
    };
    
    const clusterCenters: {x: number, z: number, strength: number}[] = [];
    
    for (let i = 0; i < 30; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = minRadius * 0.7 + Math.random() * (maxRadius - minRadius * 0.7);
      
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      
      if (isNearSolarPanel(x, z) || isWithinBoundary(x, z)) continue;
      
      clusterCenters.push({
        x,
        z,
        strength: 0.3 + Math.random() * 0.6
      });
    }
    
    const rockyClusters: {x: number, z: number, radius: number}[] = [];
    if (type === 'rock' || type === 'smallRock') {
      for (let i = 0; i < 10; i++) {
        const angle = Math.random() * Math.PI * 2;
        const radius = minRadius * 0.5 + Math.random() * (maxRadius - minRadius * 0.5);
        
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        
        if (isNearSolarPanel(x, z) || isWithinBoundary(x, z)) continue;
        
        rockyClusters.push({
          x,
          z,
          radius: 10 + Math.random() * 25
        });
      }
    }
    
    while (positions.length < count && attempts < maxAttempts) {
      attempts++;
      let x, z;
      
      const strategy = Math.random();
      
      if (strategy < 0.3) {
        const angle = Math.random() * Math.PI * 2;
        const radius = minRadius + Math.random() * (maxRadius - minRadius);
        
        x = Math.cos(angle) * radius;
        z = Math.sin(angle) * radius;
        
        x += (Math.random() - 0.5) * 50;
        z += (Math.random() - 0.5) * 50;
      } else if (strategy < 0.8) {
        if (clusterCenters.length === 0) continue;
        
        const clusterIndex = Math.floor(Math.random() * clusterCenters.length);
        const cluster = clusterCenters[clusterIndex];
        
        const distance = Math.random() * 40 * cluster.strength;
        const angle = Math.random() * Math.PI * 2;
        
        x = cluster.x + Math.cos(angle) * distance;
        z = cluster.z + Math.sin(angle) * distance;
      } else {
        if ((type === 'rock' || type === 'smallRock') && rockyClusters.length > 0) {
          const clusterIndex = Math.floor(Math.random() * rockyClusters.length);
          const cluster = rockyClusters[clusterIndex];
          
          const distance = Math.random() * cluster.radius;
          const angle = Math.random() * Math.PI * 2;
          
          x = cluster.x + Math.cos(angle) * distance;
          z = cluster.z + Math.sin(angle) * distance;
        } else {
          const angle = Math.random() * Math.PI * 2;
          const radius = minRadius + Math.random() * (maxRadius - minRadius);
          
          x = Math.cos(angle) * radius;
          z = Math.sin(angle) * radius;
        }
      }
      
      const distanceFromCenter = Math.sqrt(x * x + z * z);
      if (distanceFromCenter < 12) continue;
      
      if (isNearSolarPanel(x, z) || isWithinBoundary(x, z)) {
        continue;
      }
      
      const noiseValue = noise2D(x / 100, z / 100);
      if (noiseValue < 0.4 && Math.random() > densityFactor[type]) {
        continue;
      }
      
      const y = type === 'tallGrass' ? 0.15 + Math.random() * 0.25 :
               type === 'grass' ? 0.1 + Math.random() * 0.2 :
               type === 'rock' ? 0.1 + Math.random() * 0.4 :
               0.05 + Math.random() * 0.15;
      
      positions.push([x, y, z]);
    }
    
    return positions;
  };
  
  const grassPositions = useMemo(() => 
    generatePositions(actualCount, 'grass'), 
    [actualCount, minRadius, maxRadius, panelBounds, isInitialized, savedBoundaries]);
  
  const tallGrassPositions = useMemo(() => 
    generatePositions(Math.floor(actualCount / 2), 'tallGrass'), 
    [actualCount, minRadius, maxRadius, panelBounds, isInitialized, savedBoundaries]);
  
  const rockPositions = useMemo(() => 
    generatePositions(Math.floor(actualCount / 4), 'rock'), 
    [actualCount, minRadius, maxRadius, panelBounds, isInitialized, savedBoundaries]);
  
  const smallRockPositions = useMemo(() => 
    generatePositions(Math.floor(actualCount / 3), 'smallRock'), 
    [actualCount, minRadius, maxRadius, panelBounds, isInitialized, savedBoundaries]);
  
  useEffect(() => {
    if (instancedGrass.current) {
      const dummy = new THREE.Object3D();
      
      grassPositions.forEach((position, i) => {
        dummy.position.set(position[0], position[1], position[2]);
        
        const scale = 0.5 + Math.random() * 1.0;
        dummy.scale.set(scale, scale + Math.random() * 0.9, scale);
        
        dummy.rotation.y = Math.random() * Math.PI * 2;
        
        dummy.updateMatrix();
        instancedGrass.current.setMatrixAt(i, dummy.matrix);
      });
      
      instancedGrass.current.instanceMatrix.needsUpdate = true;
    }
  }, [grassPositions, instancedGrass]);
  
  useEffect(() => {
    if (instancedTallGrass.current) {
      const dummy = new THREE.Object3D();
      
      tallGrassPositions.forEach((position, i) => {
        dummy.position.set(position[0], position[1], position[2]);
        
        const baseScale = 0.4 + Math.random() * 0.6;
        const heightScale = 1.5 + Math.random() * 1.2;
        dummy.scale.set(baseScale, heightScale, baseScale);
        
        dummy.rotation.y = Math.random() * Math.PI * 2;
        
        dummy.updateMatrix();
        instancedTallGrass.current.setMatrixAt(i, dummy.matrix);
      });
      
      instancedTallGrass.current.instanceMatrix.needsUpdate = true;
    }
  }, [tallGrassPositions, instancedTallGrass]);
  
  useEffect(() => {
    if (instancedRocks.current) {
      const dummy = new THREE.Object3D();
      
      rockPositions.forEach((position, i) => {
        dummy.position.set(position[0], position[1], position[2]);
        
        const scale = 0.4 + Math.random() * 1.1;
        dummy.scale.set(
          scale * (0.7 + Math.random() * 0.6),
          scale * (0.6 + Math.random() * 0.8),
          scale * (0.7 + Math.random() * 0.6)
        );
        
        dummy.rotation.x = Math.random() * Math.PI;
        dummy.rotation.y = Math.random() * Math.PI * 2;
        dummy.rotation.z = Math.random() * Math.PI;
        
        dummy.updateMatrix();
        instancedRocks.current.setMatrixAt(i, dummy.matrix);
      });
      
      instancedRocks.current.instanceMatrix.needsUpdate = true;
    }
  }, [rockPositions, instancedRocks]);
  
  useEffect(() => {
    if (instancedSmallRocks.current) {
      const dummy = new THREE.Object3D();
      
      smallRockPositions.forEach((position, i) => {
        dummy.position.set(position[0], position[1], position[2]);
        
        const scale = 0.12 + Math.random() * 0.5;
        dummy.scale.set(
          scale * (0.8 + Math.random() * 0.4),
          scale * (0.6 + Math.random() * 0.8),
          scale * (0.8 + Math.random() * 0.4)
        );
        
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
      <instancedMesh
        ref={instancedGrass}
        args={[undefined, undefined, actualCount]}
        castShadow
        receiveShadow
      >
        <coneGeometry args={[1, 3, 8]} />
        <meshStandardMaterial 
          color="#85b555"
          roughness={0.8}
          flatShading={true}
        />
      </instancedMesh>
      
      <instancedMesh
        ref={instancedTallGrass}
        args={[undefined, undefined, Math.floor(actualCount / 2)]}
        castShadow
        receiveShadow
      >
        <coneGeometry args={[0.8, 5, 6]} />
        <meshStandardMaterial 
          color="#7da348"
          roughness={0.9}
          flatShading={true}
        />
      </instancedMesh>
      
      <instancedMesh
        ref={instancedRocks}
        args={[undefined, undefined, Math.floor(actualCount / 4)]}
        castShadow
        receiveShadow
      >
        <dodecahedronGeometry args={[1, 0]} />
        <meshStandardMaterial 
          color="#a9a9ad"
          roughness={0.9}
          metalness={0.1}
          flatShading={true}
        />
      </instancedMesh>
      
      <instancedMesh
        ref={instancedSmallRocks}
        args={[undefined, undefined, Math.floor(actualCount / 3)]}
        castShadow
        receiveShadow
      >
        <icosahedronGeometry args={[1, 0]} />
        <meshStandardMaterial 
          color="#b8b8bd"
          roughness={0.8}
          metalness={0.2}
          flatShading={true}
        />
      </instancedMesh>
    </>
  );
}
