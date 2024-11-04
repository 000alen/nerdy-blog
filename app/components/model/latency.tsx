"use client";

import React from "react";
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
import { useSimContext } from ".";

const LatencySim: React.FC = () => {
  const { T1_max, chartData } = useSimContext();

  return (
    <div style={{ marginBottom: "40px" }}>
      <h4>Processing Latency Over Time</h4>
      <ResponsiveContainer width="100%" height={500}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="time"
            label={{ value: "Time", position: "insideBottom", offset: -5 }}
          />
          <YAxis
            label={{
              value: "Latency",
              angle: -90,
              position: "insideLeft",
            }}
          />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="T1"
            name="T₁(t) for O(n²)"
            stroke="#ff0000"
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="T2"
            name="T₂(t) for O(n)"
            stroke="#0000ff"
            dot={false}
          />
          {/* Plot T1_max and T2_max as reference lines */}
          <Line
            type="monotone"
            dataKey={() => T1_max}
            name="T₁_max & T₂_max"
            stroke="#000000"
            strokeDasharray="3 3"
            dot={false}
            data={chartData.map((d) => ({ ...d, T_max: T1_max }))}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LatencySim;
