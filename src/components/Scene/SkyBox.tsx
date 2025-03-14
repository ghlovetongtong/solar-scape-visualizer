
import React from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';

export interface SkyBoxProps {
  timeOfDay?: number;
}

export default function SkyBox({ timeOfDay = 0.5 }: SkyBoxProps) {
  const { scene } = useThree();
  
  // Choose sky texture based on time of day
  let skyTexture = 'https://i.imgur.com/A9UZ1Ol.jpeg'; // Default daytime sky
  
  React.useEffect(() => {
    const loader = new THREE.TextureLoader();
    
    // Load and set background
    loader.load(skyTexture, (texture) => {
      texture.mapping = THREE.EquirectangularReflectionMapping;
      texture.encoding = THREE.sRGBEncoding;
      scene.background = texture;
      scene.environment = texture;
    });
    
    // Cleanup on unmount
    return () => {
      if (scene.background instanceof THREE.Texture) {
        scene.background.dispose();
        scene.background = null;
      }
      if (scene.environment instanceof THREE.Texture) {
        scene.environment.dispose();
        scene.environment = null;
      }
    };
  }, [scene, skyTexture]);
  
  return null;
}
