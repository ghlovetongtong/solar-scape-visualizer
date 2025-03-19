
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
  
  // Optimized sun position calculation
  // Convert timeOfDay (0-1) to an angle in radians (0-2π)
  const angleRad = 2 * Math.PI * (timeOfDay - 0.5);
  
  // Calculate sun elevation - higher at noon, lower at dawn/dusk
  // Using a smoothed sine function for more realistic arc
  const elevation = Math.PI * (0.25 + 0.2 * Math.sin(angleRad));
  
  // Calculate distance (constant for now, but could vary)
  const distance = 500;
  
  // Convert spherical coordinates to Cartesian
  const sunPosition: [number, number, number] = [
    distance * Math.cos(angleRad) * Math.sin(elevation),
    distance * Math.cos(elevation),
    distance * Math.sin(angleRad) * Math.sin(elevation)
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
      distance={450000}
      sunPosition={sunPosition}
      mieCoefficient={mieCoefficient}
      mieDirectionalG={0.9} // Increased from 0.8 for more directional scattering
      rayleigh={rayleigh}
      turbidity={turbidity}
    />
  );
}
