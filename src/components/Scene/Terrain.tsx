
import React, { useMemo } from 'react';
import * as THREE from 'three';
import { useTexture } from '@react-three/drei';

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

  // Ground textures - creating a more realistic terrain with textures
  const [grassMap, soilMap, soilNormalMap] = useTexture([
    'https://cdn.jsdelivr.net/gh/pmndrs/drei-assets@master/textures/dirt_01.jpg',
    'https://cdn.jsdelivr.net/gh/pmndrs/drei-assets@master/textures/soil_01.jpg',
    'https://cdn.jsdelivr.net/gh/pmndrs/drei-assets@master/textures/soil_normal.jpg'
  ]);
  
  // Configure texture properties
  useMemo(() => {
    [grassMap, soilMap, soilNormalMap].forEach(texture => {
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(100, 100);
    });
  }, [grassMap, soilMap, soilNormalMap]);

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

      // Create clusters of grass for more realistic appearance
      const clusterSize = Math.floor(Math.random() * 3) + 1;
      for (let j = 0; j < clusterSize; j++) {
        const offsetX = (Math.random() - 0.5) * 2;
        const offsetZ = (Math.random() - 0.5) * 2;
        
        instances.push({
          position: [x + offsetX, 0, z + offsetZ],
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
          map={soilMap}
          normalMap={soilNormalMap}
          normalScale={new THREE.Vector2(0.5, 0.5)}
          color="#D7C28F" 
          roughness={0.95} 
          metalness={0.05}
        />
      </mesh>
      
      {/* Road */}
      <mesh 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, 0.05, 0]} 
        receiveShadow
      >
        <planeGeometry args={[15, 400]} />
        <meshStandardMaterial 
          color="#555555" 
          roughness={0.9} 
          metalness={0.1}
        />
      </mesh>
      
      {/* Road markings */}
      <mesh 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, 0.1, 0]} 
        receiveShadow
      >
        <planeGeometry args={[0.5, 400]} />
        <meshStandardMaterial 
          color="#ffffff" 
          roughness={0.5}
        />
      </mesh>

      {/* More realistic grass clumps scattered across the terrain */}
      {grassInstances.map((grass, index) => (
        <mesh
          key={`grass-${index}`}
          position={[grass.position[0], 0.05, grass.position[2]]}
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
        
        const scale = 2 + Math.random() * 3;
        return (
          <group 
            key={`bush-${index}`}
            position={[posX, 0, posZ]}
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
