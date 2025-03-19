
import React, { useRef, useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { useThree, useFrame } from '@react-three/fiber';
import { Sky, Cloud } from '@react-three/drei';

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
  
  // Cloud parameters - make them depend on time of day
  const cloudOpacity = useMemo(() => {
    // Clouds more visible during day, less during sunset/sunrise
    return timeOfDay > 0.25 && timeOfDay < 0.75 ? 0.9 : 0.7;
  }, [timeOfDay]);
  
  // Cloud positions
  const cloudPositions = useMemo(() => [
    { position: [50, 35, -100], scale: 10, speed: 0.2 },
    { position: [-80, 40, -40], scale: 12, speed: 0.1 },
    { position: [120, 45, 20], scale: 15, speed: 0.15 },
    { position: [-50, 38, 80], scale: 8, speed: 0.25 },
    { position: [100, 50, 150], scale: 18, speed: 0.12 },
    { position: [-120, 42, -140], scale: 14, speed: 0.18 },
    { position: [30, 55, 200], scale: 20, speed: 0.08 },
  ], []);
  
  return (
    <>
      <Sky
        ref={skyRef}
        distance={450000}
        sunPosition={sunPosition}
        mieCoefficient={mieCoefficient}
        mieDirectionalG={0.9} // Increased from 0.8 for more directional scattering
        rayleigh={rayleigh}
        turbidity={turbidity}
      />
      
      {/* Add volumetric clouds to the scene */}
      {cloudPositions.map((cloud, index) => (
        <MovingCloud 
          key={`cloud-${index}`}
          position={cloud.position}
          scale={cloud.scale}
          speed={cloud.speed}
          opacity={cloudOpacity}
        />
      ))}
    </>
  );
}

// Component for a cloud that moves slowly across the sky
interface MovingCloudProps {
  position: [number, number, number];
  scale: number;
  speed: number;
  opacity: number;
}

function MovingCloud({ position, scale, speed, opacity }: MovingCloudProps) {
  const cloudRef = useRef<THREE.Group>(null);
  const initialX = position[0];
  const rangeX = 300; // Total range of movement
  
  // Animate the cloud
  useFrame(({ clock }) => {
    if (cloudRef.current) {
      // Move clouds slowly along the x-axis
      const time = clock.getElapsedTime();
      const newX = initialX + Math.sin(time * speed) * rangeX;
      cloudRef.current.position.x = newX;
    }
  });
  
  return (
    <Cloud
      ref={cloudRef}
      position={position}
      scale={scale}
      opacity={opacity}
      speed={0} // Internal speed parameter (keep at 0 as we're animating manually)
      segments={6} // Lower segment count for better performance
      bounds={[50, 50, 50]} // Size of the cloud
      volume={0.6} // Volume/density of the cloud
      color={new THREE.Color(0xffffff)}
    />
  );
}
