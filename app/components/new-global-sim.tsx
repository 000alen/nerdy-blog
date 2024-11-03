"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
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
import * as d3 from "d3";
import { Button, Slider, Select, InputNumber, Switch } from "antd";
// import "antd/dist/antd.css";

// Define interfaces for NFA and DFA states
interface Transition {
  to: number;
  label: string;
}

interface State {
  id: number;
  transitions: Transition[];
}

interface ChartDataPoint {
  time: number;
  nfaCpuUsedNormalized: number;
  dfaCpuUsedNormalized: number;
  nfaMemoryUsedNormalized: number;
  dfaMemoryUsedNormalized: number;
  nfaIoUsedNormalized: number;
  dfaIoUsedNormalized: number;
  nfaDropped: number;
  dfaDropped: number;
  nfaLatency: number;
  dfaLatency: number;
}

interface ComputeCapacity {
  cpu: number;
  memory: number;
  io: number;
}

const NFA_DFA_Simulation: React.FC = () => {
  // State Variables
  const [numRequests, setNumRequests] = useState<number>(100);
  const [computeCapacity, setComputeCapacity] = useState<ComputeCapacity>({
    cpu: 1000,
    memory: 500,
    io: 300,
  });
  const [inputSizes, setInputSizes] = useState<number[]>([]);
  const [distribution, setDistribution] = useState<
    "normal" | "uniform" | "poisson"
  >("poisson");
  const [inputType, setInputType] = useState<string>("alphanumeric");
  const [nfaFailureRate, setNfaFailureRate] = useState<number>(5); // in %
  const [dfaFailureRate, setDfaFailureRate] = useState<number>(3); // in %
  const [simulationPaused, setSimulationPaused] = useState<boolean>(false);

  // Simulation State
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [nfaStateUsage, setNfaStateUsage] = useState<{
    cpu: number;
    memory: number;
    io: number;
  }>({ cpu: 0, memory: 0, io: 0 });
  const [dfaStateUsage, setDfaStateUsage] = useState<{
    cpu: number;
    memory: number;
    io: number;
  }>({ cpu: 0, memory: 0, io: 0 });
  const [nfaDroppedRequests, setNfaDroppedRequests] = useState<number>(0);
  const [dfaDroppedRequests, setDfaDroppedRequests] = useState<number>(0);
  const [nfaLatency, setNfaLatency] = useState<number>(0);
  const [dfaLatency, setDfaLatency] = useState<number>(0);

  const [throughput, setThroughput] = useState<number>(0);

  // Reference to control simulation
  const simulationRef = useRef<boolean>(false);

  // Define NFA and DFA States using useMemo to prevent re-creation on re-renders
  const nfaStates: State[] = useMemo(
    () => [
      {
        id: 0,
        transitions: [
          { to: 1, label: "ε" },
          { to: 2, label: "ε" },
        ],
      },
      { id: 1, transitions: [{ to: 1, label: "." }] },
      {
        id: 2,
        transitions: [
          { to: 2, label: "." },
          { to: 3, label: "=" },
        ],
      },
      {
        id: 3,
        transitions: [
          { to: 3, label: "." },
          { to: 4, label: "ε" },
        ],
      },
      { id: 4, transitions: [] },
    ],
    []
  );

  const dfaStates: State[] = useMemo(
    () => [
      { id: 0, transitions: [{ to: 1, label: "x" }] },
      { id: 1, transitions: [{ to: 2, label: "=" }] },
      { id: 2, transitions: [{ to: 3, label: "x" }] },
      { id: 3, transitions: [{ to: 3, label: "x" }] },
    ],
    []
  );

  // Utility Functions
  const generateNormalInputSizes = (
    mean: number,
    stdDev: number,
    num: number
  ): number[] => {
    const normalDist = d3.randomNormal(mean, stdDev);
    return Array.from({ length: num }, () =>
      Math.max(1, Math.floor(normalDist()))
    );
  };

  const generateUniformInputSizes = (
    min: number,
    max: number,
    num: number
  ): number[] => {
    const uniformDist = d3.randomUniform(min, max);
    return Array.from({ length: num }, () =>
      Math.max(1, Math.floor(uniformDist()))
    );
  };

  const generatePoissonInputSizes = (lambda: number, num: number): number[] => {
    const poissonDist = d3.randomPoisson(lambda);
    return Array.from({ length: num }, () => Math.max(1, poissonDist()));
  };

  const generateRandomInputString = (
    size: number,
    pattern: string = "alphanumeric"
  ): string => {
    let chars = "";
    switch (pattern) {
      case "alphanumeric":
        chars = "abcdefghijklmnopqrstuvwxyz0123456789";
        break;
      case "email":
        // Simplistic email generator
        return `user${Math.floor(Math.random() * 1000)}@example.com`;
      case "url":
        return `https://www.example.com/page/${Math.floor(
          Math.random() * 1000
        )}`;
      case "custom":
        chars = "x=";
        break;
      default:
        chars = "abcdefghijklmnopqrstuvwxyz0123456789";
    }

    return Array.from({ length: size }, () =>
      chars.charAt(Math.floor(Math.random() * chars.length))
    ).join("");
  };

  // Simulate NFA processing
  const simulateNFA = (
    inputString: string
  ): { steps: number; accepted: boolean } => {
    let steps = 0;
    let currentStates = new Set<number>([0]); // Start with initial state
    let nextStates = new Set<number>();

    for (let i = 0; i <= inputString.length; i++) {
      steps++;
      currentStates.forEach((stateId) => {
        const state = nfaStates.find((s) => s.id === stateId);
        if (!state) return;

        state.transitions.forEach(({ to, label }) => {
          if (label === "ε") {
            nextStates.add(to);
          } else if (i < inputString.length) {
            const currentChar = inputString[i];
            if (label === currentChar || label === ".") {
              nextStates.add(to);
            }
          }
        });
      });

      currentStates = new Set(nextStates);
      nextStates.clear();

      if (currentStates.has(4) && i === inputString.length) {
        return { steps, accepted: true };
      }
    }

    return { steps, accepted: false };
  };

  // Simulate DFA processing
  const simulateDFA = (
    inputString: string
  ): { steps: number; accepted: boolean } => {
    let steps = 0;
    let currentState = 0;

    for (let i = 0; i < inputString.length; i++) {
      steps++;
      const currentChar = inputString[i];
      const state = dfaStates.find((s) => s.id === currentState);
      if (!state) break;
      const transition = state.transitions.find((t) => t.label === currentChar);
      if (!transition) break;
      currentState = transition.to;
    }

    // Assuming state 3 is the accepting state
    return { steps, accepted: currentState === 3 };
  };

  // Simulation Logic
  const simulateRequestProcessing = async () => {
    simulationRef.current = true;
    const sizes = inputSizes;
    const total = sizes.length;
    let processed = 0;

    // Initialize capacity usage
    let currentNfaCpu = 0;
    let currentNfaMemory = 0;
    let currentNfaIo = 0;
    let currentDfaCpu = 0;
    let currentDfaMemory = 0;
    let currentDfaIo = 0;

    // Initialize dropped requests and latency
    let nfaDropped = 0;
    let dfaDropped = 0;
    let totalNfaLatency = 0;
    let totalDfaLatency = 0;

    for (let i = 0; i < sizes.length; i++) {
      if (!simulationRef.current) break;

      // Pause functionality
      while (simulationPaused) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        if (!simulationRef.current) break;
      }

      const size = sizes[i];
      const inputString = generateRandomInputString(size, inputType);

      // Simulate NFA
      const nfaStart = performance.now();
      const nfaResult = simulateNFA(inputString);
      const nfaEnd = performance.now();
      const nfaTime = nfaEnd - nfaStart;
      totalNfaLatency += nfaTime;

      // Simulate DFA
      const dfaStart = performance.now();
      const dfaResult = simulateDFA(inputString);
      const dfaEnd = performance.now();
      const dfaTime = dfaEnd - dfaStart;
      totalDfaLatency += dfaTime;

      // Simulate failures
      const nfaFailure = Math.random() < nfaFailureRate / 100;
      const dfaFailure = Math.random() < dfaFailureRate / 100;

      // Check capacity for NFA
      const nfaCpuNeeded = nfaResult.steps;
      const nfaMemoryNeeded = Math.floor(nfaResult.steps / 2);
      const nfaIoNeeded = Math.floor(nfaResult.steps / 3);

      if (
        currentNfaCpu + nfaCpuNeeded > computeCapacity.cpu ||
        currentNfaMemory + nfaMemoryNeeded > computeCapacity.memory ||
        currentNfaIo + nfaIoNeeded > computeCapacity.io
      ) {
        nfaDropped++;
      } else if (nfaFailure) {
        nfaDropped++;
      } else {
        currentNfaCpu += nfaCpuNeeded;
        currentNfaMemory += nfaMemoryNeeded;
        currentNfaIo += nfaIoNeeded;
      }

      // Check capacity for DFA
      const dfaCpuNeeded = dfaResult.steps;
      const dfaMemoryNeeded = Math.floor(dfaResult.steps / 2);
      const dfaIoNeeded = Math.floor(dfaResult.steps / 3);

      if (
        currentDfaCpu + dfaCpuNeeded > computeCapacity.cpu ||
        currentDfaMemory + dfaMemoryNeeded > computeCapacity.memory ||
        currentDfaIo + dfaIoNeeded > computeCapacity.io
      ) {
        dfaDropped++;
      } else if (dfaFailure) {
        dfaDropped++;
      } else {
        currentDfaCpu += dfaCpuNeeded;
        currentDfaMemory += dfaMemoryNeeded;
        currentDfaIo += dfaIoNeeded;
      }

      // Update throughput
      processed++;
      setThroughput(processed);

      // Normalize capacity usage
      const nfaCpuUsedNormalized =
        computeCapacity.cpu > 0 ? currentNfaCpu / computeCapacity.cpu : 0;
      const dfaCpuUsedNormalized =
        computeCapacity.cpu > 0 ? currentDfaCpu / computeCapacity.cpu : 0;
      const nfaMemoryUsedNormalized =
        computeCapacity.memory > 0
          ? currentNfaMemory / computeCapacity.memory
          : 0;
      const dfaMemoryUsedNormalized =
        computeCapacity.memory > 0
          ? currentDfaMemory / computeCapacity.memory
          : 0;
      const nfaIoUsedNormalized =
        computeCapacity.io > 0 ? currentNfaIo / computeCapacity.io : 0;
      const dfaIoUsedNormalized =
        computeCapacity.io > 0 ? currentDfaIo / computeCapacity.io : 0;

      // Push data to chart
      setChartData((prev) => [
        ...prev,
        {
          time: processed,
          nfaCpuUsedNormalized: parseFloat(nfaCpuUsedNormalized.toFixed(3)),
          dfaCpuUsedNormalized: parseFloat(dfaCpuUsedNormalized.toFixed(3)),
          nfaMemoryUsedNormalized: parseFloat(
            nfaMemoryUsedNormalized.toFixed(3)
          ),
          dfaMemoryUsedNormalized: parseFloat(
            dfaMemoryUsedNormalized.toFixed(3)
          ),
          nfaIoUsedNormalized: parseFloat(nfaIoUsedNormalized.toFixed(3)),
          dfaIoUsedNormalized: parseFloat(dfaIoUsedNormalized.toFixed(3)),
          nfaDropped: nfaDropped,
          dfaDropped: dfaDropped,
          nfaLatency: totalNfaLatency / processed,
          dfaLatency: totalDfaLatency / processed,
        },
      ]);

      // Simulate processing delay
      await new Promise((resolve) => setTimeout(resolve, 10)); // 10ms delay per request
    }

    // Update final state
    setNfaStateUsage({
      cpu: currentNfaCpu,
      memory: currentNfaMemory,
      io: currentNfaIo,
    });
    setDfaStateUsage({
      cpu: currentDfaCpu,
      memory: currentDfaMemory,
      io: currentDfaIo,
    });
    setNfaDroppedRequests(nfaDropped);
    setDfaDroppedRequests(dfaDropped);
    setNfaLatency(totalNfaLatency / processed);
    setDfaLatency(totalDfaLatency / processed);
    simulationRef.current = false;
  };

  // Handle Simulation Start
  const handleStartSimulation = () => {
    if (simulationRef.current) return; // Prevent multiple simulations
    setChartData([]);
    setNfaStateUsage({ cpu: 0, memory: 0, io: 0 });
    setDfaStateUsage({ cpu: 0, memory: 0, io: 0 });
    setNfaDroppedRequests(0);
    setDfaDroppedRequests(0);
    setNfaLatency(0);
    setDfaLatency(0);
    setThroughput(0);
    simulateRequestProcessing();
  };

  // Handle Simulation Stop
  const handleStopSimulation = () => {
    simulationRef.current = false;
  };

  // Generate Input Sizes based on selected distribution
  useEffect(() => {
    let sizes: number[] = [];
    switch (distribution) {
      case "normal":
        sizes = generateNormalInputSizes(10, 2, numRequests);
        break;
      case "uniform":
        sizes = generateUniformInputSizes(5, 15, numRequests);
        break;
      case "poisson":
        sizes = generatePoissonInputSizes(10, numRequests);
        break;
      default:
        sizes = generatePoissonInputSizes(10, numRequests);
    }
    setInputSizes(sizes);
  }, [numRequests, distribution, inputType]);

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      simulationRef.current = false;
    };
  }, []);

  return (
    <div>
      <h2>NFA vs DFA Realistic Request Simulation</h2>

      {/* Controls */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "20px",
          marginBottom: "20px",
          alignItems: "center",
        }}
      >
        <div>
          <label>
            Number of Requests:
            <InputNumber
              min={1}
              max={1000}
              value={numRequests}
              onChange={(value) => setNumRequests(value || 100)}
              style={{ marginLeft: "10px", width: "80px" }}
            />
          </label>
        </div>

        <div>
          <label>
            Compute Capacity:
            <div style={{ marginLeft: "10px" }}>
              <div>
                CPU:
                <Slider
                  min={100}
                  max={5000}
                  value={computeCapacity.cpu}
                  onChange={(value) =>
                    setComputeCapacity((prev) => ({ ...prev, cpu: value }))
                  }
                  style={{ width: "200px", marginLeft: "10px" }}
                />
              </div>
              <div>
                Memory:
                <Slider
                  min={100}
                  max={2000}
                  value={computeCapacity.memory}
                  onChange={(value) =>
                    setComputeCapacity((prev) => ({ ...prev, memory: value }))
                  }
                  style={{ width: "200px", marginLeft: "10px" }}
                />
              </div>
              <div>
                I/O:
                <Slider
                  min={50}
                  max={1000}
                  value={computeCapacity.io}
                  onChange={(value) =>
                    setComputeCapacity((prev) => ({ ...prev, io: value }))
                  }
                  style={{ width: "200px", marginLeft: "10px" }}
                />
              </div>
            </div>
          </label>
        </div>

        <div>
          <label>
            Input Distribution:
            <Select
              value={distribution}
              onChange={(value) => setDistribution(value)}
              style={{ width: "150px", marginLeft: "10px" }}
            >
              <Select.Option value="normal">Normal</Select.Option>
              <Select.Option value="uniform">Uniform</Select.Option>
              <Select.Option value="poisson">Poisson</Select.Option>
            </Select>
          </label>
        </div>

        <div>
          <label>
            Input Type:
            <Select
              value={inputType}
              onChange={(value) => setInputType(value)}
              style={{ width: "150px", marginLeft: "10px" }}
            >
              <Select.Option value="alphanumeric">Alphanumeric</Select.Option>
              <Select.Option value="email">Email</Select.Option>
              <Select.Option value="url">URL</Select.Option>
              <Select.Option value="custom">Custom</Select.Option>
            </Select>
          </label>
        </div>

        <div>
          <label>
            NFA Failure Rate (%):
            <InputNumber
              min={0}
              max={100}
              value={nfaFailureRate}
              onChange={(value) => setNfaFailureRate(value || 0)}
              style={{ marginLeft: "10px", width: "60px" }}
            />
          </label>
        </div>

        <div>
          <label>
            DFA Failure Rate (%):
            <InputNumber
              min={0}
              max={100}
              value={dfaFailureRate}
              onChange={(value) => setDfaFailureRate(value || 0)}
              style={{ marginLeft: "10px", width: "60px" }}
            />
          </label>
        </div>

        <div style={{ display: "flex", alignItems: "center" }}>
          <Switch
            checked={simulationPaused}
            onChange={(checked) => setSimulationPaused(checked)}
          />
          <span style={{ marginLeft: "10px" }}>Pause Simulation</span>
        </div>

        <div>
          <Button
            type="primary"
            onClick={handleStartSimulation}
            disabled={simulationRef.current}
          >
            Start Simulation
          </Button>
          <Button
            type="default"
            onClick={handleStopSimulation}
            disabled={!simulationRef.current}
            style={{ marginLeft: "10px" }}
          >
            Stop Simulation
          </Button>
        </div>
      </div>

      {/* Visualization */}
      <ResponsiveContainer width="100%" height={500}>
        <LineChart
          data={chartData}
          margin={{ top: 20, right: 20, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="time"
            label={{
              value: "Request Number",
              position: "insideBottom",
              offset: -5,
            }}
          />
          <YAxis
            yAxisId="left"
            label={{
              value: "Normalized CPU Usage",
              angle: -90,
              position: "insideLeft",
            }}
            domain={[0, 1]}
          />
          {/* <YAxis
            yAxisId="right"
            orientation="right"
            label={{
              value: "Dropped Requests",
              angle: -90,
              position: "insideRight",
            }}
          /> */}
          <Tooltip />
          <Legend verticalAlign="top" height={36} />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="nfaCpuUsedNormalized"
            stroke="#8884d8"
            name="NFA CPU Used (Normalized)"
            dot={false}
          />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="dfaCpuUsedNormalized"
            stroke="#82ca9d"
            name="DFA CPU Used (Normalized)"
            dot={false}
          />
          {/* <Line
            yAxisId="right"
            type="monotone"
            dataKey="nfaDropped"
            stroke="#ff7300"
            name="NFA Dropped"
            dot={false}
          /> */}
          {/* <Line
            yAxisId="right"
            type="monotone"
            dataKey="dfaDropped"
            stroke="#387908"
            name="DFA Dropped"
            dot={false}
          /> */}
        </LineChart>
      </ResponsiveContainer>

      {/* Additional Metrics Chart */}
      <ResponsiveContainer width="100%" height={500}>
        <LineChart
          data={chartData}
          margin={{ top: 20, right: 20, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="time"
            label={{
              value: "Request Number",
              position: "insideBottom",
              offset: -5,
            }}
          />
          <YAxis
            label={{
              value: "Latency (ms)",
              angle: -90,
              position: "insideLeft",
            }}
          />
          <Tooltip />
          <Legend verticalAlign="top" height={36} />
          <Line
            type="monotone"
            dataKey="nfaLatency"
            stroke="#ffbb28"
            name="NFA Latency"
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="dfaLatency"
            stroke="#d0ed57"
            name="DFA Latency"
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default NFA_DFA_Simulation;
