
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Info, Settings, Activity, AlertTriangle, WifiOff, ChevronRight, RefreshCw } from 'lucide-react';

interface InverterDetailsPopupProps {
  isOpen: boolean;
  onClose: () => void;
  inverterData: {
    name: string;
    power: number;
    efficiency: number;
    mpptChannels: number;
    status: 'online' | 'offline' | 'warning' | 'error';
    temperature: number;
    dailyEnergy: number;
    totalEnergy: number;
    serialNumber: string;
    manufacturer: string;
    model: string;
    position: [number, number, number];
  } | null;
}

export default function InverterDetailsPopup({ 
  isOpen, 
  onClose, 
  inverterData 
}: InverterDetailsPopupProps) {
  if (!inverterData) return null;

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'online':
        return <Badge className="bg-green-500">Online</Badge>;
      case 'offline':
        return <Badge className="bg-gray-500">Offline</Badge>;
      case 'warning':
        return <Badge className="bg-yellow-500">Warning</Badge>;
      case 'error':
        return <Badge className="bg-red-500">Error</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'online':
        return <Activity className="text-green-500" />;
      case 'offline':
        return <WifiOff className="text-gray-500" />;
      case 'warning':
        return <AlertTriangle className="text-yellow-500" />;
      case 'error':
        return <AlertTriangle className="text-red-500" />;
      default:
        return <Info />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            {getStatusIcon(inverterData.status)}
            {inverterData.name}
            {getStatusBadge(inverterData.status)}
          </DialogTitle>
          <DialogDescription>
            {inverterData.manufacturer} {inverterData.model} - {inverterData.power}kW String Inverter
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="technical">Technical Data</TabsTrigger>
            <TabsTrigger value="location">Location</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4 py-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Current Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status:</span>
                      <span className="font-medium">{getStatusBadge(inverterData.status)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Temperature:</span>
                      <span className="font-medium">{inverterData.temperature}°C</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Efficiency:</span>
                      <span className="font-medium">{inverterData.efficiency}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Energy Production</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Today:</span>
                      <span className="font-medium">{inverterData.dailyEnergy} kWh</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Lifetime:</span>
                      <span className="font-medium">{inverterData.totalEnergy.toFixed(1)} MWh</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                <Button size="sm" className="flex items-center gap-1">
                  <RefreshCw className="h-4 w-4" />
                  Refresh Status
                </Button>
                <Button size="sm" variant="outline" className="flex items-center gap-1">
                  <Settings className="h-4 w-4" />
                  Configure
                </Button>
                <Button size="sm" variant="outline" className="flex items-center gap-1">
                  <Info className="h-4 w-4" />
                  Diagnostics
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="technical" className="py-2">
            <Card>
              <CardHeader>
                <CardTitle>Technical Specifications</CardTitle>
                <CardDescription>Detailed technical information about the inverter</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Specification</TableHead>
                      <TableHead>Value</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>Model</TableCell>
                      <TableCell>{inverterData.model}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Manufacturer</TableCell>
                      <TableCell>{inverterData.manufacturer}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Rated Power</TableCell>
                      <TableCell>{inverterData.power} kW</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Efficiency</TableCell>
                      <TableCell>{inverterData.efficiency}%</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>MPPT Channels</TableCell>
                      <TableCell>{inverterData.mpptChannels}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Serial Number</TableCell>
                      <TableCell>{inverterData.serialNumber}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Max PV Input Voltage</TableCell>
                      <TableCell>1100 V</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Max Input Current</TableCell>
                      <TableCell>30 A / MPPT</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Output Voltage</TableCell>
                      <TableCell>400 V</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Operating Temperature</TableCell>
                      <TableCell>-25°C to 60°C</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Ingress Protection</TableCell>
                      <TableCell>IP65</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Dimensions</TableCell>
                      <TableCell>650 x 520 x 210 mm</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Weight</TableCell>
                      <TableCell>43 kg</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="location" className="py-2">
            <Card>
              <CardHeader>
                <CardTitle>Location Information</CardTitle>
                <CardDescription>Physical location and installation details</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium mb-1">Coordinates in 3D Space</h3>
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      <div className="border rounded p-2">
                        <div className="text-xs text-muted-foreground">X Position</div>
                        <div className="font-mono">{inverterData.position[0].toFixed(2)}</div>
                      </div>
                      <div className="border rounded p-2">
                        <div className="text-xs text-muted-foreground">Y Position</div>
                        <div className="font-mono">{inverterData.position[1].toFixed(2)}</div>
                      </div>
                      <div className="border rounded p-2">
                        <div className="text-xs text-muted-foreground">Z Position</div>
                        <div className="font-mono">{inverterData.position[2].toFixed(2)}</div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium mb-1">Installation Details</h3>
                    <Table>
                      <TableBody>
                        <TableRow>
                          <TableCell className="font-medium">Installation Date</TableCell>
                          <TableCell>2023-05-15</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Last Maintenance</TableCell>
                          <TableCell>2024-01-20</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Next Scheduled Maintenance</TableCell>
                          <TableCell>2024-07-20</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Connected String Count</TableCell>
                          <TableCell>12</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Connected Panel Count</TableCell>
                          <TableCell>240</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full flex justify-between">
                  View in String Diagram
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
