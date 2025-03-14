import React, { useState } from 'react';
import { toast } from 'sonner';
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { BoundaryPoint } from '@/hooks/useDrawBoundary';

interface ControlsProps {
  showStats: boolean;
  setShowStats: (show: boolean) => void;
  timeOfDay: number;
  setTimeOfDay: (time: number) => void;
  onResetPanels: () => void;
  
  selectedPanelId: number | null;
  onUpdatePanelPosition: (id: number, position: [number, number, number]) => void;
  onUpdatePanelRotation: (id: number, rotation: [number, number, number]) => void;
  
  selectedComponentType: 'panel' | 'inverter' | 'transformer' | 'camera' | null;
  
  selectedInverterId: number | null;
  onUpdateInverterPosition: (id: number, position: [number, number, number]) => void;
  onUpdateInverterRotation: (id: number, rotation: [number, number, number]) => void;
  
  selectedTransformerId: number | null;
  onUpdateTransformerPosition: (id: number, position: [number, number, number]) => void;
  onUpdateTransformerRotation: (id: number, rotation: [number, number, number]) => void;
  
  selectedCameraId: number | null;
  onUpdateCameraPosition: (id: number, position: [number, number, number]) => void;
  onUpdateCameraRotation: (id: number, rotation: [number, number, number]) => void;
  
  drawingMode: boolean;
  setDrawingMode: (mode: boolean) => void;
  onSaveBoundary: () => void;
  onClearBoundary: () => void;
  onClearAllBoundaries?: () => void;
  onClearAllPanels?: () => void;
  onGenerateNewPanelsInBoundary?: () => void;
  onSaveLayout?: () => void;
  onSaveAsDefaultLayout?: () => void; // 新增保存为默认布局的回调
}

