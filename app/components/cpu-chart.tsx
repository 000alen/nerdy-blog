"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// Mock data for CPU usage before, during, and after the RegEx deployment
const cpuData = [
  { time: "13:30", CPU: 40 },
  { time: "13:40", CPU: 45 },
  { time: "13:50", CPU: 95 }, // Spiking during deployment
  { time: "14:00", CPU: 100 }, // Peak failure time
  { time: "14:10", CPU: 50 },
  { time: "14:20", CPU: 30 },
];

const CPUChart = () => {
  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart
        data={cpuData}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="time" />
        <YAxis
          label={{ value: "CPU Usage (%)", angle: -90, position: "insideLeft" }}
        />
        <Tooltip />
        <Legend />
        <Line
          type="monotone"
          dataKey="CPU"
          stroke="#8884d8"
          activeDot={{ r: 8 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default CPUChart;
