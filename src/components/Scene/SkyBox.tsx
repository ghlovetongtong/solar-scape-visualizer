
import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useThree } from '@react-three/fiber';
import { Sky } from '@react-three/drei';

interface SkyBoxProps {
  timeOfDay: number;
}

export default function SkyBox({ timeOfDay }: SkyBoxProps) {
  const { scene } = useThree();
  const skyRef = useRef<any>(null);
  
  // Calculate sun position based on time of day
  const phi = 2 * Math.PI * (timeOfDay - 0.5); // Full rotation
  const theta = Math.PI * (0.25 + 0.2 * Math.sin(phi)); // Elevation angle
  
  const sunPosition: [number, number, number] = [
    500 * Math.cos(phi) * Math.sin(theta),
    500 * Math.cos(theta),
    500 * Math.sin(phi) * Math.sin(theta)
  ];
  
  // Ultra-deep sky color parameters
  const mieCoefficient = timeOfDay < 0.2 || timeOfDay > 0.8 
    ? 0.0005 + 0.005 * Math.sin(Math.PI * timeOfDay) // Minimal scattering during sunrise/sunset
    : 0.0001; // Almost no scattering for extreme deep blue
    
  // Ultra high rayleigh for extremely deep sky colors
  const rayleigh = timeOfDay < 0.2 || timeOfDay > 0.8
    ? 5 + 3 * Math.sin(Math.PI * timeOfDay) // Higher during sunrise/sunset
    : 10; // Ultra high value for extremely deep blue
    
  // Extremely high turbidity for very dark, deep sky appearance
  const turbidity = 30 - 10 * Math.sin(Math.PI * timeOfDay); // Maximum turbidity for deepest possible sky
  
  useEffect(() => {
    // Cleanup previous background
    return () => {
      if (scene.background && scene.background instanceof THREE.Texture) {
        scene.background.dispose();
      }
    };
  }, [scene]);

  // Add a directional light to simulate sunlight
  const sunIntensity = Math.max(0.1, Math.sin(Math.PI * timeOfDay));
  
  return (
    <>
      <Sky
        ref={skyRef}
        distance={450000}
        sunPosition={sunPosition}
        mieCoefficient={mieCoefficient}
        mieDirectionalG={0.99}
        rayleigh={rayleigh}
        turbidity={turbidity}
      />
      
      {/* Add directional light to simulate sun */}
      <directionalLight 
        position={sunPosition} 
        intensity={sunIntensity * 1.5}
        castShadow
        shadow-mapSize={[2048, 2048]}
      />
      
      {/* Add ambient light for overall scene brightness */}
      <ambientLight intensity={0.2 + 0.3 * sunIntensity} />
      
      {/* Add hemisphere light for better ground illumination */}
      <hemisphereLight 
        color="#ffffff" 
        groundColor="#222222" 
        intensity={0.5 * sunIntensity} 
      />
    </>
  );
}
