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
  
  // Add grass instances for visual detail - using more realistic grass shapes
  const grassCount = 1500; // Increased grass count for better coverage
  const grassInstances = useMemo(() => {
    const instances = [];
    for (let i = 0; i < grassCount; i++) {
      // Generate random positions, avoiding the center solar farm area
      let x, z;
      do {
        x = (Math.random() - 0.5) * 900;
        z = (Math.random() - 0.5) * 900;
      } while (Math.sqrt(x * x + z * z) < 210); // Keep grass outside the solar farm

      // Get the proper height at this position
      const y = getHeightAtPosition(x, z);

      // Create clusters of grass for more realistic appearance
      const clusterSize = Math.floor(Math.random() * 3) + 1;
      for (let j = 0; j < clusterSize; j++) {
        const offsetX = (Math.random() - 0.5) * 2;
        const offsetZ = (Math.random() - 0.5) * 2;
        
        // Calculate height for this specific blade of grass
        const bladeX = x + offsetX;
        const bladeZ = z + offsetZ;
        const bladeY = getHeightAtPosition(bladeX, bladeZ);
        
        instances.push({
          position: [bladeX, bladeY, bladeZ], // Apply proper height
          scale: 0.3 + Math.random() * 1.2, // Smaller scale for more realism
          rotation: Math.random() * Math.PI,
          color: Math.random() > 0.5 ? "#568203" : "#4A7023", // Variation in grass color
          height: 0.8 + Math.random() * 1.4, // Variation in grass height
          bend: -0.2 + Math.random() * 0.4 // Random bend direction
        });
      }
    }
    return instances;
  }, []);
  
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
      
      {/* More realistic grass clumps scattered across the terrain */}
      {grassInstances.map((grass, index) => (
        <mesh
          key={`grass-${index}`}
          position={[grass.position[0], grass.position[1] + 0.05, grass.position[2]]} // Use calculated height plus small offset
          rotation={[0, grass.rotation, 0]}
          castShadow
        >
          <group scale={[grass.scale, grass.scale, grass.scale]}>
            {/* Improved grass blade - thinner and with varying heights */}
            <mesh rotation={[0, 0, grass.bend]}>
              <planeGeometry args={[0.1, grass.height, 2]} />
              <meshStandardMaterial 
                color={grass.color} 
                side={THREE.DoubleSide}
                alphaTest={0.5}
              />
            </mesh>
            {/* Second grass blade */}
            <mesh rotation={[0, Math.PI / 3, grass.bend - 0.1]}>
              <planeGeometry args={[0.1, grass.height * 0.9, 2]} />
              <meshStandardMaterial 
                color={grass.color === "#568203" ? "#4A7023" : "#568203"} 
                side={THREE.DoubleSide}
                alphaTest={0.5}
              />
            </mesh>
            {/* Third grass blade */}
            <mesh rotation={[0, -Math.PI / 4, grass.bend + 0.2]}>
              <planeGeometry args={[0.1, grass.height * 1.1, 2]} />
              <meshStandardMaterial 
                color="#6B8E23" 
                side={THREE.DoubleSide}
                alphaTest={0.5}
              />
            </mesh>
          </group>
        </mesh>
      ))}
      
      {/* Terrain decoration - rocks with more realistic textures */}
      <group position={[100, 0, -100]}>
        <mesh castShadow receiveShadow position={[0, 1, 0]}>
          <dodecahedronGeometry args={[3, 1]} />
          <meshStandardMaterial color="#7d7d7d" roughness={0.9} />
        </mesh>
        <mesh castShadow receiveShadow position={[4, 0.6, 3]}>
          <dodecahedronGeometry args={[2, 1]} />
          <meshStandardMaterial color="#6e6e6e" roughness={0.9} />
        </mesh>
        <mesh castShadow receiveShadow position={[-3, 0.4, -2]}>
          <dodecahedronGeometry args={[1.5, 1]} />
          <meshStandardMaterial color="#888888" roughness={0.9} />
        </mesh>
      </group>
      
      <group position={[-150, 0, 150]}>
        <mesh castShadow receiveShadow position={[0, 0.8, 0]}>
          <dodecahedronGeometry args={[2.5, 1]} />
          <meshStandardMaterial color="#7d7d7d" roughness={0.9} />
        </mesh>
        <mesh castShadow receiveShadow position={[3, 0.5, 2]}>
          <dodecahedronGeometry args={[1.7, 1]} />
          <meshStandardMaterial color="#6e6e6e" roughness={0.9} />
        </mesh>
      </group>
      
      {/* Sparse small bush-like vegetation */}
      {Array.from({ length: 30 }).map((_, index) => {
        const posX = (Math.random() - 0.5) * 800;
        const posZ = (Math.random() - 0.5) * 800;
        const distance = Math.sqrt(posX * posX + posZ * posZ);
        
        // Only place bushes outside the solar farm area
        if (distance < 220) return null;
        
        // Get the proper height for this bush
        const posY = getHeightAtPosition(posX, posZ);
        const scale = 2 + Math.random() * 3;
        
        return (
          <group 
            key={`bush-${index}`}
            position={[posX, posY, posZ]} // Apply proper height
            scale={[scale, scale, scale]}
          >
            <mesh castShadow receiveShadow>
              <sphereGeometry args={[1, 8, 8]} />
              <meshStandardMaterial color="#3a5f0b" roughness={1} />
            </mesh>
            <mesh castShadow receiveShadow position={[0.7, 0.2, 0]}>
              <sphereGeometry args={[0.8, 8, 8]} />
              <meshStandardMaterial color="#4b7413" roughness={1} />
            </mesh>
            <mesh castShadow receiveShadow position={[-0.5, 0.3, 0.5]}>
              <sphereGeometry args={[0.7, 8, 8]} />
              <meshStandardMaterial color="#3a5f0b" roughness={1} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}