export default function Controls({
  showStats,
  setShowStats,
  timeOfDay,
  setTimeOfDay,
  onResetPanels,
  
  selectedPanelId,
  onUpdatePanelPosition,
  onUpdatePanelRotation,
  
  selectedComponentType,
  
  selectedInverterId,
  onUpdateInverterPosition,
  onUpdateInverterRotation,
  
  selectedTransformerId,
  onUpdateTransformerPosition,
  onUpdateTransformerRotation,
  
  selectedCameraId,
  onUpdateCameraPosition,
  onUpdateCameraRotation,
  
  drawingMode,
  setDrawingMode,
  onSaveBoundary,
  onClearBoundary,
  onClearAllBoundaries,
  onClearAllPanels,
  onGenerateNewPanelsInBoundary,
  onSaveLayout,
  onSaveAsDefaultLayout  // 新增
}: ControlsProps) {
  const [adjustValue, setAdjustValue] = useState(0.5);
  
  const getSelectedItemLabel = () => {
    switch (selectedComponentType) {
      case 'panel':
        return `Panel: #${selectedPanelId}`;
      case 'inverter':
        return `Inverter: #${selectedInverterId! + 1}`;
      case 'transformer':
        return `Transformer: #${selectedTransformerId! + 1}`;
      case 'camera':
        return `Camera: #${selectedCameraId! + 1}`;
      default:
        return null;
    }
  };
  
  const handleAdjustment = (axis: 'x' | 'y' | 'z', isRotation: boolean = false) => {
    if (!selectedComponentType) {
      toast.error("No component selected");
      return;
    }
    
    const scaledValue = (adjustValue - 0.5) * (isRotation ? 0.2 : 2);
    
    const position: [number, number, number] = [0, 0, 0];
    const rotation: [number, number, number] = [0, 0, 0];
    
    if (isRotation) {
      if (axis === 'x') rotation[0] = scaledValue;
      if (axis === 'y') rotation[1] = scaledValue;
      if (axis === 'z') rotation[2] = scaledValue;
    } else {
      if (axis === 'x') position[0] = scaledValue;
      if (axis === 'y') position[1] = scaledValue;
      if (axis === 'z') position[2] = scaledValue;
    }
    
    switch (selectedComponentType) {
      case 'panel':
        if (selectedPanelId !== null) {
          if (isRotation) {
            onUpdatePanelRotation(selectedPanelId, rotation);
          } else {
            onUpdatePanelPosition(selectedPanelId, position);
          }
        }
        break;
      case 'inverter':
        if (selectedInverterId !== null) {
          if (isRotation) {
            onUpdateInverterRotation(selectedInverterId, rotation);
          } else {
            onUpdateInverterPosition(selectedInverterId, position);
          }
        }
        break;
      case 'transformer':
        if (selectedTransformerId !== null) {
          if (isRotation) {
            onUpdateTransformerRotation(selectedTransformerId, rotation);
          } else {
            onUpdateTransformerPosition(selectedTransformerId, position);
          }
        }
        break;
      case 'camera':
        if (selectedCameraId !== null) {
          if (isRotation) {
            onUpdateCameraRotation(selectedCameraId, rotation);
          } else {
            onUpdateCameraPosition(selectedCameraId, position);
          }
        }
        break;
    }
  };
  
  const getTimeLabel = (timeValue: number) => {
    const hoursFloat = 5 + timeValue * 14;
    const hours = Math.floor(hoursFloat);
    const minutes = Math.floor((hoursFloat - hours) * 60);
    const period = hours >= 12 ? 'PM' : 'AM';
    const hour12 = hours % 12 === 0 ? 12 : hours % 12;
    return `${hour12}:${minutes.toString().padStart(2, '0')} ${period}`;
  };
  
  return (
    <div className="absolute left-4 bottom-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg max-w-xs space-y-4 border border-gray-200 dark:border-gray-700">
      <div className="text-lg font-bold">Solar Panel Controls</div>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Time of Day</label>
          <span className="text-sm text-gray-500">{getTimeLabel(timeOfDay)}</span>
        </div>
        <Slider
          value={[timeOfDay]}
          min={0}
          max={1}
          step={0.01}
          onValueChange={(values) => setTimeOfDay(values[0])}
        />
      </div>
      
      {selectedComponentType && (
        <div className="space-y-2 border-t border-gray-200 dark:border-gray-700 pt-2">
          <div className="text-sm font-medium">{getSelectedItemLabel()}</div>
          <Slider
            value={[adjustValue]}
            min={0}
            max={1}
            step={0.01}
            onValueChange={(values) => setAdjustValue(values[0])}
          />
          <div className="grid grid-cols-3 gap-1">
            <Button size="sm" onClick={() => handleAdjustment('x')}>Move X</Button>
            <Button size="sm" onClick={() => handleAdjustment('y')}>Move Y</Button>
            <Button size="sm" onClick={() => handleAdjustment('z')}>Move Z</Button>
            <Button size="sm" onClick={() => handleAdjustment('x', true)}>Rotate X</Button>
            <Button size="sm" onClick={() => handleAdjustment('y', true)}>Rotate Y</Button>
            <Button size="sm" onClick={() => handleAdjustment('z', true)}>Rotate Z</Button>
          </div>
        </div>
      )}
      
      <div className="space-y-2 border-t border-gray-200 dark:border-gray-700 pt-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Boundary Drawing Mode</label>
          <Switch
            checked={drawingMode}
            onCheckedChange={setDrawingMode}
          />
        </div>
        
        {drawingMode && (
          <>
            <div className="grid grid-cols-2 gap-1">
              <Button size="sm" onClick={onSaveBoundary}>Save Boundary</Button>
              <Button size="sm" variant="outline" onClick={onClearBoundary}>Clear Drawing</Button>
            </div>
            
            <div className="grid grid-cols-1 gap-1 mt-2">
              {onGenerateNewPanelsInBoundary && (
                <Button 
                  className="w-full" 
                  onClick={onGenerateNewPanelsInBoundary}
                  variant="default"
                >
                  Generate Panels in All Boundaries
                </Button>
              )}
              {onClearAllBoundaries && (
                <Button 
                  className="w-full" 
                  variant="outline" 
                  onClick={onClearAllBoundaries}
                >
                  Clear All Boundaries
                </Button>
              )}
            </div>
          </>
        )}
      </div>
      
      <div className="space-y-2 border-t border-gray-200 dark:border-gray-700 pt-2">
        <div className="text-sm font-medium">Panel Management</div>
        <div className="grid grid-cols-2 gap-1">
          <Button size="sm" variant="outline" onClick={onResetPanels}>Reset Panels</Button>
          {onClearAllPanels && (
            <Button 
              size="sm" 
              variant="destructive" 
              onClick={onClearAllPanels}
            >
              Clear All Panels
            </Button>
          )}
        </div>
        
        <div className="grid grid-cols-1 gap-1 mt-2">
          {onSaveLayout && (
            <Button 
              className="w-full" 
              variant="default"
              onClick={onSaveLayout}
            >
              Save Current Layout
            </Button>
          )}
          
          {onSaveAsDefaultLayout && (
            <Button 
              className="w-full mt-1" 
              variant="secondary"
              onClick={onSaveAsDefaultLayout}
            >
              Save As Default Layout
            </Button>
          )}
        </div>
      </div>
      
      <div className="flex flex-wrap gap-2 border-t border-gray-200 dark:border-gray-700 pt-2">
        <div className="flex items-center space-x-2">
          <Switch
            checked={showStats}
            onCheckedChange={setShowStats}
            id="stats-mode"
          />
          <label htmlFor="stats-mode" className="text-sm cursor-pointer">Stats</label>
        </div>
      </div>
    </div>
  );
}
