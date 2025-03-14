
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
  selectedInverterIndex: number | null;
  onDeselectInverter: () => void;
  onUpdatePanelPosition: (id: number, position: [number, number, number]) => void;
  onUpdatePanelRotation: (id: number, rotation: [number, number, number]) => void;
  drawingMode: boolean;
  setDrawingMode: (mode: boolean) => void;
  onSaveBoundary: () => void;
  onClearBoundary: () => void;
  onClearAllBoundaries?: () => void;
  onClearAllPanels?: () => void;
  onGenerateNewPanelsInBoundary?: () => void;
  onSaveLayout?: () => void;
}

export default function Controls({
  showStats,
  setShowStats,
  timeOfDay,
  setTimeOfDay,
  onResetPanels,
  selectedPanelId,
  selectedInverterIndex,
  onDeselectInverter,
  onUpdatePanelPosition,
  onUpdatePanelRotation,
  drawingMode,
  setDrawingMode,
  onSaveBoundary,
  onClearBoundary,
  onClearAllBoundaries,
  onClearAllPanels,
  onGenerateNewPanelsInBoundary,
  onSaveLayout
}: ControlsProps) {
  const [adjustValue, setAdjustValue] = useState(0.5);
  
  const handlePanelAdjustment = (axis: 'x' | 'y' | 'z', isRotation: boolean = false) => {
    if (selectedPanelId === null) {
      toast.error("No panel selected");
      return;
    }
    
    const scaledValue = (adjustValue - 0.5) * (isRotation ? 0.2 : 2);
    
    if (isRotation) {
      const rotation: [number, number, number] = [0, 0, 0];
      if (axis === 'x') rotation[0] = scaledValue;
      if (axis === 'y') rotation[1] = scaledValue;
      if (axis === 'z') rotation[2] = scaledValue;
      
      onUpdatePanelRotation(selectedPanelId, rotation);
    } else {
      const position: [number, number, number] = [0, 0, 0];
      if (axis === 'x') position[0] = scaledValue;
      if (axis === 'y') position[1] = scaledValue;
      if (axis === 'z') position[2] = scaledValue;
      
      onUpdatePanelPosition(selectedPanelId, position);
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
      
      {selectedPanelId !== null && (
        <div className="space-y-2 border-t border-gray-200 dark:border-gray-700 pt-2">
          <div className="text-sm font-medium">Selected Panel: #{selectedPanelId}</div>
          <Slider
            value={[adjustValue]}
            min={0}
            max={1}
            step={0.01}
            onValueChange={(values) => setAdjustValue(values[0])}
          />
          <div className="grid grid-cols-3 gap-1">
            <Button size="sm" onClick={() => handlePanelAdjustment('x')}>Move X</Button>
            <Button size="sm" onClick={() => handlePanelAdjustment('y')}>Move Y</Button>
            <Button size="sm" onClick={() => handlePanelAdjustment('z')}>Move Z</Button>
            <Button size="sm" onClick={() => handlePanelAdjustment('x', true)}>Rotate X</Button>
            <Button size="sm" onClick={() => handlePanelAdjustment('y', true)}>Rotate Y</Button>
            <Button size="sm" onClick={() => handlePanelAdjustment('z', true)}>Rotate Z</Button>
          </div>
        </div>
      )}
      
      {selectedInverterIndex !== null && (
        <div className="space-y-2 border-t border-gray-200 dark:border-gray-700 pt-2">
          <div className="text-sm font-medium">Selected Inverter: #{selectedInverterIndex + 1}</div>
          <Button 
            size="sm" 
            className="w-full"
            onClick={onDeselectInverter}
          >
            Deselect Inverter
          </Button>
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
        
        {/* Add the Save Layout button */}
        {onSaveLayout && (
          <Button 
            className="w-full mt-2" 
            variant="default"
            onClick={onSaveLayout}
          >
            Save Current Layout
          </Button>
        )}
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
