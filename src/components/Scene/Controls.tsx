import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ChevronDown, ChevronUp, RotateCw, Settings, Sun } from 'lucide-react';

interface ControlsProps {
  showStats: boolean;
  setShowStats: (show: boolean) => void;
  timeOfDay: number;
  setTimeOfDay: (time: number) => void;
  onResetPanels: () => void;
  selectedPanelId: number | null;
  onUpdatePanelPosition: (id: number, position: [number, number, number]) => void;
  onUpdatePanelRotation: (id: number, rotation: [number, number, number]) => void;
  drawingMode: boolean;
  setDrawingMode: (enabled: boolean) => void;
  onSaveBoundary: () => void;
  onClearBoundary: () => void;
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
  drawingMode, 
  setDrawingMode,
  onSaveBoundary,
  onClearBoundary,
}: ControlsProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [activeTab, setActiveTab] = useState('time');
  
  // Panel position and rotation state
  const [posX, setPosX] = useState(0);
  const [posY, setPosY] = useState(0);
  const [posZ, setPosZ] = useState(0);
  const [rotX, setRotX] = useState(0);
  const [rotY, setRotY] = useState(0);
  const [rotZ, setRotZ] = useState(0);
  
  // Update panel position when slider changes
  const handlePositionChange = (axis: 'x' | 'y' | 'z', value: number) => {
    if (selectedPanelId === null) return;
    
    let newPos: [number, number, number] = [posX, posY, posZ];
    
    if (axis === 'x') {
      setPosX(value);
      newPos[0] = value;
    } else if (axis === 'y') {
      setPosY(value);
      newPos[1] = value;
    } else {
      setPosZ(value);
      newPos[2] = value;
    }
    
    onUpdatePanelPosition(selectedPanelId, newPos);
  };
  
  // Update panel rotation when slider changes
  const handleRotationChange = (axis: 'x' | 'y' | 'z', value: number) => {
    if (selectedPanelId === null) return;
    
    let newRot: [number, number, number] = [rotX, rotY, rotZ];
    
    if (axis === 'x') {
      setRotX(value);
      newRot[0] = value;
    } else if (axis === 'y') {
      setRotY(value);
      newRot[1] = value;
    } else {
      setRotZ(value);
      newRot[2] = value;
    }
    
    onUpdatePanelRotation(selectedPanelId, newRot);
  };

  return (
    <div className="absolute bottom-4 left-4 p-4 bg-black/80 text-white rounded-lg shadow-lg max-w-xs">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-sm font-medium">Solar Station Controls</h2>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-6 w-6" 
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
        </Button>
      </div>
      
      {isExpanded && (
        <>
          <Tabs defaultValue="time" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-3 mb-2">
              <TabsTrigger value="time" className="text-xs">
                <Sun className="h-3 w-3 mr-1" />
                Time
              </TabsTrigger>
              <TabsTrigger value="panels" className="text-xs">
                <RotateCw className="h-3 w-3 mr-1" />
                Panels
              </TabsTrigger>
              <TabsTrigger value="settings" className="text-xs">
                <Settings className="h-3 w-3 mr-1" />
                Settings
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="time" className="mt-0">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs">Time of Day</span>
                  <span className="text-xs">
                    {timeOfDay < 0.25 ? 'Sunrise' : 
                     timeOfDay < 0.5 ? 'Morning' : 
                     timeOfDay < 0.75 ? 'Afternoon' : 'Sunset'}
                  </span>
                </div>
                <Slider 
                  value={[timeOfDay]} 
                  min={0} 
                  max={1} 
                  step={0.01} 
                  onValueChange={([value]) => setTimeOfDay(value)} 
                />
              </div>
            </TabsContent>
            
            <TabsContent value="panels" className="mt-0">
              <div className="space-y-3">
                {selectedPanelId !== null ? (
                  <>
                    <div className="text-xs mb-1">Panel #{selectedPanelId} Selected</div>
                    
                    <div className="space-y-2">
                      <Label className="text-xs">Position</Label>
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <div className="flex justify-between">
                            <span className="text-xs">X</span>
                            <span className="text-xs">{posX.toFixed(1)}</span>
                          </div>
                          <Slider 
                            value={[posX]} 
                            min={-100} 
                            max={100} 
                            step={0.5} 
                            onValueChange={([value]) => handlePositionChange('x', value)} 
                          />
                        </div>
                        <div>
                          <div className="flex justify-between">
                            <span className="text-xs">Y</span>
                            <span className="text-xs">{posY.toFixed(1)}</span>
                          </div>
                          <Slider 
                            value={[posY]} 
                            min={0} 
                            max={10} 
                            step={0.1} 
                            onValueChange={([value]) => handlePositionChange('y', value)} 
                          />
                        </div>
                        <div>
                          <div className="flex justify-between">
                            <span className="text-xs">Z</span>
                            <span className="text-xs">{posZ.toFixed(1)}</span>
                          </div>
                          <Slider 
                            value={[posZ]} 
                            min={-100} 
                            max={100} 
                            step={0.5} 
                            onValueChange={([value]) => handlePositionChange('z', value)} 
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-xs">Rotation</Label>
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <div className="flex justify-between">
                            <span className="text-xs">X</span>
                            <span className="text-xs">{(rotX * 180 / Math.PI).toFixed(0)}°</span>
                          </div>
                          <Slider 
                            value={[rotX]} 
                            min={-Math.PI/2} 
                            max={Math.PI/2} 
                            step={0.01} 
                            onValueChange={([value]) => handleRotationChange('x', value)} 
                          />
                        </div>
                        <div>
                          <div className="flex justify-between">
                            <span className="text-xs">Y</span>
                            <span className="text-xs">{(rotY * 180 / Math.PI).toFixed(0)}°</span>
                          </div>
                          <Slider 
                            value={[rotY]} 
                            min={-Math.PI} 
                            max={Math.PI} 
                            step={0.01} 
                            onValueChange={([value]) => handleRotationChange('y', value)} 
                          />
                        </div>
                        <div>
                          <div className="flex justify-between">
                            <span className="text-xs">Z</span>
                            <span className="text-xs">{(rotZ * 180 / Math.PI).toFixed(0)}°</span>
                          </div>
                          <Slider 
                            value={[rotZ]} 
                            min={-Math.PI} 
                            max={Math.PI} 
                            step={0.01} 
                            onValueChange={([value]) => handleRotationChange('z', value)} 
                          />
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-xs text-center py-2">
                    Click on a panel to select it
                  </div>
                )}
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full text-xs mt-2"
                  onClick={onResetPanels}
                >
                  Reset All Panels
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="settings" className="mt-0">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs">Show FPS Stats</span>
                  <Switch
                    checked={showStats}
                    onCheckedChange={setShowStats}
                    className="data-[state=checked]:bg-blue-600"
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
          
          {/* Drawing controls section */}
          <div className="mt-4 border-t border-gray-700 pt-4">
            <h3 className="text-sm font-medium mb-2">Boundary Drawing</h3>
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs">Drawing Mode</span>
                <Switch
                  checked={drawingMode}
                  onCheckedChange={setDrawingMode}
                  className="data-[state=checked]:bg-green-600"
                />
              </div>
              
              <div className="flex gap-2 mt-2">
                <Button 
                  onClick={onSaveBoundary} 
                  variant="outline" 
                  size="sm" 
                  className="text-xs h-8"
                  disabled={!drawingMode}
                >
                  Save Boundary
                </Button>
                <Button 
                  onClick={onClearBoundary} 
                  variant="outline" 
                  size="sm" 
                  className="text-xs h-8"
                  disabled={!drawingMode}
                >
                  Clear
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
