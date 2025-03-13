
import * as THREE from 'three';

// Add the BufferGeometryUtils if it's not already available in THREE
if (!THREE.BufferGeometryUtils) {
  THREE.BufferGeometryUtils = {
    mergeBufferGeometries: (geometries: THREE.BufferGeometry[], useGroups = false): THREE.BufferGeometry => {
      const isIndexed = geometries[0].index !== null;
      const attributesUsed = new Set(Object.keys(geometries[0].attributes));
      const morphAttributesUsed = new Set(Object.keys(geometries[0].morphAttributes));
      const attributes: Record<string, THREE.BufferAttribute[]> = {};
      const morphAttributes: Record<string, THREE.BufferAttribute[]> = {};
      const morphTargetsRelative = geometries[0].morphTargetsRelative;
      const mergedGeometry = new THREE.BufferGeometry();
      let offset = 0;

      for (let i = 0; i < geometries.length; ++i) {
        const geometry = geometries[i];
        let attributesCount = 0;

        // Ensure all geometries have the same attributes
        if (isIndexed !== (geometry.index !== null)) {
          console.error('THREE.BufferGeometryUtils: .mergeBufferGeometries() failed with geometry at index ' + i + '. All geometries must have compatible attributes; make sure index attribute exists among all geometries, or in none of them.');
          return null;
        }

        // Gather all attributes from each geometry
        for (const name in geometry.attributes) {
          if (!attributesUsed.has(name)) {
            console.error('THREE.BufferGeometryUtils: .mergeBufferGeometries() failed with geometry at index ' + i + '. All geometries must have compatible attributes; make sure "' + name + '" attribute exists among all geometries, or in none of them.');
            return null;
          }
          
          if (attributes[name] === undefined) attributes[name] = [];
          attributes[name].push(geometry.attributes[name]);
          attributesCount++;
        }

        // Ensure all geometries have the same number of attributes
        if (attributesCount !== attributesUsed.size) {
          console.error('THREE.BufferGeometryUtils: .mergeBufferGeometries() failed with geometry at index ' + i + '. Make sure all geometries have the same number of attributes.');
          return null;
        }

        // Gather all morph attributes
        if (morphTargetsRelative !== geometry.morphTargetsRelative) {
          console.error('THREE.BufferGeometryUtils: .mergeBufferGeometries() failed with geometry at index ' + i + '. .morphTargetsRelative must be consistent throughout all geometries.');
          return null;
        }
        
        for (const name in geometry.morphAttributes) {
          if (!morphAttributesUsed.has(name)) {
            console.error('THREE.BufferGeometryUtils: .mergeBufferGeometries() failed with geometry at index ' + i + '.  .morphAttributes must be consistent throughout all geometries.');
            return null;
          }
          
          if (morphAttributes[name] === undefined) morphAttributes[name] = [];
          morphAttributes[name].push(geometry.morphAttributes[name]);
        }

        // Add offset to indices
        if (useGroups) {
          let count;
          if (isIndexed) {
            count = geometry.index.count;
          } else if (geometry.attributes.position !== undefined) {
            count = geometry.attributes.position.count;
          } else {
            console.error('THREE.BufferGeometryUtils: .mergeBufferGeometries() failed with geometry at index ' + i + '. The geometry must have either an index or a position attribute');
            return null;
          }
          
          mergedGeometry.addGroup(offset, count, i);
          offset += count;
        }
      }

      // Merge indices
      if (isIndexed) {
        let indexOffset = 0;
        const mergedIndex = [];
        
        for (let i = 0; i < geometries.length; ++i) {
          const index = geometries[i].index;
          
          for (let j = 0; j < index.count; ++j) {
            mergedIndex.push(index.getX(j) + indexOffset);
          }
          
          indexOffset += geometries[i].attributes.position.count;
        }
        
        mergedGeometry.setIndex(mergedIndex);
      }

      // Merge attributes
      for (const name in attributes) {
        const mergedAttribute = mergeBufferAttributes(attributes[name]);
        
        if (!mergedAttribute) {
          console.error('THREE.BufferGeometryUtils: .mergeBufferGeometries() failed while trying to merge the ' + name + ' attribute.');
          return null;
        }
        
        mergedGeometry.setAttribute(name, mergedAttribute);
      }

      // Merge morph attributes
      for (const name in morphAttributes) {
        const numMorphTargets = morphAttributes[name][0].length;
        
        if (numMorphTargets === 0) break;
        
        mergedGeometry.morphAttributes = mergedGeometry.morphAttributes || {};
        mergedGeometry.morphAttributes[name] = [];
        
        for (let i = 0; i < numMorphTargets; ++i) {
          const morphAttributesToMerge = [];
          
          for (let j = 0; j < morphAttributes[name].length; ++j) {
            morphAttributesToMerge.push(morphAttributes[name][j][i]);
          }
          
          const mergedMorphAttribute = mergeBufferAttributes(morphAttributesToMerge);
          
          if (!mergedMorphAttribute) {
            console.error('THREE.BufferGeometryUtils: .mergeBufferGeometries() failed while trying to merge the ' + name + ' morphAttribute.');
            return null;
          }
          
          mergedGeometry.morphAttributes[name].push(mergedMorphAttribute);
        }
      }

      return mergedGeometry;
    }
  };
}

// Helper function for merging buffer attributes
function mergeBufferAttributes(attributes: THREE.BufferAttribute[]): THREE.BufferAttribute | null {
  if (attributes.length === 0) return null;
  
  const TypedArray = attributes[0].array.constructor;
  const itemSize = attributes[0].itemSize;
  const normalized = attributes[0].normalized;
  let arrayLength = 0;
  
  for (let i = 0; i < attributes.length; ++i) {
    arrayLength += attributes[i].array.length;
  }
  
  const array = new TypedArray(arrayLength);
  let offset = 0;
  
  for (let i = 0; i < attributes.length; ++i) {
    array.set(attributes[i].array, offset);
    offset += attributes[i].array.length;
  }
  
  return new THREE.BufferAttribute(array, itemSize, normalized);
}

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
