import React, { useState } from 'react';
import { Modal, Typography, Row, Col } from 'antd';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Zap, Thermometer, Activity, AlertTriangle } from 'lucide-react';
import tansformerImg from '@/assets/tansformer.png';
const { Text } = Typography;

// Mock data for transformer
const getTransformerData = (transformerId: number | null) => {
  const mockLoadData = Array.from({ length: 24 }, (_, i) => ({
    time: `${i}:00`,
    load: Math.round(10 + Math.sin((i - 6) / 24 * Math.PI * 2) * 70 + Math.random() * 10)
  }));

  const mockTempData = Array.from({ length: 24 }, (_, i) => ({
    time: `${i}:00`,
    temperature: Math.round(10 + Math.sin((i - 6) / 24 * Math.PI * 2) * 75 + Math.random() * 10)
  }));

  return {
    id: transformerId,
    name: `箱变${transformerId !== null ? transformerId + 1 : ''}`,
    model: 'TBEA-ZGSF11-Z.T-2500/35',
    status: 'online',
    warningCount: 2,
    capacityWh: 3,
    load: 29,
    temperature: 56,
    connectedInverters: 4,
    manufacturer: '华为',
    installationDate: '2024.12.12',
    lastMaintenance: '2025.03.12',
    voltageRating: '33kV / 120kV',
    coolingType: 'ONAN/ONAF',
    connectedInvertersList: 'INV #4, INV #5, INV #6, INV #7',
    oilLevel: '95%',
    impedance: '6.25%',
    efficiency: '98.7%',
    loadData: mockLoadData,
    tempData: mockTempData
  };
};

interface TransformerDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transformerId: number | null;
}

