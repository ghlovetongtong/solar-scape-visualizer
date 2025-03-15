
import React from 'react';
import { Modal, Typography, Divider, Row, Col, Progress } from 'antd';

const { Title, Text } = Typography;

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

  const handleCancel = () => {
    onOpenChange(false);
  };

  // Daily production data for the chart
  const productionData = [0.4, 0.7, 0.9, 1.0, 0.95, 0.85, 0.6, 0.3];
  
  return (
    <Modal
      open={open}
      onCancel={handleCancel}
      footer={null}
      title={`Inverter ${inverterId + 1} Details`}
      width={400}
    >
      <div className="space-y-4 mt-4">
        <Row gutter={[16, 8]}>
          <Col span={12}>
            <Text strong>Status</Text>
          </Col>
          <Col span={12}>
            <Text>Online</Text>
          </Col>
          
          <Col span={12}>
            <Text strong>Power Output</Text>
          </Col>
          <Col span={12}>
            <Text>7.2 kW</Text>
          </Col>
          
          <Col span={12}>
            <Text strong>Temperature</Text>
          </Col>
          <Col span={12}>
            <Text>45°C</Text>
          </Col>
          
          <Col span={12}>
            <Text strong>Efficiency</Text>
          </Col>
          <Col span={12}>
            <Text>98.3%</Text>
          </Col>
          
          <Col span={12}>
            <Text strong>Last Maintenance</Text>
          </Col>
          <Col span={12}>
            <Text>2023-09-15</Text>
          </Col>
          
          <Col span={12}>
            <Text strong>Serial Number</Text>
          </Col>
          <Col span={12}>
            <Text>INV-{10000 + inverterId}</Text>
          </Col>
          
          <Col span={12}>
            <Text strong>Installation Date</Text>
          </Col>
          <Col span={12}>
            <Text>2023-04-30</Text>
          </Col>
        </Row>
        
        <Divider style={{ margin: '12px 0' }} />
        <div>
          <Title level={5} style={{ margin: '0 0 12px 0' }}>Daily Production</Title>
          <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded-md">
            <div className="h-16 flex items-end justify-between px-2">
              {productionData.map((value, index) => (
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
    </Modal>
  );
}
