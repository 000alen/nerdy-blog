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

const DemandCapacitySim: React.FC = () => {
  const { C, chartData } = useSimContext();

  return (
    <div style={{ marginBottom: "40px" }}>
      <h4>Compute Demand vs. Capacity Over Time</h4>
      <ResponsiveContainer width="100%" height={500}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="time"
            label={{ value: "Time", position: "insideBottom", offset: -5 }}
          />
          <YAxis
            label={{
              value: "Compute Demand",
              angle: -90,
              position: "insideLeft",
            }}
          />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="D"
            name="Compute Demand D(t)"
            stroke="#8884d8"
            dot={false}
          />
          <Line
            type="monotone"
            dataKey={() => C}
            name="Compute Capacity C"
            stroke="#82ca9d"
            strokeDasharray="5 5"
            dot={false}
            // Render a constant line for capacity
            // isUpdateActive={false}
            data={chartData.map((d) => ({ ...d, C }))}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DemandCapacitySim;
