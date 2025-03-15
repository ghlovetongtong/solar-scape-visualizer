
import React, { useMemo, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { getHeightAtPosition } from './Ground';

interface VegetationProps {
  count?: number;
  minRadius?: number;
  maxRadius?: number;
}

export default function Vegetation({ 
  count = 1000, 
  minRadius = 120, 
  maxRadius = 180 
}: VegetationProps) {
  // Double the vegetation density again
  const actualCount = count * 2;
  
  const instancedGrass = useRef<THREE.InstancedMesh>(null);
  const instancedRocks = useRef<THREE.InstancedMesh>(null);
  const instancedSmallRocks = useRef<THREE.InstancedMesh>(null);
  const instancedTallGrass = useRef<THREE.InstancedMesh>(null);
  
  // Generate positions for grass tufts
  const grassPositions = useMemo(() => {
    const positions = [];
    for (let i = 0; i < actualCount; i++) {
      // Position grass more densely across the terrain
      let x, z;
      
      // Distribute vegetation widely across the whole terrain
      const angle = Math.random() * Math.PI * 2;
      const radius = minRadius + Math.random() * (maxRadius - minRadius); // Use minRadius to ensure minimum distance
      
      x = Math.cos(angle) * radius;
      z = Math.sin(angle) * radius;
      
      // Add more irregularity and natural clustering
      x += (Math.random() - 0.5) * 40;
      z += (Math.random() - 0.5) * 40;
      
      // If we randomly generated a position inside the solar panel area, skip it
      const distanceFromCenter = Math.sqrt(x * x + z * z);
      if (distanceFromCenter < 95) { // Slightly reduce the restricted area
        i--; // Try again
        continue;
      }
      
      // Add slight elevation to make grass more visible (0.1 to 0.3 units above ground)
      const y = 0.1 + Math.random() * 0.2;
      positions.push([x, y, z]);
    }
    return positions;
  }, [actualCount, minRadius, maxRadius]);
  
  // Generate positions for tall grass (a different type of grass)
  const tallGrassPositions = useMemo(() => {
    const positions = [];
    const tallGrassCount = Math.floor(actualCount / 2); // Increase tall grass proportion
    
    for (let i = 0; i < tallGrassCount; i++) {
      let x, z;
      
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
      
      // Avoid solar panel area
      const distanceFromCenter = Math.sqrt(x * x + z * z);
      if (distanceFromCenter < 95) { // Slightly reduce the restricted area
        i--; // Try again
        continue;
      }
      
      // Add more significant elevation to tall grass (0.15 to 0.4 units above ground)
      const y = 0.15 + Math.random() * 0.25;
      positions.push([x, y, z]);
    }
    return positions;
  }, [actualCount, minRadius, maxRadius]);
  
  // Generate positions for rocks
  const rockPositions = useMemo(() => {
    const positions = [];
    // Increase rock count
    const rockCount = Math.floor(actualCount / 3);
    
    for (let i = 0; i < rockCount; i++) {
      let x, z;
      
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
      
      // Avoid solar panel area
      const distanceFromCenter = Math.sqrt(x * x + z * z);
      if (distanceFromCenter < 95) { // Slightly reduce the restricted area
        i--; // Try again
        continue;
      }
      
      // Add slight elevation for rocks (0.1 to 0.5 units above ground)
      const y = 0.1 + Math.random() * 0.4;
      positions.push([x, y, z]);
    }
    return positions;
  }, [actualCount, minRadius, maxRadius]);
  
  // Generate positions for small rocks
  const smallRockPositions = useMemo(() => {
    const positions = [];
    // Use even more small rocks for detail
    const smallRockCount = Math.floor(actualCount / 2);
    
    for (let i = 0; i < smallRockCount; i++) {
      let x, z;
      
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
      
      // Avoid solar panel area
      const distanceFromCenter = Math.sqrt(x * x + z * z);
      if (distanceFromCenter < 95) { // Slightly reduce the restricted area
        i--; // Try again
        continue;
      }
      
      // Add slight elevation for small rocks (0.05 to 0.2 units above ground)
      const y = 0.05 + Math.random() * 0.15;
      positions.push([x, y, z]);
    }
    return positions;
  }, [actualCount, minRadius, maxRadius]);
  
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
