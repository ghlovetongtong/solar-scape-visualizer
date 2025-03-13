
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

interface ControlsProps {
  showStats: boolean;
  setShowStats: (show: boolean) => void;
  timeOfDay: number;
  setTimeOfDay: (time: number) => void;
  onResetPanels: () => void;
  selectedPanelId: number | null;
  onUpdatePanelPosition: (id: number, position: [number, number, number]) => void;
  onUpdatePanelRotation: (id: number, rotation: [number, number, number]) => void;
}

export default function Controls({
  showStats,
  setShowStats,
  timeOfDay,
  setTimeOfDay,
  onResetPanels,
  selectedPanelId,
  onUpdatePanelPosition,
  onUpdatePanelRotation
}: ControlsProps) {
  const [panelX, setPanelX] = useState(0);
  const [panelY, setPanelY] = useState(0.5);
  const [panelZ, setPanelZ] = useState(0);
  const [rotX, setRotX] = useState(-Math.PI / 8);
  const [rotY, setRotY] = useState(0);
  const [rotZ, setRotZ] = useState(0);
  
  const handleApplyChanges = () => {
    if (selectedPanelId !== null) {
      onUpdatePanelPosition(selectedPanelId, [panelX, panelY, panelZ]);
      onUpdatePanelRotation(selectedPanelId, [rotX, rotY, rotZ]);
      toast.success(`Updated panel #${selectedPanelId+1} position and rotation`);
    }
  };
  
  const handleResetAll = () => {
    onResetPanels();
    toast.success("Reset all panels to original positions");
  };
  
  return (
    <div className="controls-panel w-80">
      <Card className="border-none shadow-none bg-transparent">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Solar Power Station Controls</CardTitle>
          <CardDescription>Manage and control the 3D visualization</CardDescription>
        </CardHeader>
        
        <CardContent className="px-2">
          <Tabs defaultValue="scene">
            <TabsList className="grid grid-cols-2 mb-4">
              <TabsTrigger value="scene">Scene</TabsTrigger>
              <TabsTrigger value="panel">Panel Editor</TabsTrigger>
            </TabsList>
            
            <TabsContent value="scene">
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="time-slider">Time of Day</Label>
                    <span className="text-sm text-muted-foreground">
                      {timeOfDay < 0.25 ? "Dawn" : 
                       timeOfDay < 0.5 ? "Morning" : 
                       timeOfDay < 0.75 ? "Afternoon" : "Dusk"}
                    </span>
                  </div>
                  <Slider 
                    id="time-slider"
                    min={0} 
                    max={1} 
                    step={0.01} 
                    value={[timeOfDay]} 
                    onValueChange={(values) => setTimeOfDay(values[0])} 
                  />
                </div>
                
                <div className="flex items-center space-x-2 pt-2">
                  <Button 
                    variant={showStats ? "default" : "outline"} 
                    onClick={() => setShowStats(!showStats)}
                    className="button"
                  >
                    {showStats ? "Hide Stats" : "Show Stats"}
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    onClick={handleResetAll}
                    className="button"
                  >
                    Reset All Panels
                  </Button>
                </div>
                
                <div className="pt-2">
                  <p className="text-sm text-muted-foreground">
                    Click on any panel to select it, then use the Panel Editor tab to adjust its position.
                  </p>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="panel">
              {selectedPanelId !== null ? (
                <div className="space-y-4">
                  <div className="mb-2">
                    <Label className="font-medium">Panel #{selectedPanelId + 1} Selected</Label>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="panel-x">Position X</Label>
                    <Slider 
                      id="panel-x"
                      min={-200} 
                      max={200} 
                      step={1} 
                      value={[panelX]} 
                      onValueChange={(values) => setPanelX(values[0])} 
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>-200</span>
                      <span>{panelX}</span>
                      <span>200</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="panel-y">Position Y (Height)</Label>
                    <Slider 
                      id="panel-y"
                      min={0} 
                      max={10} 
                      step={0.1} 
                      value={[panelY]} 
                      onValueChange={(values) => setPanelY(values[0])} 
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>0</span>
                      <span>{panelY.toFixed(1)}</span>
                      <span>10</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="panel-z">Position Z</Label>
                    <Slider 
                      id="panel-z"
                      min={-200} 
                      max={200} 
                      step={1} 
                      value={[panelZ]} 
                      onValueChange={(values) => setPanelZ(values[0])} 
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>-200</span>
                      <span>{panelZ}</span>
                      <span>200</span>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <Label htmlFor="rot-x">Rotation X (Tilt)</Label>
                    <Slider 
                      id="rot-x"
                      min={-Math.PI} 
                      max={Math.PI} 
                      step={0.01} 
                      value={[rotX]} 
                      onValueChange={(values) => setRotX(values[0])} 
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>-180°</span>
                      <span>{Math.round(rotX * 180 / Math.PI)}°</span>
                      <span>180°</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="rot-y">Rotation Y (Yaw)</Label>
                    <Slider 
                      id="rot-y"
                      min={-Math.PI} 
                      max={Math.PI} 
                      step={0.01} 
                      value={[rotY]} 
                      onValueChange={(values) => setRotY(values[0])} 
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>-180°</span>
                      <span>{Math.round(rotY * 180 / Math.PI)}°</span>
                      <span>180°</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="rot-z">Rotation Z (Roll)</Label>
                    <Slider 
                      id="rot-z"
                      min={-Math.PI} 
                      max={Math.PI} 
                      step={0.01} 
                      value={[rotZ]} 
                      onValueChange={(values) => setRotZ(values[0])} 
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>-180°</span>
                      <span>{Math.round(rotZ * 180 / Math.PI)}°</span>
                      <span>180°</span>
                    </div>
                  </div>
                  
                  <Button 
                    className="w-full button" 
                    onClick={handleApplyChanges}
                  >
                    Apply Changes
                  </Button>
                </div>
              ) : (
                <div className="py-8 text-center">
                  <p className="text-muted-foreground">No panel selected</p>
                  <p className="text-sm text-muted-foreground mt-2">Click on a panel in the scene to edit its position</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
