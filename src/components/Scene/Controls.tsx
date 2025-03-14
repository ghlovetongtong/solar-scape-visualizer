
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Toggle } from '@/components/ui/toggle';
import { Label } from '@/components/ui/label';
import { BoundaryPoint } from '@/hooks/useDrawBoundary';
import { Input } from '@/components/ui/input';

export interface ControlsProps {
  timeOfDay: number;
  setTimeOfDay: (value: number) => void;
  drawingMode: boolean;
  setDrawingMode: (value: boolean) => void;
  currentBoundary: BoundaryPoint[];
  onBoundaryComplete: (points: BoundaryPoint[]) => void;
  onSaveBoundary: () => void;
  onClearBoundary: () => void;
  onClearAllBoundaries: () => void;
  savedBoundariesCount: number;
  onGeneratePanels: () => void;
  onClearAllPanels: () => void;
  onSaveLayout: () => void;
  onSaveAsDefaultLayout: () => void;
  selectedComponentType: 'panel' | 'inverter' | 'transformer' | 'camera' | 'itHouse' | null;
  selectedComponentId: number | null;
  showStats: boolean;
  setShowStats: (value: boolean) => void;
  updateInverterPosition: (id: number, position: [number, number, number]) => void;
  updateTransformerPosition: (id: number, position: [number, number, number]) => void;
  updateCameraPosition: (id: number, position: [number, number, number]) => void;
  updateInverterRotation: (id: number, rotation: [number, number, number]) => void;
  updateTransformerRotation: (id: number, rotation: [number, number, number]) => void;
  updateCameraRotation: (id: number, rotation: [number, number, number]) => void;
}

