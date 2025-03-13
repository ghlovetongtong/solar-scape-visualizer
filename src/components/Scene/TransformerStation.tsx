
import React from 'react';
import * as THREE from 'three';
import { Text } from '@react-three/drei';

interface TransformerStationProps {
  position: THREE.Vector3;
  transformerIndex: number;
}

export default function TransformerStation({ position, transformerIndex }: TransformerStationProps) {
  return (
    <group position={position}>
      {/* Platform/base */}
      <mesh 
        receiveShadow 
        position={[0, 0.3, 0]}
      >
        <boxGeometry args={[10, 0.6, 8]} />
        <meshStandardMaterial color="#555555" roughness={0.8} />
      </mesh>
      
      {/* Main transformer cabinet */}
      <mesh 
        castShadow 
        receiveShadow 
        position={[0, 2.5, 0]}
      >
        <boxGeometry args={[6, 4, 4]} />
        <meshStandardMaterial color="#8a898c" roughness={0.5} metalness={0.4} />
      </mesh>
      
      {/* Cooling fins */}
      <mesh 
        castShadow 
        position={[-3.01, 2.5, 0]}
      >
        <boxGeometry args={[0.2, 3.5, 3.5]} />
        <meshStandardMaterial color="#777777" roughness={0.3} metalness={0.6} />
      </mesh>
      
      <mesh 
        castShadow 
        position={[3.01, 2.5, 0]}
      >
        <boxGeometry args={[0.2, 3.5, 3.5]} />
        <meshStandardMaterial color="#777777" roughness={0.3} metalness={0.6} />
      </mesh>
      
      {/* High voltage warning signs */}
      <mesh 
        position={[0, 2.5, 2.01]}
      >
        <planeGeometry args={[2, 1.5]} />
        <meshBasicMaterial 
          color="#ffff00"
          side={THREE.DoubleSide}
        />
      </mesh>
      
      <mesh 
        position={[0, 3.3, 2.02]}
      >
        <planeGeometry args={[1, 0.5]} />
        <meshBasicMaterial 
          color="#000000"
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {/* Electrical poles/insulators */}
      <mesh 
        castShadow 
        position={[2, 5, 0]}
      >
        <cylinderGeometry args={[0.1, 0.1, 3, 8]} />
        <meshStandardMaterial color="#dddddd" roughness={0.4} />
      </mesh>
      
      <mesh 
        castShadow 
        position={[0, 5, 0]}
      >
        <cylinderGeometry args={[0.1, 0.1, 3, 8]} />
        <meshStandardMaterial color="#dddddd" roughness={0.4} />
      </mesh>
      
      <mesh 
        castShadow 
        position={[-2, 5, 0]}
      >
        <cylinderGeometry args={[0.1, 0.1, 3, 8]} />
        <meshStandardMaterial color="#dddddd" roughness={0.4} />
      </mesh>
      
      {/* Transformer label */}
      <Text
        position={[0, 5, 2.5]}
        rotation={[0, 0, 0]}
        fontSize={0.5}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.04}
        outlineColor="#000000"
      >
        {`Transformer ${transformerIndex + 1}`}
      </Text>
    </group>
  );
}
