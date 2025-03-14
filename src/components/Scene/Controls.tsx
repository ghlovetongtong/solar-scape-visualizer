import React from 'react';
import * as THREE from 'three';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export interface ControlsProps {
  showStats: boolean;
  setShowStats: (show: boolean) => void;
  timeOfDay: number;
  setTimeOfDay: (time: number) => void;
  drawingMode: boolean;
  setDrawingMode: (drawing: boolean) => void;
  onSaveBoundary: () => void;
  onClearBoundary: () => void;
  onClearAllBoundaries: () => void;
  onGeneratePanels: () => void;
  onClearAllPanels: () => void;
  onSaveLayout: () => void;
  onSaveAsDefaultLayout: () => void;
  selectedComponentType: 'panel' | 'inverter' | 'transformer' | 'camera' | 'itHouse' | null;
  updatePanelPosition?: (id: number, position: [number, number, number]) => void;
  updatePanelRotation?: (id: number, rotation: [number, number, number]) => void;
  updateInverterPosition?: (id: number, position: [number, number, number]) => void;
  updateTransformerPosition?: (id: number, position: [number, number, number]) => void;
  updateCameraPosition?: (id: number, position: [number, number, number]) => void;
  updateInverterRotation?: (id: number, rotation: [number, number, number]) => void;
  updateTransformerRotation?: (id: number, rotation: [number, number, number]) => void;
  updateCameraRotation?: (id: number, rotation: [number, number, number]) => void;
  onResetPanels?: () => void;
}

