
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

export interface InstanceData {
  id: number;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
}

export function createInstancedMesh(
  geometry: THREE.BufferGeometry,
  material: THREE.Material | THREE.Material[],
  count: number
): THREE.InstancedMesh {
  const mesh = new THREE.InstancedMesh(geometry, Array.isArray(material) ? material[0] : material, count);
  mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

export function updateInstancedMesh(
  mesh: THREE.InstancedMesh,
  instances: InstanceData[]
): void {
  const matrix = new THREE.Matrix4();
  const quaternion = new THREE.Quaternion();
  
  instances.forEach((instance, index) => {
    const position = new THREE.Vector3(...instance.position);
    const euler = new THREE.Euler(...instance.rotation);
    quaternion.setFromEuler(euler);
    const scale = new THREE.Vector3(...instance.scale);
    
    matrix.compose(position, quaternion, scale);
    mesh.setMatrixAt(index, matrix);
  });
  
  mesh.instanceMatrix.needsUpdate = true;
}

export function generateGridPositions(
  count: number,
  spacing: number = 5,
  rowSize: number = 50
): InstanceData[] {
  const instances: InstanceData[] = [];
  
  for (let i = 0; i < count; i++) {
    const row = Math.floor(i / rowSize);
    const col = i % rowSize;
    
    instances.push({
      id: i,
      position: [col * spacing, 0, row * spacing],
      rotation: [0, 0, 0],
      scale: [1, 1, 1]
    });
  }
  
  return instances;
}

export function optimizeScene(scene: THREE.Scene): void {
  scene.traverse((object) => {
    if (object instanceof THREE.Mesh) {
      object.frustumCulled = true;
      
      if (object.geometry) {
        object.geometry.computeBoundingSphere();
        object.geometry.computeBoundingBox();
      }
    }
  });
}

// Add a utility function to calculate if a panel is in shadow
export function isPanelInShadow(
  panelPosition: [number, number, number],
  panelRotation: [number, number, number],
  sunDirection: THREE.Vector3
): boolean {
  // Create a normal vector (pointing up by default)
  const panelNormal = new THREE.Vector3(0, 1, 0);
  
  // Apply the panel's rotation to get its actual normal direction
  const rotation = new THREE.Euler(...panelRotation);
  panelNormal.applyEuler(rotation);
  
  // Calculate dot product between panel normal and sun direction
  const dotProduct = panelNormal.dot(sunDirection);
  
  // If dot product is negative or very small, panel faces away from sun
  return dotProduct < 0.2; // Threshold to consider a panel in shadow
}

// Enhanced function to get shadow intensity based on panel orientation
export function getShadowIntensity(
  panelRotation: [number, number, number],
  sunDirection: THREE.Vector3
): number {
  // Create a normal vector (pointing up by default)
  const panelNormal = new THREE.Vector3(0, 1, 0);
  
  // Apply the panel's rotation to get its actual normal direction
  const rotation = new THREE.Euler(...panelRotation);
  panelNormal.applyEuler(rotation);
  
  // Calculate dot product between panel normal and sun direction
  const dotProduct = panelNormal.dot(sunDirection);
  
  // Return a value between 0 and 1 representing how directly the panel faces the sun
  // 1 = directly facing the sun, 0 = completely away
  return Math.max(0, Math.min(1, dotProduct));
}
