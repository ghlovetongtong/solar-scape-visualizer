
import * as THREE from 'three';

/**
 * Creates a canvas-based texture for device labels
 * 
 * @param labelText The text to display on the label
 * @param options Optional configuration for the label appearance
 * @returns A THREE.CanvasTexture or null if canvas creation fails
 */
export function createDeviceLabel(
  labelText: string, 
  options: {
    fontSize?: number;
    fontWeight?: string;
    fontFamily?: string;
    textColor?: string;
    width?: number;
    height?: number;
  } = {}
): THREE.CanvasTexture | null {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  
  if (!context) return null;
  
  // Default values with customization options
  const width = options.width || 4096;  // Doubled from 2048
  const height = options.height || 2048;  // Doubled from 1024
  const fontSize = options.fontSize || 560;  // Doubled from 280
  const fontWeight = options.fontWeight || 'bold';
  const fontFamily = options.fontFamily || 'Arial, sans-serif';
  const textColor = options.textColor || '#ffffff';
  
  canvas.width = width;
  canvas.height = height;
  
  context.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillStyle = textColor;
  context.fillText(labelText, canvas.width / 2, canvas.height / 2);
  
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  
  return texture;
}
