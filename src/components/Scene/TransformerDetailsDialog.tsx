
import React, { useState } from 'react';
import { Modal, Typography, Divider, Row, Col, Tag, Space, Progress } from 'antd';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const { Title, Text } = Typography;

// Mock data for transformer
const getTransformerData = (transformerId: number | null) => {
  const mockTempData = Array.from({ length: 24 }, (_, i) => ({
    time: `${i}:00`,
    temperature: Math.round(35 + Math.sin(i / 24 * Math.PI * 2) * 10 + Math.random() * 5)
  }));

  const mockLoadData = Array.from({ length: 24 }, (_, i) => ({
    time: `${i}:00`,
    load: Math.round(60 + Math.sin(i / 24 * Math.PI * 2) * 20 + Math.random() * 10)
  }));

  return {
    id: transformerId,
    name: `Transformer ${transformerId !== null ? transformerId + 1 : ''}`,
    model: 'TS-8000/35',
    status: 'Running',
    power: {
      capacity: 8000, // kVA
      current: 6240, // kVA
    },
    voltage: {
      input: 35000, // V
      output: 400, // V
    },
    temperature: 42, // °C
    oil: {
      level: 92, // %
      temperature: 38, // °C
    },
    efficiency: 98.2, // %
    maintenance: {
      lastDate: '2023-08-15',
      nextDate: '2024-02-15',
    },
    temperatureData: mockTempData,
    loadData: mockLoadData
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
  
  return (
    <Modal
      title={
        <div className="flex items-center">
          <span className="text-xl font-bold">{transformer.name}</span>
          <Tag color="green" className="ml-2">
            {transformer.status}
          </Tag>
        </div>
      }
      open={open}
      onCancel={handleCancel}
      footer={null}
      width={800}
      className="transformer-details-dialog"
    >
      <div className="tab-container mb-4">
        <div className="tabs flex">
          <div 
            className={`tab-item px-4 py-2 cursor-pointer ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </div>
          <div 
            className={`tab-item px-4 py-2 cursor-pointer ${activeTab === 'monitoring' ? 'active' : ''}`}
            onClick={() => setActiveTab('monitoring')}
          >
            Monitoring
          </div>
          <div 
            className={`tab-item px-4 py-2 cursor-pointer ${activeTab === 'maintenance' ? 'active' : ''}`}
            onClick={() => setActiveTab('maintenance')}
          >
            Maintenance
          </div>
        </div>
      </div>
      
      {activeTab === 'overview' && (
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="info-card">
              <Title level={5}>Device Information</Title>
              <div className="info-item">
                <Text type="secondary">Model:</Text>
                <Text strong>{transformer.model}</Text>
              </div>
              <div className="info-item">
                <Text type="secondary">Capacity:</Text>
                <Text strong>{transformer.power.capacity} kVA</Text>
              </div>
              <div className="info-item">
                <Text type="secondary">Status:</Text>
                <Tag color="green">{transformer.status}</Tag>
              </div>
            </div>
            
            <div className="info-card">
              <Title level={5}>Power</Title>
              <div className="info-item">
                <Text type="secondary">Current Load:</Text>
                <Text strong>{transformer.power.current} kVA</Text>
              </div>
              <div className="info-item">
                <Text type="secondary">Utilization:</Text>
                <Progress 
                  percent={Math.round((transformer.power.current / transformer.power.capacity) * 100)} 
                  size="small" 
                  status="active"
                />
              </div>
              <div className="info-item">
                <Text type="secondary">Efficiency:</Text>
                <Text strong>{transformer.efficiency}%</Text>
              </div>
            </div>
            
            <div className="info-card">
              <Title level={5}>Voltage</Title>
              <div className="info-item">
                <Text type="secondary">Input:</Text>
                <Text strong>{transformer.voltage.input / 1000} kV</Text>
              </div>
              <div className="info-item">
                <Text type="secondary">Output:</Text>
                <Text strong>{transformer.voltage.output} V</Text>
              </div>
              <div className="info-item">
                <Text type="secondary">Conversion Ratio:</Text>
                <Text strong>{(transformer.voltage.input / transformer.voltage.output).toFixed(1)}:1</Text>
              </div>
            </div>
          </div>
          
          <Divider />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="info-card">
              <Title level={5}>Temperature</Title>
              <div className="info-item">
                <Text type="secondary">Current Temperature:</Text>
                <Text strong className={transformer.temperature > 50 ? 'text-red-500' : ''}>{transformer.temperature}°C</Text>
              </div>
              <div className="info-item">
                <Text type="secondary">Oil Temperature:</Text>
                <Text strong>{transformer.oil.temperature}°C</Text>
              </div>
            </div>
            
            <div className="info-card">
              <Title level={5}>Oil Level</Title>
              <div className="info-item">
                <Text type="secondary">Current Level:</Text>
                <Progress 
                  percent={transformer.oil.level} 
                  size="small"
                  status={transformer.oil.level < 80 ? "exception" : "active"}
                />
              </div>
            </div>
          </div>
        </div>
      )}
      
      {activeTab === 'monitoring' && (
        <div className="p-4">
          <Row gutter={[16, 16]}>
            <Col span={24}>
              <div className="chart-card">
                <Title level={5}>Transformer Temperature (24h)</Title>
                <div style={{ height: 200 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={transformer.temperatureData}
                      margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis label={{ value: 'Temperature (°C)', angle: -90, position: 'insideLeft' }} />
                      <Tooltip />
                      <Area type="monotone" dataKey="temperature" stroke="#ff7300" fill="#ff730066" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </Col>
            
            <Col span={24}>
              <div className="chart-card">
                <Title level={5}>Load (24h)</Title>
                <div style={{ height: 200 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={transformer.loadData}
                      margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis label={{ value: 'Load (%)', angle: -90, position: 'insideLeft' }} />
                      <Tooltip />
                      <Area type="monotone" dataKey="load" stroke="#8884d8" fill="#8884d866" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </Col>
          </Row>
        </div>
      )}
      
      {activeTab === 'maintenance' && (
        <div className="p-4">
          <div className="info-card">
            <Title level={5}>Maintenance Schedule</Title>
            <div className="info-item">
              <Text type="secondary">Last Maintenance:</Text>
              <Text strong>{transformer.maintenance.lastDate}</Text>
            </div>
            <div className="info-item">
              <Text type="secondary">Next Scheduled:</Text>
              <Text strong>{transformer.maintenance.nextDate}</Text>
            </div>
            <div className="info-item mt-2">
              <Tag color="blue">Regular Inspection</Tag>
              <Tag color="purple">Oil Change</Tag>
              <Tag color="orange">Cooling System Check</Tag>
            </div>
          </div>
          
          <Divider />
          
          <div className="info-card">
            <Title level={5}>Maintenance History</Title>
            <div className="maintenance-timeline">
              <div className="timeline-item">
                <div className="timeline-date">2023-08-15</div>
                <div className="timeline-content">
                  <Text strong>Regular Maintenance</Text>
                  <div>Oil level check, bushing inspection, cooling system maintenance</div>
                  <Tag color="green">Completed</Tag>
                </div>
              </div>
              
              <div className="timeline-item">
                <div className="timeline-date">2023-02-10</div>
                <div className="timeline-content">
                  <Text strong>Oil Change</Text>
                  <div>Complete oil replacement and filtering</div>
                  <Tag color="green">Completed</Tag>
                </div>
              </div>
              
              <div className="timeline-item">
                <div className="timeline-date">2022-08-20</div>
                <div className="timeline-content">
                  <Text strong>Regular Maintenance</Text>
                  <div>Insulation test, thermal imaging inspection</div>
                  <Tag color="green">Completed</Tag>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}