export default function Controls({
  timeOfDay,
  setTimeOfDay,
  drawingMode,
  setDrawingMode,
  currentBoundary,
  onBoundaryComplete,
  onSaveBoundary,
  onClearBoundary,
  onClearAllBoundaries,
  savedBoundariesCount,
  onGeneratePanels,
  onClearAllPanels,
  onSaveLayout,
  onSaveAsDefaultLayout,
  selectedComponentType,
  selectedComponentId,
  showStats,
  setShowStats,
  updateInverterPosition,
  updateTransformerPosition,
  updateCameraPosition,
  updateInverterRotation,
  updateTransformerRotation,
  updateCameraRotation
}: ControlsProps) {
  const [positionDelta, setPositionDelta] = useState<{x: number, y: number, z: number}>({x: 0, y: 0, z: 0});
  const [rotationDelta, setRotationDelta] = useState<{x: number, y: number, z: number}>({x: 0, y: 0, z: 0});
  
  const timeLabels: {[key: number]: string} = {
    0: 'Sunrise',
    0.25: 'Morning',
    0.5: 'Noon',
    0.75: 'Afternoon',
    1.0: 'Sunset'
  };
  
  const getNearestTimeLabel = () => {
    const timePoints = Object.keys(timeLabels).map(Number);
    let closest = timePoints[0];
    let minDist = Math.abs(timeOfDay - closest);
    
    for (let i = 1; i < timePoints.length; i++) {
      const dist = Math.abs(timeOfDay - timePoints[i]);
      if (dist < minDist) {
        minDist = dist;
        closest = timePoints[i];
      }
    }
    
    return timeLabels[closest];
  };
  
  const handlePositionUpdate = () => {
    if (!selectedComponentId) return;
    
    const position: [number, number, number] = [positionDelta.x, positionDelta.y, positionDelta.z];
    
    if (selectedComponentType === 'inverter') {
      updateInverterPosition(selectedComponentId, position);
    } else if (selectedComponentType === 'transformer') {
      updateTransformerPosition(selectedComponentId, position);
    } else if (selectedComponentType === 'camera') {
      updateCameraPosition(selectedComponentId, position);
    }
    
    setPositionDelta({x: 0, y: 0, z: 0});
  };
  
  const handleRotationUpdate = () => {
    if (!selectedComponentId) return;
    
    const rotation: [number, number, number] = [
      rotationDelta.x * (Math.PI / 180),
      rotationDelta.y * (Math.PI / 180),
      rotationDelta.z * (Math.PI / 180)
    ];
    
    if (selectedComponentType === 'inverter') {
      updateInverterRotation(selectedComponentId, rotation);
    } else if (selectedComponentType === 'transformer') {
      updateTransformerRotation(selectedComponentId, rotation);
    } else if (selectedComponentType === 'camera') {
      updateCameraRotation(selectedComponentId, rotation);
    }
    
    setRotationDelta({x: 0, y: 0, z: 0});
  };
  
  const renderComponentControls = () => {
    if (!selectedComponentType || selectedComponentId === null) {
      return <div className="text-gray-500 italic">No component selected</div>;
    }
    
    return (
      <div className="space-y-4">
        <div>
          <div className="text-sm font-medium text-gray-700 mb-1">
            Selected: {selectedComponentType.charAt(0).toUpperCase() + selectedComponentType.slice(1)} {selectedComponentId + 1}
          </div>
          
          <div className="bg-gray-100 p-3 rounded-md">
            <div className="grid grid-cols-4 gap-2 mb-2">
              <Label htmlFor="position-x" className="col-span-1 flex items-center">X</Label>
              <Input
                id="position-x"
                type="number"
                className="col-span-3"
                value={positionDelta.x}
                onChange={e => setPositionDelta({...positionDelta, x: parseFloat(e.target.value) || 0})}
              />
              
              <Label htmlFor="position-y" className="col-span-1 flex items-center">Y</Label>
              <Input
                id="position-y"
                type="number"
                className="col-span-3"
                value={positionDelta.y}
                onChange={e => setPositionDelta({...positionDelta, y: parseFloat(e.target.value) || 0})}
              />
              
              <Label htmlFor="position-z" className="col-span-1 flex items-center">Z</Label>
              <Input
                id="position-z"
                type="number"
                className="col-span-3"
                value={positionDelta.z}
                onChange={e => setPositionDelta({...positionDelta, z: parseFloat(e.target.value) || 0})}
              />
            </div>
            
            <Button 
              size="sm" 
              onClick={handlePositionUpdate}
              disabled={!selectedComponentId}
              className="w-full"
            >
              Move
            </Button>
          </div>
        </div>
        
        <div>
          <div className="text-sm font-medium text-gray-700 mb-1">Rotation (degrees)</div>
          <div className="bg-gray-100 p-3 rounded-md">
            <div className="grid grid-cols-4 gap-2 mb-2">
              <Label htmlFor="rotation-x" className="col-span-1 flex items-center">X</Label>
              <Input
                id="rotation-x"
                type="number"
                className="col-span-3"
                value={rotationDelta.x}
                onChange={e => setRotationDelta({...rotationDelta, x: parseFloat(e.target.value) || 0})}
              />
              
              <Label htmlFor="rotation-y" className="col-span-1 flex items-center">Y</Label>
              <Input
                id="rotation-y"
                type="number"
                className="col-span-3"
                value={rotationDelta.y}
                onChange={e => setRotationDelta({...rotationDelta, y: parseFloat(e.target.value) || 0})}
              />
              
              <Label htmlFor="rotation-z" className="col-span-1 flex items-center">Z</Label>
              <Input
                id="rotation-z"
                type="number"
                className="col-span-3"
                value={rotationDelta.z}
                onChange={e => setRotationDelta({...rotationDelta, z: parseFloat(e.target.value) || 0})}
              />
            </div>
            
            <Button 
              size="sm" 
              onClick={handleRotationUpdate}
              disabled={!selectedComponentId}
              className="w-full"
            >
              Rotate
            </Button>
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <div className="absolute top-4 left-4 w-72 bg-white shadow-lg rounded-lg overflow-hidden">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">Solar Station Controls</h2>
      </div>
      
      <div className="p-4 space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label htmlFor="time-slider">Time of Day: {getNearestTimeLabel()}</Label>
          </div>
          <Slider
            id="time-slider"
            value={[timeOfDay]}
            min={0}
            max={1}
            step={0.01}
            onValueChange={(values) => setTimeOfDay(values[0])}
          />
        </div>
        
        <div className="border-t pt-4">
          <div className="text-sm font-medium text-gray-700 mb-4">Boundary Tools</div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="drawing-mode">Drawing Mode</Label>
              <Switch
                id="drawing-mode"
                checked={drawingMode}
                onCheckedChange={setDrawingMode}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={onSaveBoundary}
                disabled={currentBoundary.length < 3}
              >
                Save Boundary
              </Button>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={onClearBoundary}
                disabled={currentBoundary.length === 0}
              >
                Clear Boundary
              </Button>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={onClearAllBoundaries}
                disabled={savedBoundariesCount === 0}
              >
                Clear All Boundaries
              </Button>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={onGeneratePanels}
                disabled={savedBoundariesCount === 0}
              >
                Generate Panels
              </Button>
            </div>
          </div>
        </div>
        
        <div className="border-t pt-4">
          <div className="text-sm font-medium text-gray-700 mb-4">Panel Management</div>
          
          <div className="grid grid-cols-2 gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={onClearAllPanels}
            >
              Clear All Panels
            </Button>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={onSaveLayout}
            >
              Save Layout
            </Button>
          </div>
          
          <div className="mt-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={onSaveAsDefaultLayout}
              className="w-full"
            >
              Save As Default Layout
            </Button>
          </div>
        </div>
        
        <div className="border-t pt-4">
          <div className="text-sm font-medium text-gray-700 mb-4">Component Controls</div>
          {renderComponentControls()}
        </div>
        
        <div className="border-t pt-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="show-stats">Show Performance Stats</Label>
            <Switch
              id="show-stats"
              checked={showStats}
              onCheckedChange={setShowStats}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
