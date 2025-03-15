
import React, { useState } from 'react';
import { Modal, Tabs, Typography, Divider, Button, Tag, Statistic, Row, Col } from 'antd';
import { CameraOutlined, ClockCircleOutlined, SettingOutlined, EyeOutlined, PlayCircleOutlined, PauseCircleOutlined } from '@ant-design/icons';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface CameraDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cameraId: number | null;
}

const { Title, Text } = Typography;
const { TabPane } = Tabs;

// Mock data for camera statistics
const getMockVideoData = (cameraId: number) => {
  return [
    { time: '00:00', motion: Math.floor(Math.random() * 5), alerts: Math.floor(Math.random() * 2) },
    { time: '02:00', motion: Math.floor(Math.random() * 5), alerts: Math.floor(Math.random() * 2) },
    { time: '04:00', motion: Math.floor(Math.random() * 5), alerts: Math.floor(Math.random() * 2) },
    { time: '06:00', motion: Math.floor(Math.random() * 10), alerts: Math.floor(Math.random() * 3) },
    { time: '08:00', motion: Math.floor(Math.random() * 15), alerts: Math.floor(Math.random() * 4) },
    { time: '10:00', motion: Math.floor(Math.random() * 12), alerts: Math.floor(Math.random() * 3) },
    { time: '12:00', motion: Math.floor(Math.random() * 10), alerts: Math.floor(Math.random() * 2) },
    { time: '14:00', motion: Math.floor(Math.random() * 15), alerts: Math.floor(Math.random() * 4) },
    { time: '16:00', motion: Math.floor(Math.random() * 12), alerts: Math.floor(Math.random() * 3) },
    { time: '18:00', motion: Math.floor(Math.random() * 8), alerts: Math.floor(Math.random() * 2) },
    { time: '20:00', motion: Math.floor(Math.random() * 6), alerts: Math.floor(Math.random() * 2) },
    { time: '22:00', motion: Math.floor(Math.random() * 4), alerts: Math.floor(Math.random() * 1) },
  ];
};

// Mock data for maintenance history
const getMockMaintenanceHistory = (cameraId: number) => {
  return [
    { date: '2023-12-15', action: '定期维护检查', technician: '李工' },
    { date: '2023-09-20', action: '摄像头固件升级', technician: '王工' },
    { date: '2023-06-05', action: '摄像头清洁与调整', technician: '张工' },
  ];
};

