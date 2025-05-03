
import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip
} from 'recharts';

interface DataPoint {
  time: string;
  value: number;
  [key: string]: any;
}

interface LineChartProps {
  data: DataPoint[];
  dataKey: string;
  color: string;
  height?: number;
  showGrid?: boolean;
  showAxis?: boolean;
  animated?: boolean;
}

const SimpleLineChart: React.FC<LineChartProps> = ({
  data,
  dataKey,
  color,
  height = 200,
  showGrid = true,
  showAxis = true,
  animated = true
}) => {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart
        data={data}
        margin={{
          top: 5,
          right: 10,
          left: showAxis ? 0 : -40,
          bottom: 5,
        }}
      >
        {showGrid && <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />}
        {showAxis && <XAxis dataKey="time" tick={{ fontSize: 12 }} stroke="#888888" />}
        {showAxis && <YAxis tick={{ fontSize: 12 }} stroke="#888888" />}
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'white', 
            border: '1px solid #f0f0f0',
            borderRadius: '4px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            padding: '8px'
          }}
          labelStyle={{ fontWeight: 'bold', marginBottom: '4px' }}
        />
        <Line
          type="monotone"
          dataKey={dataKey}
          stroke={color}
          strokeWidth={2}
          dot={false}
          isAnimationActive={animated}
          animationDuration={1000}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default SimpleLineChart;
