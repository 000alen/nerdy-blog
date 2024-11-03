"use client";

import React, { useState, useEffect } from "react";
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

interface SimulationState {
  R1: number;
  R2: number;
  Rrej1: number;
  Rrej2: number;
}

interface ChartData {
  time: number;
  R1: number;
  R2: number;
  D: number;
  S: number;
  T1: number;
  T2: number;
  Rrej1: number;
  Rrej2: number;
  rejRate1: number;
  rejRate2: number;
}

const DifferentialEquationSimulation: React.FC = () => {
  const [chartData, setChartData] = useState<ChartData[]>([]);

  useEffect(() => {
    // Simulation Parameters
    const E1_coefficient = 1.0; // Coefficient for O(n^2) algorithm
    const E2_coefficient = 1.0; // Coefficient for O(n) algorithm

    const mu_n = 10.0; // Mean of request size n
    const sigma_n = 2.0; // Standard deviation of request size n

    const E1_avg = E1_coefficient * (mu_n ** 2 + sigma_n ** 2); // Expected E1 per request
    const E2_avg = E2_coefficient * mu_n; // Expected E2 per request

    const C = 1000.0; // Total compute capacity

    const T1_0 = 1.0; // Base processing time for O(n^2)
    const T2_0 = 1.0; // Base processing time for O(n)

    const lambda1 = 50.0; // Arrival rate for O(n^2) requests
    const lambda2 = 50.0; // Arrival rate for O(n) requests

    const T1_max = 10.0; // Max latency for O(n^2)
    const T2_max = 10.0; // Max latency for O(n)

    // Simulation Settings
    const t_start = 0;
    const t_end = 50;
    const num_points = 1000;
    const dt = (t_end - t_start) / num_points;

    // Initialize state
    let state: SimulationState = {
      R1: 0.0,
      R2: 0.0,
      Rrej1: 0.0,
      Rrej2: 0.0,
    };

    const data: ChartData[] = [];

    // Euler's Method Simulation
    for (let i = 0; i <= num_points; i++) {
      const t = t_start + i * dt;

      const { R1, R2, Rrej1, Rrej2 } = state;

      // Compute demand
      const D = E1_avg * R1 + E2_avg * R2;

      // Scaling factor
      const S = D > C ? D / C : 1.0;

      // Processing times with scaling
      const T1 = T1_0 * Math.pow(S, 2); // Quadratic scaling for O(n^2)
      const T2 = T2_0 * S; // Linear scaling for O(n)

      // Effective arrival rates based on latency thresholds
      const lambda1_eff = T1 <= T1_max ? lambda1 : 0.0;
      const lambda2_eff = T2 <= T2_max ? lambda2 : 0.0;

      // Processing rates
      const mu1 = T1 > 0 ? R1 / T1 : 0.0;
      const mu2 = T2 > 0 ? R2 / T2 : 0.0;

      // Rejection rates
      const rejRate1 = T1 <= T1_max ? 0.0 : lambda1;
      const rejRate2 = T2 <= T2_max ? 0.0 : lambda2;

      // Update state using Euler's Method
      const dR1_dt = lambda1_eff - mu1;
      const dR2_dt = lambda2_eff - mu2;
      const dRrej1_dt = lambda1 - lambda1_eff;
      const dRrej2_dt = lambda2 - lambda2_eff;

      state.R1 += dR1_dt * dt;
      state.R2 += dR2_dt * dt;
      state.Rrej1 += dRrej1_dt * dt;
      state.Rrej2 += dRrej2_dt * dt;

      // Ensure no negative values
      state.R1 = Math.max(state.R1, 0);
      state.R2 = Math.max(state.R2, 0);
      state.Rrej1 = Math.max(state.Rrej1, 0);
      state.Rrej2 = Math.max(state.Rrej2, 0);

      // Record data for plotting
      data.push({
        time: t,
        R1: state.R1,
        R2: state.R2,
        D: D,
        S: S,
        T1: T1,
        T2: T2,
        Rrej1: state.Rrej1,
        Rrej2: state.Rrej2,
        rejRate1: rejRate1,
        rejRate2: rejRate2,
      });
    }

    setChartData(data);
  }, []);

  return (
    <div>
      <h2>Interactive System Simulation</h2>
      
      {/* Number of Requests in the System */}
      <div style={{ marginBottom: "50px" }}>
        <h3>Number of Requests in the System Over Time</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" label={{ value: "Time", position: "insideBottom", offset: -5 }} />
            <YAxis label={{ value: "Number of Requests", angle: -90, position: "insideLeft" }} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="R1" name="R1 (O(n²) Requests)" stroke="#ff7300" />
            <Line type="monotone" dataKey="R2" name="R2 (O(n) Requests)" stroke="#387908" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Compute Demand vs. Capacity */}
      <div style={{ marginBottom: "50px" }}>
        <h3>Compute Demand vs. Capacity Over Time</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" label={{ value: "Time", position: "insideBottom", offset: -5 }} />
            <YAxis label={{ value: "Compute Demand", angle: -90, position: "insideLeft" }} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="D" name="Compute Demand D(t)" stroke="#8884d8" />
            <Line
              type="monotone"
              dataKey={() => 1000}
              name="Compute Capacity C"
              stroke="#82ca9d"
              strokeDasharray="5 5"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Processing Latency */}
      <div style={{ marginBottom: "50px" }}>
        <h3>Processing Latency Over Time</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" label={{ value: "Time", position: "insideBottom", offset: -5 }} />
            <YAxis label={{ value: "Latency", angle: -90, position: "insideLeft" }} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="T1" name="T₁(t) for O(n²)" stroke="#ff0000" />
            <Line type="monotone" dataKey="T2" name="T₂(t) for O(n)" stroke="#0000ff" />
            <Line
              type="monotone"
              dataKey={() => 10}
              name="T₁_max & T₂_max"
              stroke="#000000"
              strokeDasharray="3 3"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Cumulative Rejected Requests */}
      <div style={{ marginBottom: "50px" }}>
        <h3>Cumulative Rejected Requests Over Time</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" label={{ value: "Time", position: "insideBottom", offset: -5 }} />
            <YAxis label={{ value: "Cumulative Rejections", angle: -90, position: "insideLeft" }} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="Rrej1" name="Rejected R1" stroke="#ff6347" />
            <Line type="monotone" dataKey="Rrej2" name="Rejected R2" stroke="#1e90ff" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Rejection Rates Over Time */}
      <div style={{ marginBottom: "50px" }}>
        <h3>Rejection Rates Over Time</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" label={{ value: "Time", position: "insideBottom", offset: -5 }} />
            <YAxis label={{ value: "Rejection Rate", angle: -90, position: "insideLeft" }} />
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
    </div>
  );
};

export default DifferentialEquationSimulation;
