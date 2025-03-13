
import React from 'react';
import Ground from './Ground';
import Vegetation from './Vegetation';

export default function Terrain() {
  return (
    <group>
      <Ground size={400} />
      <Vegetation />
    </group>
  );
}