export default function TransformerDetailsDialog({ 
  open, 
  onOpenChange, 
  transformerId 
}: TransformerDetailsDialogProps) {
  const [activeTab, setActiveTab] = useState<string>('overview');
  
  const transformer = getTransformerData(transformerId);
  
  const handleCancel = () => {
    onOpenChange(false);
  };

  if (transformerId === null) return null;
  
  return (
    <Modal
      title={`${transformer.name} (设备号)`}
      open={open}
      onCancel={handleCancel}
      footer={null}
      width={800}
      bodyStyle={{ padding: '0', overflow: 'auto' }}
      destroyOnClose
    >
      <div className="p-6">
        {/* Top cards section */}
        <div className="flex flex-row flex-wrap mb-6 gap-4">
          {/* Device info card */}
          <div className="w-full md:w-[32%] bg-white rounded-lg shadow-sm p-4 border border-gray-100">
            <div className="flex items-start mb-2">
              <span className="text-xs rounded px-2 py-0.5 bg-purple-100 text-purple-700 mr-2">变电站</span>
              <span className="text-xs rounded px-2 py-0.5 bg-teal-100 text-teal-700">在线</span>
            </div>
            <div className="flex justify-center mb-3">
              <div className="w-48 h-48 bg-gray-100 rounded-md flex items-center justify-center text-gray-400">
                <img src={tansformerImg} />
              </div>
            </div>
            <div className="text-center mb-1">
              <p className="text-sm text-gray-600">型号：{transformer.model}</p>
            </div>
            <div className="text-center">
              {transformer.warningCount > 0 && (
                <div className="inline-flex items-center px-2 py-0.5 rounded text-orange-700 bg-orange-50 text-xs">
                  <AlertTriangle size={12} className="mr-1" />
                  {transformer.warningCount}警告
                </div>
              )}
            </div>
          </div>
          
          {/* Stats cards grid */}
          <div className="w-full md:w-[65%] grid grid-cols-2 gap-4">
            {/* Capacity card */}
            <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
              <div className="flex items-center mb-1">
                <Zap className="mr-2 text-teal-500" size={16} />
                <Text className="text-gray-500 text-sm">Capacity</Text>
              </div>
              <div className="flex items-baseline">
                <span className="text-4xl font-bold">{transformer.capacityWh}</span>
                <span className="ml-1 text-gray-500 text-sm">Wh</span>
              </div>
            </div>
            
            {/* Load card */}
            <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
              <div className="flex items-center mb-1">
                <Activity className="mr-2 text-teal-500" size={16} />
                <Text className="text-gray-500 text-sm">Load</Text>
              </div>
              <div className="flex items-baseline">
                <span className="text-4xl font-bold">{transformer.load}</span>
                <span className="ml-1 text-gray-500 text-sm">%</span>
              </div>
            </div>
            
            {/* Temperature card */}
            <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
              <div className="flex items-center mb-1">
                <Thermometer className="mr-2 text-teal-500" size={16} />
                <Text className="text-gray-500 text-sm">Temperature</Text>
              </div>
              <div className="flex items-baseline">
                <span className="text-4xl font-bold">{transformer.temperature}</span>
                <span className="ml-1 text-gray-500 text-sm">°C</span>
              </div>
            </div>
            
            {/* Connected Inverters card */}
            <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
              <div className="flex items-center mb-1">
                <Zap className="mr-2 text-teal-500" size={16} />
                <Text className="text-gray-500 text-sm">Connected Inverters</Text>
              </div>
              <div className="flex items-baseline">
                <span className="text-4xl font-bold">{transformer.connectedInverters}</span>
                <span className="ml-1 text-gray-500 text-sm">units</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="border rounded-lg overflow-hidden mb-6">
          <div className="flex border-b">
            <button 
              onClick={() => setActiveTab('overview')}
              className={`flex-1 px-4 py-3 text-center text-sm ${activeTab === 'overview' ? 'bg-white font-medium' : 'bg-gray-50 text-gray-500'}`}
            >
              Overview
            </button>
            <button 
              onClick={() => setActiveTab('loadHistory')}
              className={`flex-1 px-4 py-3 text-center text-sm ${activeTab === 'loadHistory' ? 'bg-white font-medium' : 'bg-gray-50 text-gray-500'}`}
            >
              Load History
            </button>
            <button 
              onClick={() => setActiveTab('temperature')}
              className={`flex-1 px-4 py-3 text-center text-sm ${activeTab === 'temperature' ? 'bg-white font-medium' : 'bg-gray-50 text-gray-500'}`}
            >
              Temperature
            </button>
          </div>
          
          {/* Tab Content */}
          <div className="bg-white p-5">
            {activeTab === 'overview' && (
              <div>
                <h3 className="text-base font-medium mb-4">Transformer Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-y-6">
                  <div>
                    <Text className="text-gray-500 block text-xs">Manufacturer</Text>
                    <Text strong className="text-sm">{transformer.manufacturer}</Text>
                  </div>
                  <div>
                    <Text className="text-gray-500 block text-xs">Installation Date</Text>
                    <Text strong className="text-sm">{transformer.installationDate}</Text>
                  </div>
                  <div>
                    <Text className="text-gray-500 block text-xs">Last Maintenance</Text>
                    <Text strong className="text-sm">{transformer.lastMaintenance}</Text>
                  </div>
                  <div>
                    <Text className="text-gray-500 block text-xs">Voltage Rating</Text>
                    <Text strong className="text-sm">{transformer.voltageRating}</Text>
                  </div>
                  <div>
                    <Text className="text-gray-500 block text-xs">Cooling Type</Text>
                    <Text strong className="text-sm">{transformer.coolingType}</Text>
                  </div>
                  <div>
                    <Text className="text-gray-500 block text-xs">Connected Inverters</Text>
                    <Text strong className="text-sm">{transformer.connectedInvertersList}</Text>
                  </div>
                  <div>
                    <Text className="text-gray-500 block text-xs">Oil Level</Text>
                    <Text strong className="text-sm">{transformer.oilLevel}</Text>
                  </div>
                  <div>
                    <Text className="text-gray-500 block text-xs">Impedance</Text>
                    <Text strong className="text-sm">{transformer.impedance}</Text>
                  </div>
                  <div>
                    <Text className="text-gray-500 block text-xs">Efficiency</Text>
                    <Text strong className="text-sm">{transformer.efficiency}</Text>
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'loadHistory' && (
              <div>
                <h3 className="text-base font-medium mb-4">Load History (Last 24 Hours)</h3>
                <div style={{ width: '100%', height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={transformer.loadData}
                      margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                      <XAxis 
                        dataKey="time" 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 11 }}
                      />
                      <YAxis 
                        label={{ value: '%', angle: -90, position: 'insideLeft', offset: -5, fontSize: 11 }}
                        domain={[0, 100]}
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 11 }}
                      />
                      <Tooltip />
                      <Area 
                        type="monotone" 
                        dataKey="load" 
                        stroke="#4FD1C5" 
                        fill="#4FD1C5" 
                        fillOpacity={0.2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
            
            {activeTab === 'temperature' && (
              <div>
                <h3 className="text-base font-medium mb-4">Temperature History (Last 24 Hours)</h3>
                <div style={{ width: '100%', height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={transformer.tempData}
                      margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                      <XAxis 
                        dataKey="time" 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 11 }}
                      />
                      <YAxis 
                        label={{ value: '°C', angle: -90, position: 'insideLeft', offset: -5, fontSize: 11 }}
                        domain={[0, 100]}
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 11 }}
                      />
                      <Tooltip />
                      <Area 
                        type="monotone" 
                        dataKey="temperature" 
                        stroke="#FBB360" 
                        fill="#FBB360" 
                        fillOpacity={0.2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Bottom button */}
        <div className="flex justify-center">
          <button 
            onClick={handleCancel}
            className="px-16 py-2 border border-gray-300 rounded-md hover:bg-gray-50 text-sm"
          >
            关闭
          </button>
        </div>
      </div>
    </Modal>
  );
}
