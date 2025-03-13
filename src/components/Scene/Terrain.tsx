
import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useTexture } from '@react-three/drei';

export default function Terrain() {
  // Create a larger plane for the ground
  const groundGeometry = useMemo(() => new THREE.PlaneGeometry(1000, 1000, 128, 128), []);
  
  // Reference to the environment map image
  const environmentMapPath = '/lovable-uploads/615df015-84a0-4607-8c56-6239fffdcfcf.png';
  
  // Apply some gentle elevation to make the terrain more interesting
  useMemo(() => {
    if (groundGeometry) {
      const positions = groundGeometry.attributes.position.array;
      for (let i = 0; i < positions.length; i += 3) {
        // Skip the center area where the solar panels are
        const x = positions[i];
        const z = positions[i + 2];
        const distanceFromCenter = Math.sqrt(x * x + z * z);
        
        if (distanceFromCenter > 200) {
          // Add some very subtle undulations to mimic the sandy terrain
          positions[i + 1] = 
            Math.sin(x * 0.01) * Math.cos(z * 0.01) * 2 + 
            Math.sin(x * 0.03 + 0.5) * Math.sin(z * 0.02 + 0.5) * 1;
        }
      }
      groundGeometry.computeVertexNormals();
    }
  }, [groundGeometry]);

  // Create a sandy ground texture procedurally
  const groundTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const context = canvas.getContext('2d');
    
    if (!context) return null;
    
    // Base sandy color similar to the reference image
    context.fillStyle = '#D2BE98';
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add some texture variation for the sand
    for (let x = 0; x < canvas.width; x += 2) {
      for (let y = 0; y < canvas.height; y += 2) {
        const noise = Math.random() * 0.1;
        const value = 0.85 + noise;
        
        const r = Math.floor(210 * value);
        const g = Math.floor(190 * value);
        const b = Math.floor(152 * value);
        
        context.fillStyle = `rgba(${r}, ${g}, ${b}, 1)`;
        context.fillRect(x, y, 2, 2);
      }
    }
    
    // Add darker spots to simulate sand variations
    for (let i = 0; i < 2000; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      const radius = 1 + Math.random() * 5;
      const alpha = 0.1 + Math.random() * 0.2;
      
      context.fillStyle = `rgba(160, 140, 100, ${alpha})`;
      context.beginPath();
      context.arc(x, y, radius, 0, Math.PI * 2);
      context.fill();
    }
    
    // Add some subtle tracks and patterns in the sand
    for (let i = 0; i < 50; i++) {
      const x1 = Math.random() * canvas.width;
      const y1 = Math.random() * canvas.height;
      const x2 = x1 + (Math.random() - 0.5) * 100;
      const y2 = y1 + (Math.random() - 0.5) * 100;
      
      context.strokeStyle = `rgba(180, 160, 120, 0.4)`;
      context.lineWidth = 1 + Math.random() * 2;
      context.beginPath();
      context.moveTo(x1, y1);
      context.lineTo(x2, y2);
      context.stroke();
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(20, 20);
    return texture;
  }, []);
  
  // Create normal map procedurally for sand texture
  const normalMap = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const context = canvas.getContext('2d');
    
    if (!context) return null;
    
    // Fill with neutral normal (pointing up)
    context.fillStyle = '#8080ff';
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add some bumps for sand grain detail
    for (let i = 0; i < 5000; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      const radius = 0.5 + Math.random() * 2;
      const intensity = Math.random() * 0.15;
      
      // Create a radial gradient for each bump
      const gradient = context.createRadialGradient(x, y, 0, x, y, radius);
      gradient.addColorStop(0, `rgba(128, 128, ${255 - Math.floor(intensity * 100)}, 1)`);
      gradient.addColorStop(1, 'rgba(128, 128, 255, 0)');
      
      context.fillStyle = gradient;
      context.beginPath();
      context.arc(x, y, radius, 0, Math.PI * 2);
      context.fill();
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(20, 20);
    return texture;
  }, []);
  
  // Function to get height at a specific position based on our terrain logic
  const getHeightAtPosition = (x: number, z: number) => {
    const distanceFromCenter = Math.sqrt(x * x + z * z);
    if (distanceFromCenter > 200) {
      return Math.sin(x * 0.01) * Math.cos(z * 0.01) * 2 + 
             Math.sin(x * 0.03 + 0.5) * Math.sin(z * 0.02 + 0.5) * 1;
    }
    return 0; // Flat in the solar panel area
  };

  // Create sparse vegetation like in the reference image (only at the edges)
  const instancedGrass = useRef<THREE.InstancedMesh>(null);
  const grassCount = 800;
  const grassPositions = useMemo(() => {
    const positions = [];
    for (let i = 0; i < grassCount; i++) {
      // Position grass mainly in the outer areas and along borders
      let x, z;
      
      // Distribute vegetation along edges of the solar panel area
      const angle = Math.random() * Math.PI * 2;
      const minRadius = 220; // Slightly outside the 200 panel area
      const maxRadius = 400; // Don't go too far out
      const radius = minRadius + Math.random() * (maxRadius - minRadius);
      
      x = Math.cos(angle) * radius;
      z = Math.sin(angle) * radius;
      
      // Add some irregularity by introducing patches/clusters
      x += (Math.random() - 0.5) * 30;
      z += (Math.random() - 0.5) * 30;
      
      // If we randomly generated a position inside the solar panel area, skip it
      const distanceFromCenter = Math.sqrt(x * x + z * z);
      if (distanceFromCenter < 200) {
        i--; // Try again
        continue;
      }
      
      const y = getHeightAtPosition(x, z);
      positions.push([x, y, z]);
    }
    return positions;
  }, []);
  
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
      
      instancedGrass.current.instanceMatrix.needsUpdate = true;
    }
  }, [grassPositions]);
  
  return (
    <group>
      {/* Ground plane with sandy texture */}
      <mesh 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, 0, 0]} 
        receiveShadow
      >
        <primitive object={groundGeometry} />
        <meshStandardMaterial 
          map={groundTexture || undefined}
          normalMap={normalMap || undefined}
          normalScale={new THREE.Vector2(0.5, 0.5)}
          color="#D2BE98"
          roughness={0.95} 
          metalness={0.05}
          envMapIntensity={0.4} 
        />
      </mesh>
      
      {/* Sparse vegetation - simple grass tufts */}
      <instancedMesh
        ref={instancedGrass}
        args={[undefined, undefined, grassCount]}
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
    </group>
  );
}