export default function Controls({
  showStats,
  setShowStats,
  timeOfDay,
  setTimeOfDay,
  drawingMode,
  setDrawingMode,
  onSaveBoundary,
  onClearBoundary,
  onClearAllBoundaries,
  onGeneratePanels,
  onClearAllPanels,
  onSaveLayout,
  onSaveAsDefaultLayout,
  selectedComponentType,
  updatePanelPosition,
  updatePanelRotation,
  updateInverterPosition,
  updateTransformerPosition,
  updateCameraPosition,
  updateInverterRotation,
  updateTransformerRotation,
  updateCameraRotation,
  onResetPanels
}: ControlsProps) {
  return (
    <div className="absolute bottom-4 left-4 bg-white p-4 rounded shadow-md z-50 w-64">
      <h2 className="text-lg font-semibold mb-2">Controls</h2>

      <div className="flex items-center justify-between mb-2">
        <Label htmlFor="stats">Show Stats</Label>
        <Switch id="stats" checked={showStats} onCheckedChange={setShowStats} />
      </div>

      <div className="mb-4">
        <Label htmlFor="timeOfDay" className="block text-sm font-medium text-gray-700">
          Time of Day
        </Label>
        <Slider
          id="timeOfDay"
          defaultValue={[timeOfDay * 100]}
          max={100}
          step={1}
          onValueChange={(value) => setTimeOfDay(value[0] / 100)}
          className="w-full"
        />
      </div>

      <div className="flex items-center justify-between mb-2">
        <Label htmlFor="drawingMode">Drawing Mode</Label>
        <Switch id="drawingMode" checked={drawingMode} onCheckedChange={setDrawingMode} />
      </div>

      {drawingMode && (
        <div className="mb-4">
          <Button variant="outline" onClick={onSaveBoundary} className="w-full mb-2">
            Save Boundary
          </Button>
          <Button variant="outline" onClick={onClearBoundary} className="w-full mb-2">
            Clear Boundary
          </Button>
          <Button variant="destructive" onClick={onClearAllBoundaries} className="w-full">
            Clear All Boundaries
          </Button>
        </div>
      )}

      <div className="mb-4">
        <Button variant="secondary" onClick={onGeneratePanels} className="w-full mb-2">
          Generate Panels in Boundaries
        </Button>
        <Button variant="secondary" onClick={onClearAllPanels} className="w-full mb-2">
          Clear All Panels
        </Button>
        <Button variant="secondary" onClick={onResetPanels} className="w-full mb-2">
          Reset Panel Positions
        </Button>
        <Button variant="outline" onClick={onSaveLayout} className="w-full mb-2">
          Save Layout
        </Button>
        <Button variant="outline" onClick={onSaveAsDefaultLayout} className="w-full">
          Save as Default Layout
        </Button>
      </div>

      {selectedComponentType && (
        <div className="mb-4">
          {selectedComponentType === 'panel' && (
            <>
              <h3 className="text-sm font-semibold mb-1">Adjust Panel</h3>
              <AdjustableControl
                label="Position X"
                onIncrement={() => updatePanelPosition?.(0, [0.1, 0, 0])}
                onDecrement={() => updatePanelPosition?.(0, [-0.1, 0, 0])}
              />
              <AdjustableControl
                label="Position Y"
                onIncrement={() => updatePanelPosition?.(0, [0, 0.1, 0])}
                onDecrement={() => updatePanelPosition?.(0, [0, -0.1, 0])}
              />
              <AdjustableControl
                label="Position Z"
                onIncrement={() => updatePanelPosition?.(0, [0, 0, 0.1])}
                onDecrement={() => updatePanelPosition?.(0, [0, 0, -0.1])}
              />
              <AdjustableControl
                label="Rotation X"
                onIncrement={() => updatePanelRotation?.(0, [0.01, 0, 0])}
                onDecrement={() => updatePanelRotation?.(0, [-0.01, 0, 0])}
              />
              <AdjustableControl
                label="Rotation Y"
                onIncrement={() => updatePanelRotation?.(0, [0, 0.01, 0])}
                onDecrement={() => updatePanelRotation?.(0, [0, -0.01, 0])}
              />
              <AdjustableControl
                label="Rotation Z"
                onIncrement={() => updatePanelRotation?.(0, [0, 0, 0.01])}
                onDecrement={() => updatePanelRotation?.(0, [0, 0, -0.01])}
              />
            </>
          )}
          {selectedComponentType === 'inverter' && (
            <>
              <h3 className="text-sm font-semibold mb-1">Adjust Inverter</h3>
              <AdjustableControl
                label="Position X"
                onIncrement={() => updateInverterPosition?.(0, [0.1, 0, 0])}
                onDecrement={() => updateInverterPosition?.(0, [-0.1, 0, 0])}
              />
              <AdjustableControl
                label="Position Y"
                onIncrement={() => updateInverterPosition?.(0, [0, 0.1, 0])}
                onDecrement={() => updateInverterPosition?.(0, [0, -0.1, 0])}
              />
              <AdjustableControl
                label="Position Z"
                onIncrement={() => updateInverterPosition?.(0, [0, 0, 0.1])}
                onDecrement={() => updateInverterPosition?.(0, [0, 0, -0.1])}
              />
              <AdjustableControl
                label="Rotation X"
                onIncrement={() => updateInverterRotation?.(0, [0.01, 0, 0])}
                onDecrement={() => updateInverterRotation?.(0, [-0.01, 0, 0])}
              />
              <AdjustableControl
                label="Rotation Y"
                onIncrement={() => updateInverterRotation?.(0, [0, 0.01, 0])}
                onDecrement={() => updateInverterRotation?.(0, [0, -0.01, 0])}
              />
              <AdjustableControl
                label="Rotation Z"
                onIncrement={() => updateInverterRotation?.(0, [0, 0, 0.01])}
                onDecrement={() => updateInverterRotation?.(0, [0, 0, -0.01])}
              />
            </>
          )}
          {selectedComponentType === 'transformer' && (
            <>
              <h3 className="text-sm font-semibold mb-1">Adjust Transformer</h3>
              <AdjustableControl
                label="Position X"
                onIncrement={() => updateTransformerPosition?.(0, [0.1, 0, 0])}
                onDecrement={() => updateTransformerPosition?.(0, [-0.1, 0, 0])}
              />
              <AdjustableControl
                label="Position Y"
                onIncrement={() => updateTransformerPosition?.(0, [0, 0.1, 0])}
                onDecrement={() => updateTransformerPosition?.(0, [0, -0.1, 0])}
              />
              <AdjustableControl
                label="Position Z"
                onIncrement={() => updateTransformerPosition?.(0, [0, 0, 0.1])}
                onDecrement={() => updateTransformerPosition?.(0, [0, 0, -0.1])}
              />
              <AdjustableControl
                label="Rotation X"
                onIncrement={() => updateTransformerRotation?.(0, [0.01, 0, 0])}
                onDecrement={() => updateTransformerRotation?.(0, [-0.01, 0, 0])}
              />
              <AdjustableControl
                label="Rotation Y"
                onIncrement={() => updateTransformerRotation?.(0, [0, 0.01, 0])}
                onDecrement={() => updateTransformerRotation?.(0, [0, -0.01, 0])}
              />
              <AdjustableControl
                label="Rotation Z"
                onIncrement={() => updateTransformerRotation?.(0, [0, 0, 0.01])}
                onDecrement={() => updateTransformerRotation?.(0, [0, 0, -0.01])}
              />
            </>
          )}
          {selectedComponentType === 'camera' && (
            <>
              <h3 className="text-sm font-semibold mb-1">Adjust Camera</h3>
              <AdjustableControl
                label="Position X"
                onIncrement={() => updateCameraPosition?.(0, [0.1, 0, 0])}
                onDecrement={() => updateCameraPosition?.(0, [-0.1, 0, 0])}
              />
              <AdjustableControl
                label="Position Y"
                onIncrement={() => updateCameraPosition?.(0, [0, 0.1, 0])}
                onDecrement={() => updateCameraPosition?.(0, [0, -0.1, 0])}
              />
              <AdjustableControl
                label="Position Z"
                onIncrement={() => updateCameraPosition?.(0, [0, 0, 0.1])}
                onDecrement={() => updateCameraPosition?.(0, [0, 0, -0.1])}
              />
              <AdjustableControl
                label="Rotation X"
                onIncrement={() => updateCameraRotation?.(0, [0.01, 0, 0])}
                onDecrement={() => updateCameraRotation?.(0, [-0.01, 0, 0])}
              />
              <AdjustableControl
                label="Rotation Y"
                onIncrement={() => updateCameraRotation?.(0, [0, 0.01, 0])}
                onDecrement={() => updateCameraRotation?.(0, [0, -0.01, 0])}
              />
              <AdjustableControl
                label="Rotation Z"
                onIncrement={() => updateCameraRotation?.(0, [0, 0, 0.01])}
                onDecrement={() => updateCameraRotation?.(0, [0, 0, -0.01])}
              />
            </>
          )}
        </div>
      )}
    </div>
  );
}

interface AdjustableControlProps {
  label: string;
  onIncrement: () => void;
  onDecrement: () => void;
}

function AdjustableControl({ label, onIncrement, onDecrement }: AdjustableControlProps) {
  return (
    <div className="flex items-center justify-between mb-1">
      <Label className="text-sm font-medium">{label}</Label>
      <div className="flex items-center space-x-2">
        <Button variant="outline" size="icon" onClick={onDecrement}>
          -
        </Button>
        <Button variant="outline" size="icon" onClick={onIncrement}>
          +
        </Button>
      </div>
    </div>
  );
}