const CameraDetailsDialog: React.FC<CameraDetailsDialogProps> = ({ open, onOpenChange, cameraId }) => {
  const [activeTab, setActiveTab] = useState('1');
  const [isStreaming, setIsStreaming] = useState(false);

  if (cameraId === null) return null;

  const cameraData = {
    id: `CAM-${String(cameraId + 1).padStart(3, '0')}`,
    name: `摄像头 ${cameraId + 1}`,
    model: 'HD-320X Pro',
    resolution: '1080p',
    status: Math.random() > 0.2 ? '在线' : '离线',
    ipAddress: `192.168.1.${20 + cameraId}`,
    installDate: '2023-05-15',
    fieldOfView: '120°',
    nightVision: '有效距离 50m',
    lastMaintenance: '2023-12-15',
    ptzSupport: Math.random() > 0.5 ? '支持' : '不支持',
    storageRetention: '30天',
  };

  const maintenanceHistory = getMockMaintenanceHistory(cameraId);
  const videoStatistics = getMockVideoData(cameraId);
  
  const handleTabChange = (key: string) => {
    setActiveTab(key);
  };

  const toggleStreaming = () => {
    setIsStreaming(!isStreaming);
  };

  return (
    <Modal
      title={
        <div className="flex items-center">
          <CameraOutlined className="mr-2 text-blue-500" />
          <span>{cameraData.name} 详情</span>
        </div>
      }
      open={open}
      onCancel={() => onOpenChange(false)}
      width={800}
      footer={[
        <Button key="close" onClick={() => onOpenChange(false)}>
          关闭
        </Button>
      ]}
    >
      <Tabs activeKey={activeTab} onChange={handleTabChange} className="mt-4">
        <TabPane
          tab={
            <span className="flex items-center">
              <EyeOutlined className="mr-1" />
              监控视图
            </span>
          }
          key="1"
        >
          <div className="p-4 bg-gray-100 rounded-lg mb-4 relative" style={{ height: '300px' }}>
            <div className="absolute inset-0 flex items-center justify-center">
              {isStreaming ? (
                <div className="text-center">
                  <div className="mb-2 text-lg">正在实时观看摄像头画面...</div>
                  <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                </div>
              ) : (
                <div className="text-center">
                  <CameraOutlined style={{ fontSize: '64px', opacity: 0.5 }} />
                  <div className="mt-4">点击下方按钮开始实时监控</div>
                </div>
              )}
            </div>
            
            <div className="absolute bottom-4 left-0 right-0 flex justify-center">
              <Button 
                type="primary"
                icon={isStreaming ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
                onClick={toggleStreaming}
              >
                {isStreaming ? '停止观看' : '开始观看'}
              </Button>
            </div>
          </div>
          
          <Row gutter={16} className="mb-4">
            <Col span={8}>
              <div className="string-card">
                <Statistic 
                  title="今日活动检测" 
                  value={Math.floor(Math.random() * 100)} 
                  suffix="次" 
                />
              </div>
            </Col>
            <Col span={8}>
              <div className="string-card">
                <Statistic 
                  title="今日报警" 
                  value={Math.floor(Math.random() * 10)} 
                  suffix="次" 
                  valueStyle={{ color: '#cf1322' }}
                />
              </div>
            </Col>
            <Col span={8}>
              <div className="string-card">
                <Statistic 
                  title="运行状态" 
                  value={cameraData.status} 
                  valueStyle={{ color: cameraData.status === '在线' ? '#3f8600' : '#cf1322' }}
                />
              </div>
            </Col>
          </Row>
          
          <Typography.Title level={5}>今日活动统计</Typography.Title>
          <div style={{ width: '100%', height: 250 }}>
            <ResponsiveContainer>
              <LineChart
                data={videoStatistics}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="motion" stroke="#8884d8" name="活动检测" />
                <Line type="monotone" dataKey="alerts" stroke="#ff7875" name="报警" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </TabPane>
        
        <TabPane
          tab={
            <span className="flex items-center">
              <ClockCircleOutlined className="mr-1" />
              摄像头信息
            </span>
          }
          key="2"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="info-card">
              <Title level={5}>基本信息</Title>
              <Divider className="my-2" />
              <div className="grid grid-cols-1 gap-2">
                <div className="flex justify-between">
                  <Text type="secondary">摄像头ID:</Text>
                  <Text>{cameraData.id}</Text>
                </div>
                <div className="flex justify-between">
                  <Text type="secondary">型号:</Text>
                  <Text>{cameraData.model}</Text>
                </div>
                <div className="flex justify-between">
                  <Text type="secondary">分辨率:</Text>
                  <Text>{cameraData.resolution}</Text>
                </div>
                <div className="flex justify-between">
                  <Text type="secondary">状态:</Text>
                  <Tag color={cameraData.status === '在线' ? 'green' : 'red'}>
                    {cameraData.status}
                  </Tag>
                </div>
                <div className="flex justify-between">
                  <Text type="secondary">IP地址:</Text>
                  <Text>{cameraData.ipAddress}</Text>
                </div>
              </div>
            </div>
            
            <div className="info-card">
              <Title level={5}>技术规格</Title>
              <Divider className="my-2" />
              <div className="grid grid-cols-1 gap-2">
                <div className="flex justify-between">
                  <Text type="secondary">安装日期:</Text>
                  <Text>{cameraData.installDate}</Text>
                </div>
                <div className="flex justify-between">
                  <Text type="secondary">视场角:</Text>
                  <Text>{cameraData.fieldOfView}</Text>
                </div>
                <div className="flex justify-between">
                  <Text type="secondary">夜视功能:</Text>
                  <Text>{cameraData.nightVision}</Text>
                </div>
                <div className="flex justify-between">
                  <Text type="secondary">PTZ支持:</Text>
                  <Text>{cameraData.ptzSupport}</Text>
                </div>
                <div className="flex justify-between">
                  <Text type="secondary">存储时长:</Text>
                  <Text>{cameraData.storageRetention}</Text>
                </div>
              </div>
            </div>
          </div>
        </TabPane>
        
        <TabPane
          tab={
            <span className="flex items-center">
              <SettingOutlined className="mr-1" />
              维护记录
            </span>
          }
          key="3"
        >
          <div className="maintenance-timeline py-4">
            {maintenanceHistory.map((record, index) => (
              <div className="timeline-item" key={index}>
                <div className="timeline-date">{record.date}</div>
                <div className="timeline-content">
                  <div className="font-medium">{record.action}</div>
                  <div className="text-sm text-gray-500">技术人员: {record.technician}</div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 flex justify-end">
            <Button type="primary" icon={<SettingOutlined />}>
              安排新的维护
            </Button>
          </div>
        </TabPane>
      </Tabs>
    </Modal>
  );
};

export default CameraDetailsDialog;
