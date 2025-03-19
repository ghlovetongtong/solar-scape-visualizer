
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
    ? 3 + 3 * Math.sin(Math.PI * timeOfDay) // Higher during sunrise/sunset
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

  return (
    <Sky
      ref={skyRef}
      distance={450000}
      sunPosition={sunPosition}
      mieCoefficient={mieCoefficient}
      mieDirectionalG={0.99} // Increased for even more directional scattering
      rayleigh={rayleigh}
      turbidity={turbidity}
    />
  );
}
