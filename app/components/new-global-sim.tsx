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
import { useDebounce } from "use-debounce";

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
  // Adjustable Parameters with default values
  const [E1_coefficient, setE1Coefficient] = useState<number>(1.0);
  const [E2_coefficient, setE2Coefficient] = useState<number>(1.0);
  const [mu_n, setMuN] = useState<number>(10.0);
  const [sigma_n, setSigmaN] = useState<number>(2.0);
  const [C, setC] = useState<number>(1000.0);
  const [T1_0, setT1_0] = useState<number>(1.0);
  const [T2_0, setT2_0] = useState<number>(1.0);
  const [lambda1, setLambda1] = useState<number>(50.0);
  const [lambda2, setLambda2] = useState<number>(50.0);
  const [T1_max, setT1Max] = useState<number>(10.0);
  const [T2_max, setT2Max] = useState<number>(10.0);

  // Define debounce delay in milliseconds
  const DEBOUNCE_DELAY = 500; // Adjust as needed

  // Debounced parameters
  const [debouncedE1_coefficient] = useDebounce(E1_coefficient, DEBOUNCE_DELAY);
  const [debouncedE2_coefficient] = useDebounce(E2_coefficient, DEBOUNCE_DELAY);
  const [debouncedMu_n] = useDebounce(mu_n, DEBOUNCE_DELAY);
  const [debouncedSigma_n] = useDebounce(sigma_n, DEBOUNCE_DELAY);
  const [debouncedC] = useDebounce(C, DEBOUNCE_DELAY);
  const [debouncedT1_0] = useDebounce(T1_0, DEBOUNCE_DELAY);
  const [debouncedT2_0] = useDebounce(T2_0, DEBOUNCE_DELAY);
  const [debouncedLambda1] = useDebounce(lambda1, DEBOUNCE_DELAY);
  const [debouncedLambda2] = useDebounce(lambda2, DEBOUNCE_DELAY);
  const [debouncedT1_max] = useDebounce(T1_max, DEBOUNCE_DELAY);
  const [debouncedT2_max] = useDebounce(T2_max, DEBOUNCE_DELAY);

  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (
      debouncedE1_coefficient === undefined ||
      debouncedE2_coefficient === undefined
    )
      return;

    setIsLoading(true);

    // Simulation Parameters from debounced state
    const E1_coef = debouncedE1_coefficient; // Coefficient for O(n^2) algorithm
    const E2_coef = debouncedE2_coefficient; // Coefficient for O(n) algorithm

    const mu_n_val = debouncedMu_n; // Mean of request size n
    const sigma_n_val = debouncedSigma_n; // Standard deviation of request size n

    const E1_avg = E1_coef * (mu_n_val ** 2 + sigma_n_val ** 2); // Expected E1 per request
    const E2_avg = E2_coef * mu_n_val; // Expected E2 per request

    const C_val = debouncedC; // Total compute capacity

    const T10 = debouncedT1_0; // Base processing time for O(n^2)
    const T20 = debouncedT2_0; // Base processing time for O(n)

    const lambda1_val = debouncedLambda1; // Arrival rate for O(n^2) requests
    const lambda2_val = debouncedLambda2; // Arrival rate for O(n) requests

    const T1max = debouncedT1_max; // Max latency for O(n^2)
    const T2max = debouncedT2_max; // Max latency for O(n)

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
      const S = D > C_val ? D / C_val : 1.0;

      // Processing times with scaling
      const T1 = T10 * Math.pow(S, 2); // Quadratic scaling for O(n^2)
      const T2 = T20 * S; // Linear scaling for O(n)

      // Effective arrival rates based on latency thresholds
      const lambda1_eff = T1 <= T1max ? lambda1_val : 0.0;
      const lambda2_eff = T2 <= T2max ? lambda2_val : 0.0;

      // Processing rates
      const mu1 = T1 > 0 ? R1 / T1 : 0.0;
      const mu2 = T2 > 0 ? R2 / T2 : 0.0;

      // Rejection rates
      const rejRate1 = T1 <= T1max ? 0.0 : lambda1_val;
      const rejRate2 = T2 <= T2max ? 0.0 : lambda2_val;

      // Update state using Euler's Method
      const dR1_dt = lambda1_eff - mu1;
      const dR2_dt = lambda2_eff - mu2;
      const dRrej1_dt = lambda1_val - lambda1_eff;
      const dRrej2_dt = lambda2_val - lambda2_eff;

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
        time: parseFloat(t.toFixed(2)),
        R1: parseFloat(state.R1.toFixed(2)),
        R2: parseFloat(state.R2.toFixed(2)),
        D: parseFloat(D.toFixed(2)),
        S: parseFloat(S.toFixed(2)),
        T1: parseFloat(T1.toFixed(2)),
        T2: parseFloat(T2.toFixed(2)),
        Rrej1: parseFloat(state.Rrej1.toFixed(2)),
        Rrej2: parseFloat(state.Rrej2.toFixed(2)),
        rejRate1: rejRate1,
        rejRate2: rejRate2,
      });
    }

    setChartData(data);
    setIsLoading(false);
  }, [
    debouncedE1_coefficient,
    debouncedE2_coefficient,
    debouncedMu_n,
    debouncedSigma_n,
    debouncedC,
    debouncedT1_0,
    debouncedT2_0,
    debouncedLambda1,
    debouncedLambda2,
    debouncedT1_max,
    debouncedT2_max,
  ]);

  // Reset function to restore default parameters
  const resetParameters = () => {
    setE1Coefficient(1.0);
    setE2Coefficient(1.0);
    setMuN(10.0);
    setSigmaN(2.0);
    setC(1000.0);
    setT1_0(1.0);
    setT2_0(1.0);
    setLambda1(50.0);
    setLambda2(50.0);
    setT1Max(10.0);
    setT2Max(10.0);
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h2>Interactive System Simulation</h2>

      {/* Loading Indicator */}
      {isLoading && (
        <div style={{ marginBottom: "20px", color: "blue" }}>
          Updating simulation...
        </div>
      )}

      {/* Parameter Sliders */}
      <div style={{ marginBottom: "40px" }}>
        <h3>Adjust Simulation Parameters</h3>

        {/* Reset Button */}
        <div style={{ marginBottom: "20px" }}>
          <button onClick={resetParameters}>Reset to Default Parameters</button>
        </div>

        <div className="slider-container">
          <div className="slider-group">
            <label>
              E1 Coefficient (O(n²)): {E1_coefficient}
              <input
                type="range"
                min="0.1"
                max="5.0"
                step="0.1"
                value={E1_coefficient}
                onChange={(e) => setE1Coefficient(parseFloat(e.target.value))}
              />
            </label>
          </div>

          <div className="slider-group">
            <label>
              E2 Coefficient (O(n)): {E2_coefficient}
              <input
                type="range"
                min="0.1"
                max="5.0"
                step="0.1"
                value={E2_coefficient}
                onChange={(e) => setE2Coefficient(parseFloat(e.target.value))}
              />
            </label>
          </div>

          <div className="slider-group">
            <label>
              Mean Request Size (μₙ): {mu_n}
              <input
                type="range"
                min="1"
                max="20"
                step="1"
                value={mu_n}
                onChange={(e) => setMuN(parseFloat(e.target.value))}
              />
            </label>
          </div>

          <div className="slider-group">
            <label>
              Request Size Std Dev (σₙ): {sigma_n}
              <input
                type="range"
                min="0"
                max="10"
                step="0.5"
                value={sigma_n}
                onChange={(e) => setSigmaN(parseFloat(e.target.value))}
              />
            </label>
          </div>

          <div className="slider-group">
            <label>
              Compute Capacity (C): {C}
              <input
                type="range"
                min="500"
                max="2000"
                step="100"
                value={C}
                onChange={(e) => setC(parseFloat(e.target.value))}
              />
            </label>
          </div>

          <div className="slider-group">
            <label>
              Base T₁₀ (O(n²)): {T1_0}
              <input
                type="range"
                min="0.1"
                max="5.0"
                step="0.1"
                value={T1_0}
                onChange={(e) => setT1_0(parseFloat(e.target.value))}
              />
            </label>
          </div>

          <div className="slider-group">
            <label>
              Base T₂₀ (O(n)): {T2_0}
              <input
                type="range"
                min="0.1"
                max="5.0"
                step="0.1"
                value={T2_0}
                onChange={(e) => setT2_0(parseFloat(e.target.value))}
              />
            </label>
          </div>

          <div className="slider-group">
            <label>
              Arrival Rate λ₁ (O(n²)): {lambda1}
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={lambda1}
                onChange={(e) => setLambda1(parseFloat(e.target.value))}
              />
            </label>
          </div>

          <div className="slider-group">
            <label>
              Arrival Rate λ₂ (O(n)): {lambda2}
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={lambda2}
                onChange={(e) => setLambda2(parseFloat(e.target.value))}
              />
            </label>
          </div>

          <div className="slider-group">
            <label>
              Max Latency T₁ₘₐₓ (O(n²)): {T1_max}
              <input
                type="range"
                min="5"
                max="20"
                step="1"
                value={T1_max}
                onChange={(e) => setT1Max(parseFloat(e.target.value))}
              />
            </label>
          </div>

          <div className="slider-group">
            <label>
              Max Latency T₂ₘₐₓ (O(n)): {T2_max}
              <input
                type="range"
                min="5"
                max="20"
                step="1"
                value={T2_max}
                onChange={(e) => setT2Max(parseFloat(e.target.value))}
              />
            </label>
          </div>
        </div>
      </div>

      {/* Number of Requests in the System */}
      {/* <div style={{ marginBottom: "40px" }}>
        <h3>Number of Requests in the System Over Time</h3>
        <ResponsiveContainer width="100%" height={500}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="time"
              label={{ value: "Time", position: "insideBottom", offset: -5 }}
            />
            <YAxis
              label={{
                value: "Number of Requests",
                angle: -90,
                position: "insideLeft",
              }}
            />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="R1"
              name="R1 (O(n²) Requests)"
              stroke="#ff7300"
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="R2"
              name="R2 (O(n) Requests)"
              stroke="#387908"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div> */}

      {/* Compute Demand vs. Capacity */}
      <div style={{ marginBottom: "40px" }}>
        <h3>Compute Demand vs. Capacity Over Time</h3>
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

      {/* Processing Latency */}
      <div style={{ marginBottom: "40px" }}>
        <h3>Processing Latency Over Time</h3>
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

      {/* Cumulative Rejected Requests */}
      {/* <div style={{ marginBottom: "40px" }}>
        <h3>Cumulative Rejected Requests Over Time</h3>
        <ResponsiveContainer width="100%" height={500}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="time"
              label={{ value: "Time", position: "insideBottom", offset: -5 }}
            />
            <YAxis
              label={{
                value: "Cumulative Rejections",
                angle: -90,
                position: "insideLeft",
              }}
            />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="Rrej1"
              name="Rejected R1"
              stroke="#ff6347"
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="Rrej2"
              name="Rejected R2"
              stroke="#1e90ff"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div> */}

      {/* Rejection Rates Over Time */}
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
    </div>
  );
};

export default DifferentialEquationSimulation;
