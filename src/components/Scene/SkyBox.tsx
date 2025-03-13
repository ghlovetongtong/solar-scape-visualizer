
import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useThree, useFrame } from '@react-three/fiber';

interface SkyBoxProps {
  timeOfDay: number;
}

export default function SkyBox({ timeOfDay }: SkyBoxProps) {
  const { scene } = useThree();
  const skyboxRef = useRef<THREE.Mesh>();
  
  // Different sky textures for different times of day
  const texturePaths = {
    dawn: '/lovable-uploads/photo-1426604966848-d7adac402bff',    // Early morning
    day: '/lovable-uploads/photo-1482938289607-e9573fc25ebb',     // Midday
    dusk: '/lovable-uploads/photo-1470071459604-3b5ec3a7fe05',    // Evening
    night: '/lovable-uploads/photo-1470813740244-df37b8c1edcb'    // Night
  };
  
  useEffect(() => {
    // Remove previous skybox if it exists
    const existingSkybox = scene.background;
    if (existingSkybox && existingSkybox instanceof THREE.CubeTexture) {
      existingSkybox.dispose();
    }

    // Select texture based on time of day
    let texturePath;
    if (timeOfDay < 0.25) {
      texturePath = texturePaths.dawn;
    } else if (timeOfDay < 0.5) {
      texturePath = texturePaths.day;
    } else if (timeOfDay < 0.75) {
      texturePath = texturePaths.dusk;
    } else {
      texturePath = texturePaths.night;
    }

    // Load texture and create skybox
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(
      texturePath,
      (texture) => {
        texture.mapping = THREE.EquirectangularReflectionMapping;
        scene.background = texture;
        
        // Apply color grading based on time of day
        if (timeOfDay < 0.25 || timeOfDay > 0.75) {
          // Dawn/dusk: warm tint
          scene.background.colorSpace = THREE.SRGBColorSpace;
        } else {
          // Day: neutral lighting
          scene.background.colorSpace = THREE.SRGBColorSpace;
        }
      },
      undefined,
      (error) => {
        console.error('Error loading skybox texture:', error);
      }
    );

    return () => {
      // Cleanup
      if (scene.background && scene.background instanceof THREE.Texture) {
        scene.background.dispose();
      }
    };
  }, [timeOfDay, scene]);

  return null; // This component doesn't render any mesh directly
}
