
import React, { useMemo } from 'react';
import * as THREE from 'three';

export default function Terrain() {
  // Create a larger plane for the ground
  const groundGeometry = useMemo(() => new THREE.PlaneGeometry(1000, 1000, 128, 128), []);
  
  // Apply some elevation to make the terrain more interesting
  useMemo(() => {
    if (groundGeometry) {
      const positions = groundGeometry.attributes.position.array;
      for (let i = 0; i < positions.length; i += 3) {
        // Skip the center area where the solar panels are
        const x = positions[i];
        const z = positions[i + 2];
        const distanceFromCenter = Math.sqrt(x * x + z * z);
        
        if (distanceFromCenter > 200) {
          // Add some gentle hills outside the solar farm area
          positions[i + 1] = Math.sin(x * 0.02) * Math.cos(z * 0.02) * 5;
        }
      }
      groundGeometry.computeVertexNormals();
    }
  }, [groundGeometry]);

  // Create texture procedurally instead of loading from external sources
  const groundTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const context = canvas.getContext('2d');
    
    if (!context) return null;
    
    // Draw base loess soil color (yellowish-brown)
    context.fillStyle = '#D7C28F';
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add some texture/noise
    for (let x = 0; x < canvas.width; x += 4) {
      for (let y = 0; y < canvas.height; y += 4) {
        const value = Math.random() * 0.1;
        const color = Math.floor(180 + value * 40);
        context.fillStyle = `rgba(${color}, ${Math.floor(color * 0.9)}, ${Math.floor(color * 0.6)}, 0.5)`;
        context.fillRect(x, y, 4, 4);
      }
    }
    
    // Create a few darker spots for variation
    for (let i = 0; i < 100; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      const radius = 3 + Math.random() * 10;
      context.fillStyle = 'rgba(160, 140, 100, 0.3)';
      context.beginPath();
      context.arc(x, y, radius, 0, Math.PI * 2);
      context.fill();
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(100, 100);
    return texture;
  }, []);
  
  // Create normal map procedurally
  const normalMap = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const context = canvas.getContext('2d');
    
    if (!context) return null;
    
    // Fill with neutral normal (pointing up)
    context.fillStyle = '#8080ff';
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add some bumps
    for (let i = 0; i < 2000; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      const radius = 1 + Math.random() * 3;
      const intensity = Math.random() * 0.2;
      
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
    texture.repeat.set(100, 100);
    return texture;
  }, []);
  
  // Function to get height at a specific position based on our terrain logic
  const getHeightAtPosition = (x: number, z: number) => {
    const distanceFromCenter = Math.sqrt(x * x + z * z);
    if (distanceFromCenter > 200) {
      // Apply the same elevation calculation as used for the terrain
      return Math.sin(x * 0.02) * Math.cos(z * 0.02) * 5;
    }
    return 0; // Flat in the solar panel area
  };
  
  return (
    <group>
      {/* Ground plane with loess (yellowish-brown soil) color and texture */}
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
          color="#D7C28F" 
          roughness={0.95} 
          metalness={0.05}
        />
      </mesh>
    </group>
  );
}
