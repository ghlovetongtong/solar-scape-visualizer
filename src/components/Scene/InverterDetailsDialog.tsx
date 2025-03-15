
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface InverterDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  inverterId: number | null;
}

export default function InverterDetailsDialog({
  open,
  onOpenChange,
  inverterId
}: InverterDetailsDialogProps) {
  if (inverterId === null) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Inverter {inverterId + 1} Details</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-2">
            <div className="text-sm font-medium">Status</div>
            <div className="text-sm">Online</div>
            
            <div className="text-sm font-medium">Power Output</div>
            <div className="text-sm">7.2 kW</div>
            
            <div className="text-sm font-medium">Temperature</div>
            <div className="text-sm">45°C</div>
            
            <div className="text-sm font-medium">Efficiency</div>
            <div className="text-sm">98.3%</div>
            
            <div className="text-sm font-medium">Last Maintenance</div>
            <div className="text-sm">2023-09-15</div>
            
            <div className="text-sm font-medium">Serial Number</div>
            <div className="text-sm">INV-{10000 + inverterId}</div>
            
            <div className="text-sm font-medium">Installation Date</div>
            <div className="text-sm">2023-04-30</div>
          </div>
          
          <div className="pt-4 border-t">
            <h4 className="text-sm font-medium mb-2">Daily Production</h4>
            <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded-md">
              <div className="h-16 flex items-end justify-between px-2">
                {[0.4, 0.7, 0.9, 1.0, 0.95, 0.85, 0.6, 0.3].map((value, index) => (
                  <div 
                    key={index}
                    className="w-6 bg-blue-500 rounded-t"
                    style={{ height: `${value * 100}%` }}
                  />
                ))}
              </div>
              <div className="flex justify-between text-xs mt-1 text-gray-500">
                <span>09:00</span>
                <span>12:00</span>
                <span>15:00</span>
                <span>18:00</span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
