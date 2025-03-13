
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
  
  // Adjust sky parameters based on time of day
  const mieCoefficient = timeOfDay < 0.2 || timeOfDay > 0.8 
    ? 0.005 + 0.03 * Math.sin(Math.PI * timeOfDay) // More scattering during sunrise/sunset
    : 0.005; // Less scattering during day
    
  const rayleigh = timeOfDay < 0.2 || timeOfDay > 0.8
    ? 1 + Math.sin(Math.PI * timeOfDay) // Higher during sunrise/sunset (redder)
    : 1; // Normal during day
    
  const turbidity = 10 - 5 * Math.sin(Math.PI * timeOfDay); // More clouds/haziness at sunrise/sunset
  
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
      mieDirectionalG={0.8}
      rayleigh={rayleigh}
      turbidity={turbidity}
    />
  );
}
