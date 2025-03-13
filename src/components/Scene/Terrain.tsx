
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

  // Add grass instances for visual detail
  const grassCount = 1000;
  const grassInstances = useMemo(() => {
    const instances = [];
    for (let i = 0; i < grassCount; i++) {
      // Generate random positions, avoiding the center solar farm area
      let x, z;
      do {
        x = (Math.random() - 0.5) * 900;
        z = (Math.random() - 0.5) * 900;
      } while (Math.sqrt(x * x + z * z) < 210); // Keep grass outside the solar farm

      instances.push({
        position: [x, 0, z],
        scale: 0.5 + Math.random() * 1.5,
        rotation: Math.random() * Math.PI
      });
    }
    return instances;
  }, []);
  
  return (
    <group>
      {/* Ground plane with loess (yellowish-brown soil) color */}
      <mesh 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, 0, 0]} 
        receiveShadow
      >
        <primitive object={groundGeometry} />
        <meshStandardMaterial 
          color="#D7C28F" 
          roughness={0.95} 
          metalness={0.05}
          // Create subtle color variations to make the ground look more natural
          onBeforeCompile={(shader) => {
            shader.fragmentShader = shader.fragmentShader.replace(
              '#include <color_fragment>',
              `
              #include <color_fragment>
              // Add noise to create soil texture variation
              float noise = sin(vUv.x * 100.0) * sin(vUv.y * 100.0) * 0.2;
              float largeNoise = sin(vUv.x * 5.0) * sin(vUv.y * 5.0) * 0.1;
              
              // Mix between two earth tones
              vec3 color1 = vec3(0.843, 0.761, 0.561); // Light loess
              vec3 color2 = vec3(0.761, 0.682, 0.502); // Darker loess
              vec3 colorMix = mix(color1, color2, noise + largeNoise + 0.5);
              
              diffuseColor.rgb = colorMix;
              `
            );
          }}
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

      {/* Grass clumps scattered across the terrain */}
      {grassInstances.map((grass, index) => (
        <mesh
          key={`grass-${index}`}
          position={[grass.position[0], 0.05, grass.position[2]]}
          rotation={[0, grass.rotation, 0]}
          castShadow
        >
          <group scale={[grass.scale, grass.scale, grass.scale]}>
            {/* Single grass blade */}
            <mesh rotation={[0, 0, 0.2]}>
              <boxGeometry args={[0.2, 1.5, 0.05]} />
              <meshStandardMaterial color="#568203" />
            </mesh>
            {/* Second grass blade */}
            <mesh rotation={[0, Math.PI / 3, -0.1]}>
              <boxGeometry args={[0.2, 1.3, 0.05]} />
              <meshStandardMaterial color="#4A7023" />
            </mesh>
            {/* Third grass blade */}
            <mesh rotation={[0, -Math.PI / 4, 0.3]}>
              <boxGeometry args={[0.15, 1.7, 0.05]} />
              <meshStandardMaterial color="#6B8E23" />
            </mesh>
          </group>
        </mesh>
      ))}
      
      {/* Terrain decoration - rocks */}
      <group position={[100, 0, -100]}>
        <mesh castShadow receiveShadow position={[0, 1, 0]}>
          <dodecahedronGeometry args={[3, 0]} />
          <meshStandardMaterial color="#888888" roughness={0.9} />
        </mesh>
        <mesh castShadow receiveShadow position={[4, 0.6, 3]}>
          <dodecahedronGeometry args={[2, 0]} />
          <meshStandardMaterial color="#888888" roughness={0.9} />
        </mesh>
        <mesh castShadow receiveShadow position={[-3, 0.4, -2]}>
          <dodecahedronGeometry args={[1.5, 0]} />
          <meshStandardMaterial color="#888888" roughness={0.9} />
        </mesh>
      </group>
      
      <group position={[-150, 0, 150]}>
        <mesh castShadow receiveShadow position={[0, 0.8, 0]}>
          <dodecahedronGeometry args={[2.5, 0]} />
          <meshStandardMaterial color="#888888" roughness={0.9} />
        </mesh>
        <mesh castShadow receiveShadow position={[3, 0.5, 2]}>
          <dodecahedronGeometry args={[1.7, 0]} />
          <meshStandardMaterial color="#888888" roughness={0.9} />
        </mesh>
      </group>
    </group>
  );
}
