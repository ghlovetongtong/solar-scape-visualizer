
import React, { useState } from 'react';
import { Modal, Typography, Divider, Row, Col, Card, Tag, Space, Progress } from 'antd';
import { Area, AreaChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { 
  Zap, 
  Activity, 
  Calendar, 
  Thermometer, 
  Clock, 
  Server, 
  Check, 
  AlertTriangle, 
  Wifi, 
  WifiOff,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import inveterImg from '@/assets/inveter.png';


const { Title, Text } = Typography;

const powerOutputData = [
  { time: '00:00', power: 0 },
  { time: '01:00', power: 0 },
  { time: '02:00', power: 0 },
  { time: '03:00', power: 0 },
  { time: '04:00', power: 0 },
  { time: '05:00', power: 0 },
  { time: '06:00', power: 5 },
  { time: '07:00', power: 15 },
  { time: '08:00', power: 30 },
  { time: '09:00', power: 45 },
  { time: '10:00', power: 55 },
  { time: '11:00', power: 75 },
  { time: '12:00', power: 90 },
  { time: '13:00', power: 70 },
  { time: '14:00', power: 50 },
  { time: '15:00', power: 35 },
  { time: '16:00', power: 25 },
  { time: '17:00', power: 15 },
  { time: '18:00', power: 5 },
  { time: '19:00', power: 0 },
  { time: '20:00', power: 0 },
  { time: '21:00', power: 0 },
  { time: '22:00', power: 0 },
  { time: '23:00', power: 0 },
];

const stringData = [
  { id: 'PV1', voltage: 360, current: 1.53, status: 'normal' },
  { id: 'PV2', voltage: 360, current: 1.53, status: 'normal' },
  { id: 'PV3', voltage: 360, current: 1.53, status: 'warning' },
  { id: 'PV4', voltage: 360, current: 1.53, status: 'offline' },
  { id: 'PV5', voltage: 360, current: 1.53, status: 'warning' },
  { id: 'PV6', voltage: 360, current: 1.53, status: 'warning' },
  { id: 'PV7', voltage: 360, current: 1.53, status: 'normal' },
  { id: 'PV8', voltage: 360, current: 1.53, status: 'normal' },
  { id: 'PV9', voltage: 360, current: 1.53, status: 'normal' },
  { id: 'PV10', voltage: 360, current: 1.53, status: 'normal' },
];

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
  const [activeTab, setActiveTab] = useState<string>('1');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 6;

  if (inverterId === null) return null;

  const handleCancel = () => {
    onOpenChange(false);
  };

  const inverterData = {
    name: `逆变器${inverterId + 1}`,
    model: 'SUN2000-10KTL-M1',
    status: 'online',
    warningCount: 2,
    dailyEnergy: 29,
    totalEnergy: 999.999,
    efficiency: 98.48,
    powerFactor: 1.00,
    temperature: 32.9,
    dcInputPower: 13.66,
    acActivePower: 13.66,
    acReactivePower: 50.03,
    gridFrequency: 50.03,
    insulationResistance: 3000,
    pidStatus: 0.00,
    totalRunningTime: 6313.3,
    dailyRunningTime: 4.25,
    connectedPanels: 375,
    stringCount: 8,
    firmwareVersion: 'V3.5.3',
    dailyOperationTime: 452,
    lastMaintenanceDate: '2023-12-13',
    operationTime: 50.03,
    manufacturer: '华为',
    serialNumber: 'WRC-01CU-001',
    ratedPower: 10,
    installationDate: '2023-12-12',
    gridConnector: '华为',
    gridType: '三相',
    nominalVoltage: 400,
    gridCompliance: 'IEC 61727',
    dailyPeakPower: 55.15,
    powerGenerationTime: 9.9,
    performanceRatio: 0.92,
    normalStrings: 20,
    warningStrings: 3,
    offlineStrings: 2
  };

  const currentStringData = stringData.slice(
    (currentPage - 1) * pageSize, 
    currentPage * pageSize
  );

  const totalPages = Math.ceil(stringData.length / pageSize);

  const handlePrevPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal':
        return '#00BCD4';
      case 'warning':
        return '#FF9800';
      case 'offline':
        return '#9E9E9E';
      default:
        return '#00BCD4';
    }
  };

  return (
    <Modal
      open={open}
      onCancel={handleCancel}
      footer={null}
      title={`${inverterData.name} (设备号)}`}
      width={800}
      bodyStyle={{ padding: '0', maxHeight: '80vh', overflowY: 'auto' }}
      destroyOnClose
    >
      <div className="p-0">
        <div className="flex flex-row flex-wrap">
          <div className="w-full md:w-1/2 p-4 bg-gray-50">
            <div className="flex items-start mb-2">
              <Tag color="#87d068" className="mr-2">
                <Wifi className="inline mr-1" size={14} />
                在线
              </Tag>
            </div>
            <div className="flex justify-center mb-4">
              <img src={inveterImg} alt="逆变器图片" className="w-32 h-32 object-contain" />
            </div>
            <div className="text-center">
              <p className="text-sm mb-2">型号：{inverterData.model}</p>
              {inverterData.warningCount > 0 && (
                <Tag color="orange" className="mt-2">
                  <AlertTriangle className="inline mr-1" size={14} />
                  {inverterData.warningCount}警告
                </Tag>
              )}
            </div>
          </div>
          
          <div className="w-full md:w-1/2 p-4">
            <div className="mb-6 mt-2">
              <div className="flex items-center mb-1">
                <Zap className="mr-2 text-teal-500" size={16} />
                <Text className="text-gray-500 text-sm">Daily Energy</Text>
              </div>
              <div className="flex items-baseline">
                <span className="text-2xl font-bold">{inverterData.dailyEnergy}</span>
                <span className="ml-1 text-gray-500 text-sm">kWh</span>
              </div>
            </div>
            
            <div className="mb-2">
              <div className="flex items-center mb-1">
                <Zap className="mr-2 text-teal-500" size={16} />
                <Text className="text-gray-500 text-sm">Total Energy</Text>
              </div>
              <div className="flex items-baseline">
                <span className="text-2xl font-bold">{inverterData.totalEnergy.toLocaleString()}</span>
                <span className="ml-1 text-gray-500 text-sm">MWh</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Custom Tab Implementation */}
        <div className="border-b">
          <div className="flex">
            <button 
              onClick={() => setActiveTab('1')}
              className={`px-4 py-2 text-sm font-medium ${activeTab === '1' 
                ? 'border-b-2 border-blue-500 text-blue-600' 
                : 'text-gray-500 hover:text-gray-700'}`}
            >
              Overview
            </button>
            <button 
              onClick={() => setActiveTab('2')}
              className={`px-4 py-2 text-sm font-medium ${activeTab === '2' 
                ? 'border-b-2 border-blue-500 text-blue-600' 
                : 'text-gray-500 hover:text-gray-700'}`}
            >
              Power & Energy
            </button>
            <button 
              onClick={() => setActiveTab('3')}
              className={`px-4 py-2 text-sm font-medium ${activeTab === '3' 
                ? 'border-b-2 border-blue-500 text-blue-600' 
                : 'text-gray-500 hover:text-gray-700'}`}
            >
              String Data
            </button>
          </div>
        </div>
        
        {/* Tab Content */}
        <div className="p-4">
          {activeTab === '1' && (
            <div>
              <div className="flex flex-wrap -mx-2 mb-6">
                <div className="w-full md:w-1/3 px-2 mb-4 md:mb-0">
                  <div className="bg-white p-3 rounded-lg shadow-md">
                    <div className="flex items-center mb-2">
                      <Activity size={16} className="mr-2 text-blue-600" />
                      <Text className="text-sm">逆变器效率 (%)</Text>
                    </div>
                    <div className="text-lg font-bold">{inverterData.efficiency}%</div>
                  </div>
                </div>
                <div className="w-full md:w-1/3 px-2 mb-4 md:mb-0">
                  <div className="bg-white p-3 rounded-lg shadow-md">
                    <div className="flex items-center mb-2">
                      <Activity size={16} className="mr-2 text-blue-600" />
                      <Text className="text-sm">功率因数</Text>
                    </div>
                    <div className="text-lg font-bold">{inverterData.powerFactor}</div>
                  </div>
                </div>
                <div className="w-full md:w-1/3 px-2">
                  <div className="bg-white p-3 rounded-lg shadow-md">
                    <div className="flex items-center mb-2">
                      <Thermometer size={16} className="mr-2 text-blue-600" />
                      <Text className="text-sm">内部温度 (°C)</Text>
                    </div>
                    <div className="text-lg font-bold">{inverterData.temperature}</div>
                  </div>
                </div>
              </div>
              
              <div className="mb-6 bg-white p-4 rounded-lg shadow-md">
                <Title level={5} className="mb-3 text-base font-medium pb-2 border-b">电气参数</Title>
                <Row gutter={[16, 16]}>
                  <Col span={8}>
                    <Text className="text-gray-500 block text-xs">直流输入功率 (kW)</Text>
                    <Text strong className="text-sm">{inverterData.dcInputPower}</Text>
                  </Col>
                  <Col span={8}>
                    <Text className="text-gray-500 block text-xs">交流有功功率 (kW)</Text>
                    <Text strong className="text-sm">{inverterData.acActivePower}</Text>
                  </Col>
                  <Col span={8}>
                    <Text className="text-gray-500 block text-xs">交流无功功率 (Var)</Text>
                    <Text strong className="text-sm">{inverterData.acReactivePower}</Text>
                  </Col>
                  <Col span={8}>
                    <Text className="text-gray-500 block text-xs">电网频率 (Hz)</Text>
                    <Text strong className="text-sm">{inverterData.gridFrequency}</Text>
                  </Col>
                  <Col span={8}>
                    <Text className="text-gray-500 block text-xs">绝缘阻抗值 (kΩ)</Text>
                    <Text strong className="text-sm">{inverterData.insulationResistance}</Text>
                  </Col>
                  <Col span={8}>
                    <Text className="text-gray-500 block text-xs">PID状态</Text>
                    <Text strong className="text-sm">{inverterData.pidStatus}</Text>
                  </Col>
                  <Col span={8}>
                    <Text className="text-gray-500 block text-xs">累计运行时间 (h)</Text>
                    <Text strong className="text-sm">{inverterData.totalRunningTime}</Text>
                  </Col>
                  <Col span={8}>
                    <Text className="text-gray-500 block text-xs">日运行时间 (h)</Text>
                    <Text strong className="text-sm">{inverterData.dailyRunningTime}</Text>
                  </Col>
                </Row>
              </div>
              
              <div className="mb-6 bg-white p-4 rounded-lg shadow-md">
                <Title level={5} className="mb-3 text-base font-medium pb-2 border-b">运营统计</Title>
                <Row gutter={[16, 16]}>
                  <Col span={8}>
                    <Text className="text-gray-500 block text-xs">连接面板</Text>
                    <Text strong className="text-sm">{inverterData.connectedPanels}枚</Text>
                  </Col>
                  <Col span={8}>
                    <Text className="text-gray-500 block text-xs">组串数量</Text>
                    <Text strong className="text-sm">{inverterData.stringCount}</Text>
                  </Col>
                  <Col span={8}>
                    <Text className="text-gray-500 block text-xs">固件</Text>
                    <Text strong className="text-sm">{inverterData.firmwareVersion}</Text>
                  </Col>
                  <Col span={8}>
                    <Text className="text-gray-500 block text-xs">每日运行时间</Text>
                    <Text strong className="text-sm">{inverterData.dailyOperationTime}分钟</Text>
                  </Col>
                  <Col span={8}>
                    <Text className="text-gray-500 block text-xs">上次维护时间</Text>
                    <Text strong className="text-sm">{inverterData.lastMaintenanceDate}</Text>
                  </Col>
                  <Col span={8}>
                    <Text className="text-gray-500 block text-xs">操作时间</Text>
                    <Text strong className="text-sm">{inverterData.operationTime}</Text>
                  </Col>
                </Row>
              </div>
              
              <div className="flex flex-wrap -mx-2">
                <div className="w-full md:w-1/2 px-2 mb-4 md:mb-0">
                  <div className="bg-white p-4 rounded-lg shadow-md h-full">
                    <Title level={5} className="mb-3 text-base font-medium pb-2 border-b">设备规格</Title>
                    <Row gutter={[16, 16]}>
                      <Col span={12}>
                        <Text className="text-gray-500 block text-xs">制造商</Text>
                        <Text strong className="text-sm">{inverterData.manufacturer}</Text>
                      </Col>
                      <Col span={12}>
                        <Text className="text-gray-500 block text-xs">SN号</Text>
                        <Text strong className="text-sm">{inverterData.serialNumber}</Text>
                      </Col>
                      <Col span={12}>
                        <Text className="text-gray-500 block text-xs">额定功率</Text>
                        <Text strong className="text-sm">{inverterData.ratedPower}千瓦</Text>
                      </Col>
                      <Col span={12}>
                        <Text className="text-gray-500 block text-xs">安装日期</Text>
                        <Text strong className="text-sm">{inverterData.installationDate}</Text>
                      </Col>
                    </Row>
                  </div>
                </div>
                
                <div className="w-full md:w-1/2 px-2">
                  <div className="bg-white p-4 rounded-lg shadow-md h-full">
                    <Title level={5} className="mb-3 text-base font-medium pb-2 border-b">Grid Parameters</Title>
                    <Row gutter={[16, 16]}>
                      <Col span={12}>
                        <Text className="text-gray-500 block text-xs">电网连接商</Text>
                        <Text strong className="text-sm">{inverterData.gridConnector}</Text>
                      </Col>
                      <Col span={12}>
                        <Text className="text-gray-500 block text-xs">网格类型</Text>
                        <Text strong className="text-sm">{inverterData.gridType}</Text>
                      </Col>
                      <Col span={12}>
                        <Text className="text-gray-500 block text-xs">标称电压</Text>
                        <Text strong className="text-sm">{inverterData.nominalVoltage}V交流电</Text>
                      </Col>
                      <Col span={12}>
                        <Text className="text-gray-500 block text-xs">电网合规性</Text>
                        <Text strong className="text-sm">{inverterData.gridCompliance}</Text>
                      </Col>
                    </Row>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === '2' && (
            <div>
              <div className="flex flex-wrap -mx-2 mb-6">
                <div className="w-full md:w-1/3 px-2 mb-4 md:mb-0">
                  <div className="bg-white p-3 rounded-lg shadow-md">
                    <div className="flex items-center mb-2">
                      <Activity size={16} className="mr-2 text-blue-600" />
                      <Text className="text-sm">Daily Peak Power</Text>
                    </div>
                    <div className="text-lg font-bold">{inverterData.dailyPeakPower}kW</div>
                  </div>
                </div>
                <div className="w-full md:w-1/3 px-2 mb-4 md:mb-0">
                  <div className="bg-white p-3 rounded-lg shadow-md">
                    <div className="flex items-center mb-2">
                      <Clock size={16} className="mr-2 text-blue-600" />
                      <Text className="text-sm">Power Generation Time</Text>
                    </div>
                    <div className="text-lg font-bold">{inverterData.powerGenerationTime}h</div>
                  </div>
                </div>
                <div className="w-full md:w-1/3 px-2">
                  <div className="bg-white p-3 rounded-lg shadow-md">
                    <div className="flex items-center mb-2">
                      <Activity size={16} className="mr-2 text-blue-600" />
                      <Text className="text-sm">Performance Ratio</Text>
                    </div>
                    <div className="text-lg font-bold">{inverterData.performanceRatio}</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-4 rounded-lg shadow-md mb-6">
                <Title level={5} className="mb-3 text-base font-medium">输出功率 (24h)</Title>
                <div style={{ width: '100%', height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={powerOutputData}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis 
                        dataKey="time" 
                        tick={{ fontSize: 11 }}
                        tickCount={6}
                        axisLine={{ stroke: '#E0E0E0' }}
                      />
                      <YAxis 
                        label={{ value: 'kW', angle: -90, position: 'insideLeft', fontSize: 11 }}
                        tick={{ fontSize: 11 }}
                        axisLine={{ stroke: '#E0E0E0' }}
                        domain={[0, 100]}
                      />
                      <Tooltip />
                      <Area 
                        type="monotone" 
                        dataKey="power" 
                        stroke="#4FD1C5" 
                        fill="#4FD1C5" 
                        fillOpacity={0.3}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === '3' && (
            <div className="bg-white p-4 rounded-lg shadow-md">
              <div className="flex mb-6 justify-center space-x-6">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-teal-500 mr-2"></div>
                  <span className="text-sm">{inverterData.normalStrings}正常</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-orange-500 mr-2"></div>
                  <span className="text-sm">{inverterData.warningStrings}异常</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-gray-400 mr-2"></div>
                  <span className="text-sm">{inverterData.offlineStrings}离线</span>
                </div>
              </div>
              
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <Text strong className="text-sm">逆变器</Text>
                  <div className="flex items-center">
                    <Text className="mr-2 text-xs">{currentPage}/{totalPages}</Text>
                    <button
                      onClick={handlePrevPage}
                      disabled={currentPage === 1}
                      className="p-1 mr-1 rounded-full disabled:opacity-50 hover:bg-gray-100"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <button
                      onClick={handleNextPage}
                      disabled={currentPage === totalPages}
                      className="p-1 rounded-full disabled:opacity-50 hover:bg-gray-100"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
                
                <div>
                  {currentStringData.map((string, index) => (
                    <div key={string.id} className="flex justify-between items-center p-2 border-b">
                      <div className="flex items-center">
                        <div 
                          className="w-20 h-1.5 mr-3 rounded-full" 
                          style={{ backgroundColor: getStatusColor(string.status) }}
                        ></div>
                        <Text className="text-xs">{string.id}</Text>
                      </div>
                      <div className="flex space-x-4">
                        <Text className="text-xs">{string.voltage} V</Text>
                        <Text className="text-xs">{string.current} A</Text>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex justify-center p-4 border-t">
          <button 
            onClick={handleCancel}
            className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-50 text-sm"
          >
            关闭
          </button>
        </div>
      </div>
    </Modal>
  );
}
