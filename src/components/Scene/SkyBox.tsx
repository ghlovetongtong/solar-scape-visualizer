
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
    return timeOfDay > 0.25 && timeOfDay < 0.75 ? 0.8 : 0.65;
  }, [timeOfDay]);
  
  // Enhanced cloud positions with larger scales and more variety
  const cloudPositions = useMemo(() => [
    { position: [50, 80, -300] as [number, number, number], scale: 25, speed: 0.12, volume: 0.8 },
    { position: [-150, 90, -200] as [number, number, number], scale: 30, speed: 0.08, volume: 0.9 },
    { position: [200, 100, -100] as [number, number, number], scale: 35, speed: 0.1, volume: 0.75 },
    { position: [-100, 85, 100] as [number, number, number], scale: 28, speed: 0.15, volume: 0.85 },
    { position: [180, 110, 250] as [number, number, number], scale: 40, speed: 0.06, volume: 0.9 },
    { position: [-220, 95, -240] as [number, number, number], scale: 32, speed: 0.09, volume: 0.8 },
    { position: [80, 115, 350] as [number, number, number], scale: 45, speed: 0.05, volume: 0.95 },
    { position: [-300, 105, 150] as [number, number, number], scale: 38, speed: 0.07, volume: 0.85 },
    { position: [250, 120, -350] as [number, number, number], scale: 42, speed: 0.04, volume: 0.9 },
    { position: [-150, 95, 320] as [number, number, number], scale: 36, speed: 0.11, volume: 0.8 },
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
      
      {/* Add more realistic volumetric clouds to the scene */}
      {cloudPositions.map((cloud, index) => (
        <MovingCloud 
          key={`cloud-${index}`}
          position={cloud.position}
          scale={cloud.scale}
          speed={cloud.speed}
          opacity={cloudOpacity}
          volume={cloud.volume}
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
  volume: number;
}

function MovingCloud({ position, scale, speed, opacity, volume }: MovingCloudProps) {
  const cloudRef = useRef<THREE.Group>(null);
  const initialX = position[0];
  const rangeX = 400; // Increased range of movement for more realistic cloud drift
  
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
      segments={8} // Increased segment count for more detailed clouds
      bounds={[100, 50, 100]} // Larger bounds for bigger clouds
      volume={volume} // Variable volume/density per cloud for more realism
      color={new THREE.Color(0xffffff)}
      depthTest={true}
      noisiness={0.6} // Increased noisiness for more natural, fluffy appearance
    />
  );
}
