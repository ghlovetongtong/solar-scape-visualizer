
import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { getHeightAtPosition } from './Ground';

interface VegetationProps {
  count?: number;
  minRadius?: number;
  maxRadius?: number;
}

export default function Vegetation({ 
  count = 500, 
  minRadius = 120, 
  maxRadius = 180 
}: VegetationProps) {
  // Increase the default count for more vegetation
  const actualCount = count * 2; // Double the vegetation density
  
  const instancedGrass = useRef<THREE.InstancedMesh>(null);
  const instancedRocks = useRef<THREE.InstancedMesh>(null);
  const instancedSmallRocks = useRef<THREE.InstancedMesh>(null);
  const instancedTallGrass = useRef<THREE.InstancedMesh>(null);
  
  // Generate positions for grass tufts
  const grassPositions = useMemo(() => {
    const positions = [];
    for (let i = 0; i < actualCount; i++) {
      // Position grass mainly in the outer areas and along borders
      let x, z;
      
      // Distribute vegetation along edges of the solar panel area
      const angle = Math.random() * Math.PI * 2;
      const radius = minRadius + Math.random() * (maxRadius - minRadius);
      
      x = Math.cos(angle) * radius;
      z = Math.sin(angle) * radius;
      
      // Add some irregularity by introducing patches/clusters
      x += (Math.random() - 0.5) * 20;
      z += (Math.random() - 0.5) * 20;
      
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
  }, [actualCount, minRadius, maxRadius]);
  
  // Generate positions for tall grass (a different type of grass)
  const tallGrassPositions = useMemo(() => {
    const positions = [];
    const tallGrassCount = Math.floor(actualCount / 3);
    
    for (let i = 0; i < tallGrassCount; i++) {
      let x, z;
      
      // Create patches of tall grass in specific areas
      const angle = Math.random() * Math.PI * 2;
      const radius = minRadius * 0.9 + Math.random() * (maxRadius - minRadius * 0.9);
      
      x = Math.cos(angle) * radius;
      z = Math.sin(angle) * radius;
      
      // Create more defined clusters for tall grass
      if (Math.random() > 0.5) {
        // Create clusters
        x += (Math.random() - 0.5) * 15;
        z += (Math.random() - 0.5) * 15;
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
  }, [actualCount, minRadius, maxRadius]);
  
  // Generate positions for rocks
  const rockPositions = useMemo(() => {
    const positions = [];
    // Use fewer rocks than grass
    const rockCount = Math.floor(actualCount / 5);
    
    for (let i = 0; i < rockCount; i++) {
      // Position rocks in similar areas to grass but with different distribution
      let x, z;
      
      // Distribute rocks more randomly but still mainly in outer areas
      const angle = Math.random() * Math.PI * 2;
      const radius = minRadius * 0.8 + Math.random() * (maxRadius - minRadius * 0.8);
      
      x = Math.cos(angle) * radius;
      z = Math.sin(angle) * radius;
      
      // Create occasional clusters of rocks
      if (Math.random() > 0.7) {
        // Create a small cluster
        x += (Math.random() - 0.5) * 30;
        z += (Math.random() - 0.5) * 30;
      }
      
      // Avoid solar panel area
      const distanceFromCenter = Math.sqrt(x * x + z * z);
      if (distanceFromCenter < 110) {
        i--; // Try again
        continue;
      }
      
      // Use flat ground (y = 0)
      const y = 0;
      positions.push([x, y, z]);
    }
    return positions;
  }, [actualCount, minRadius, maxRadius]);
  
  // Generate positions for small rocks
  const smallRockPositions = useMemo(() => {
    const positions = [];
    // Use more small rocks for detail
    const smallRockCount = Math.floor(actualCount / 3);
    
    for (let i = 0; i < smallRockCount; i++) {
      let x, z;
      
      // Small rocks can be more widespread
      const angle = Math.random() * Math.PI * 2;
      const radius = (minRadius * 0.7) + Math.random() * (maxRadius - minRadius * 0.7);
      
      x = Math.cos(angle) * radius;
      z = Math.sin(angle) * radius;
      
      // Small rocks tend to appear in larger groups
      if (Math.random() > 0.4) {
        x += (Math.random() - 0.5) * 40; 
        z += (Math.random() - 0.5) * 40;
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
  }, [actualCount, minRadius, maxRadius]);
  
  // Update instanced grass mesh matrices
  useMemo(() => {
    if (instancedGrass.current) {
      const dummy = new THREE.Object3D();
      
      grassPositions.forEach((position, i) => {
        dummy.position.set(position[0], position[1], position[2]);
        
        // Random scale for each grass tuft - make them all smaller than default to match reference
        const scale = 0.4 + Math.random() * 0.6;
        dummy.scale.set(scale, scale + Math.random() * 0.5, scale);
        
        // Random rotation
        dummy.rotation.y = Math.random() * Math.PI * 2;
        
        dummy.updateMatrix();
        instancedGrass.current.setMatrixAt(i, dummy.matrix);
      });
      
      // Only update if needed - prevents unnecessary renders
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
        
        // Tall grass should be taller but thinner
        const baseScale = 0.3 + Math.random() * 0.4;
        const heightScale = 1.2 + Math.random() * 0.8;
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
        
        // Random scale for each rock - some bigger, some smaller
        const scale = 0.3 + Math.random() * 0.7;
        // Slightly varied scales for x, y, z to make rocks less uniform
        dummy.scale.set(
          scale * (0.8 + Math.random() * 0.4), 
          scale * (0.7 + Math.random() * 0.6), 
          scale * (0.8 + Math.random() * 0.4)
        );
        
        // Random rotation for natural look
        dummy.rotation.x = Math.random() * Math.PI;
        dummy.rotation.y = Math.random() * Math.PI * 2;
        dummy.rotation.z = Math.random() * Math.PI;
        
        dummy.updateMatrix();
        instancedRocks.current.setMatrixAt(i, dummy.matrix);
      });
      
      // Only update if needed
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
        
        // Small rocks should be actually small
        const scale = 0.1 + Math.random() * 0.3;
        dummy.scale.set(
          scale * (0.9 + Math.random() * 0.2),
          scale * (0.7 + Math.random() * 0.6),
          scale * (0.9 + Math.random() * 0.2)
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
        args={[undefined, undefined, Math.floor(actualCount / 3)]}
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
        args={[undefined, undefined, Math.floor(actualCount / 5)]}
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
        args={[undefined, undefined, Math.floor(actualCount / 3)]}
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
