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

const RejectionSim: React.FC = () => {
  const { chartData } = useSimContext();

  return (
    <div style={{ marginBottom: "40px" }}>
      <h3>Rejection Rates Over Time</h3>
      <ResponsiveContainer width="100%" height={500}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="time"
            label={{ value: "Time", position: "insideBottom", offset: -5 }}
          />
          <YAxis
            label={{
              value: "Rejection Rate",
              angle: -90,
              position: "insideLeft",
            }}
          />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="rejRate1"
            name="Rejection Rate R1"
            stroke="#ff4500"
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="rejRate2"
            name="Rejection Rate R2"
            stroke="#000080"
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RejectionSim;
