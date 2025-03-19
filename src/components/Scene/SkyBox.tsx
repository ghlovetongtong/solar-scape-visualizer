
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
  
  // Adjust sky parameters for a much deeper sky color
  const mieCoefficient = timeOfDay < 0.2 || timeOfDay > 0.8 
    ? 0.003 + 0.01 * Math.sin(Math.PI * timeOfDay) // Less scattering during sunrise/sunset
    : 0.001; // Significantly reduced for deeper sky
    
  // Dramatically increased rayleigh for much deeper sky colors
  const rayleigh = timeOfDay < 0.2 || timeOfDay > 0.8
    ? 3 + 2 * Math.sin(Math.PI * timeOfDay) // Higher during sunrise/sunset
    : 4; // Much higher value for deeper blue during day
    
  // Much higher turbidity for darker, deeper sky appearance
  const turbidity = 18 - 8 * Math.sin(Math.PI * timeOfDay); // Significantly increased for deeper sky
  
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
      distance={3000}
      sunPosition={[1,1,1]}
      mieCoefficient={mieCoefficient}
      mieDirectionalG={0.1} // Increased from 0.8 for more directional scattering
      rayleigh={0.1}
      turbidity={turbidity}
      inclination={1}
      azimuth={0.5}
    />
  );
}
