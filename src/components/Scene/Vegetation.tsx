
import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { getHeightAtPosition } from './Ground';

interface VegetationProps {
  count?: number;
  minRadius?: number;
  maxRadius?: number;
}

export default function Vegetation({ 
  count = 1000, // Significantly increase the default count for more vegetation
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
      const radius = Math.random() * maxRadius; // Allow grass to appear anywhere
      
      x = Math.cos(angle) * radius;
      z = Math.sin(angle) * radius;
      
      // Add more irregularity and natural clustering
      x += (Math.random() - 0.5) * 40;
      z += (Math.random() - 0.5) * 40;
      
      // If we randomly generated a position inside the solar panel area, skip it
      const distanceFromCenter = Math.sqrt(x * x + z * z);
      if (distanceFromCenter < 100) {
        i--; // Try again
        continue;
      }
      
      // Use flat ground (y = 0)
      const y = 0;
      positions.push([x, y, z]);
    }
    return positions;
  }, [actualCount, maxRadius]);
  
  // Generate positions for tall grass (a different type of grass)
  const tallGrassPositions = useMemo(() => {
    const positions = [];
    const tallGrassCount = Math.floor(actualCount / 2); // Increase tall grass proportion
    
    for (let i = 0; i < tallGrassCount; i++) {
      let x, z;
      
      // Create more patches of tall grass across the terrain
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * maxRadius;
      
      x = Math.cos(angle) * radius;
      z = Math.sin(angle) * radius;
      
      // Create more defined clusters for tall grass
      if (Math.random() > 0.3) { // Increase cluster probability
        x += (Math.random() - 0.5) * 25;
        z += (Math.random() - 0.5) * 25;
      }
      
      // Avoid solar panel area
      const distanceFromCenter = Math.sqrt(x * x + z * z);
      if (distanceFromCenter < 105) {
        i--; // Try again
        continue;
      }
      
      const y = 0;
      positions.push([x, y, z]);
    }
    return positions;
  }, [actualCount, maxRadius]);
  
  // Generate positions for rocks
  const rockPositions = useMemo(() => {
    const positions = [];
    // Increase rock count
    const rockCount = Math.floor(actualCount / 3);
    
    for (let i = 0; i < rockCount; i++) {
      let x, z;
      
      // Distribute rocks more widely
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * maxRadius;
      
      x = Math.cos(angle) * radius;
      z = Math.sin(angle) * radius;
      
      // Create more clusters of rocks
      if (Math.random() > 0.5) {
        x += (Math.random() - 0.5) * 50;
        z += (Math.random() - 0.5) * 50;
      }
      
      // Avoid solar panel area
      const distanceFromCenter = Math.sqrt(x * x + z * z);
      if (distanceFromCenter < 110) {
        i--; // Try again
        continue;
      }
      
      const y = 0;
      positions.push([x, y, z]);
    }
    return positions;
  }, [actualCount, maxRadius]);
  
  // Generate positions for small rocks
  const smallRockPositions = useMemo(() => {
    const positions = [];
    // Use even more small rocks for detail
    const smallRockCount = Math.floor(actualCount / 2);
    
    for (let i = 0; i < smallRockCount; i++) {
      let x, z;
      
      // Small rocks can be more widespread
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * maxRadius;
      
      x = Math.cos(angle) * radius;
      z = Math.sin(angle) * radius;
      
      // Small rocks tend to appear in larger groups
      if (Math.random() > 0.3) { // Increase clustering
        x += (Math.random() - 0.5) * 60; 
        z += (Math.random() - 0.5) * 60;
      }
      
      // Avoid solar panel area
      const distanceFromCenter = Math.sqrt(x * x + z * z);
      if (distanceFromCenter < 105) {
        i--; // Try again
        continue;
      }
      
      const y = 0;
      positions.push([x, y, z]);
    }
    return positions;
  }, [actualCount, maxRadius]);
  
  // Update instanced grass mesh matrices
  useMemo(() => {
    if (instancedGrass.current) {
      const dummy = new THREE.Object3D();
      
      grassPositions.forEach((position, i) => {
        dummy.position.set(position[0], position[1], position[2]);
        
        // Random scale for grass tufts with more variation
        const scale = 0.3 + Math.random() * 0.8;
        dummy.scale.set(scale, scale + Math.random() * 0.7, scale);
        
        // Random rotation
        dummy.rotation.y = Math.random() * Math.PI * 2;
        
        dummy.updateMatrix();
        instancedGrass.current.setMatrixAt(i, dummy.matrix);
      });
      
      // Only update if needed
      if (instancedGrass.current.instanceMatrix) {
        instancedGrass.current.instanceMatrix.needsUpdate = true;
      }
    }
  }, [grassPositions]);
  
  // Update instanced tall grass mesh matrices
  useMemo(() => {
    if (instancedTallGrass.current) {
      const dummy = new THREE.Object3D();
      
      tallGrassPositions.forEach((position, i) => {
        dummy.position.set(position[0], position[1], position[2]);
        
        // Tall grass should be taller but thinner with more variation
        const baseScale = 0.25 + Math.random() * 0.5;
        const heightScale = 1.0 + Math.random() * 1.2; // More height variation
        dummy.scale.set(baseScale, heightScale, baseScale);
        
        // Random rotation
        dummy.rotation.y = Math.random() * Math.PI * 2;
        
        dummy.updateMatrix();
        instancedTallGrass.current.setMatrixAt(i, dummy.matrix);
      });
      
      if (instancedTallGrass.current.instanceMatrix) {
        instancedTallGrass.current.instanceMatrix.needsUpdate = true;
      }
    }
  }, [tallGrassPositions]);
  
  // Update instanced rocks mesh matrices
  useMemo(() => {
    if (instancedRocks.current) {
      const dummy = new THREE.Object3D();
      
      rockPositions.forEach((position, i) => {
        dummy.position.set(position[0], position[1], position[2]);
        
        // Random scale for rocks with more variation
        const scale = 0.25 + Math.random() * 0.9;
        // Varied scales for x, y, z to make rocks less uniform
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
      
      if (instancedRocks.current.instanceMatrix) {
        instancedRocks.current.instanceMatrix.needsUpdate = true;
      }
    }
  }, [rockPositions]);
  
  // Update instanced small rocks mesh matrices
  useMemo(() => {
    if (instancedSmallRocks.current) {
      const dummy = new THREE.Object3D();
      
      smallRockPositions.forEach((position, i) => {
        dummy.position.set(position[0], position[1], position[2]);
        
        // Small rocks with more variation
        const scale = 0.08 + Math.random() * 0.4;
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
      
      if (instancedSmallRocks.current.instanceMatrix) {
        instancedSmallRocks.current.instanceMatrix.needsUpdate = true;
      }
    }
  }, [smallRockPositions]);
  
  return (
    <>
      {/* Instanced grass */}
      <instancedMesh
        ref={instancedGrass}
        args={[undefined, undefined, actualCount]}
        castShadow
        receiveShadow
      >
        <coneGeometry args={[1, 3, 8]} />
        <meshStandardMaterial 
          color="#718355" 
          roughness={0.8}
          flatShading={true}
        />
      </instancedMesh>
      
      {/* Instanced tall grass */}
      <instancedMesh
        ref={instancedTallGrass}
        args={[undefined, undefined, Math.floor(actualCount / 2)]} // Increased count
        castShadow
        receiveShadow
      >
        <coneGeometry args={[0.8, 5, 6]} />
        <meshStandardMaterial 
          color="#5E7348" 
          roughness={0.9}
          flatShading={true}
        />
      </instancedMesh>
      
      {/* Instanced rocks */}
      <instancedMesh
        ref={instancedRocks}
        args={[undefined, undefined, Math.floor(actualCount / 3)]} // Increased count
        castShadow
        receiveShadow
      >
        <dodecahedronGeometry args={[1, 0]} />
        <meshStandardMaterial 
          color="#8A898C" 
          roughness={0.9}
          metalness={0.1}
          flatShading={true}
        />
      </instancedMesh>
      
      {/* Instanced small rocks */}
      <instancedMesh
        ref={instancedSmallRocks}
        args={[undefined, undefined, Math.floor(actualCount / 2)]} // Increased count
        castShadow
        receiveShadow
      >
        <icosahedronGeometry args={[1, 0]} />
        <meshStandardMaterial 
          color="#939398" 
          roughness={0.8}
          metalness={0.2}
          flatShading={true}
        />
      </instancedMesh>
    </>
  );
}
