
import React, { useRef, useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { useThree } from '@react-three/fiber';
import { Sky, useTexture } from '@react-three/drei';

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
  
  // Adjust sky parameters based on time of day - make sky darker overall
  const mieCoefficient = timeOfDay < 0.2 || timeOfDay > 0.8 
    ? 0.005 + 0.03 * Math.sin(Math.PI * timeOfDay) // More scattering during sunrise/sunset
    : 0.005; // Less scattering during day
    
  // Increased rayleigh value for deeper sky colors
  const rayleigh = timeOfDay < 0.2 || timeOfDay > 0.8
    ? 2 + Math.sin(Math.PI * timeOfDay) // Higher during sunrise/sunset (redder)
    : 2; // Increased for deeper blue during day (changed from 1 to 2)
    
  // Higher turbidity for overall darker sky appearance
  const turbidity = 12 - 5 * Math.sin(Math.PI * timeOfDay); // Increased from 10 to 12 for darker sky
  
  // Create a skybox with texture
  const skyboxTexture = useMemo(() => {
    // Create a new cube texture loader
    const loader = new THREE.CubeTextureLoader();
    
    // Load sky textures based on time of day
    if (timeOfDay < 0.2 || timeOfDay > 0.8) {
      // Sunset/sunrise skies - orangish/reddish
      return loader.load([
        'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/cube/skybox/px.jpg',
        'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/cube/skybox/nx.jpg',
        'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/cube/skybox/py.jpg',
        'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/cube/skybox/ny.jpg',
        'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/cube/skybox/pz.jpg',
        'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/cube/skybox/nz.jpg'
      ]);
    } else {
      // Day skies - blue tones
      return loader.load([
        'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/cube/skybox/px.jpg',
        'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/cube/skybox/nx.jpg',
        'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/cube/skybox/py.jpg',
        'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/cube/skybox/ny.jpg',
        'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/cube/skybox/pz.jpg',
        'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/cube/skybox/nz.jpg'
      ]);
    }
  }, [timeOfDay]);
  
  useEffect(() => {
    // Apply the skybox texture to the scene background
    scene.background = skyboxTexture;
    
    // Cleanup previous background on unmount or texture change
    return () => {
      if (scene.background && scene.background instanceof THREE.Texture) {
        scene.background.dispose();
      }
    };
  }, [scene, skyboxTexture]);

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
