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

interface Transition {
  to: number;
  label: string;
}

interface State {
  id: number;
  transitions: Transition[];
}

const nfaStates: State[] = [
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
];

const dfaStates: State[] = [
  { id: 0, transitions: [{ to: 1, label: "x" }] },
  { id: 1, transitions: [{ to: 2, label: "=" }] },
  { id: 2, transitions: [{ to: 3, label: "x" }] },
  { id: 3, transitions: [{ to: 3, label: "x" }] },
];

const NFA_DFAComparison: React.FC = () => {
  const [inputSize, setInputSize] = useState<number>(5);
  const [chartData, setChartData] = useState<
    { inputSize: number; nfaSteps: number; dfaSteps: number }[]
  >([]);

  const generateInputString = (size: number): string => "x=".padEnd(size, "x");

  const simulateNFA = (inputString: string): number => {
    let steps = 0;
    const queue: { currentState: number; position: number; path: number[] }[] =
      [{ currentState: 0, position: 0, path: [0] }];
    while (queue.length > 0) {
      steps++;
      const { currentState, position } = queue.shift()!;
      const currentChar = inputString[position];
      const state = nfaStates.find((s) => s.id === currentState);
      if (!state) continue;
      if (position === inputString.length && currentState === 4) {
        return steps;
      }
      state.transitions.forEach(({ to, label }) => {
        if (label === "ε" || label === currentChar || label === ".") {
          queue.push({
            currentState: to,
            position: label === "ε" ? position : position + 1,
            path: [],
          });
        }
      });
    }
    return steps;
  };

  const simulateDFA = (inputString: string): number => {
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
    return steps;
  };

  useEffect(() => {
    const data: { inputSize: number; nfaSteps: number; dfaSteps: number }[] =
      [];
    for (let size = 1; size <= inputSize; size++) {
      const input = generateInputString(size);
      const nfaSteps = simulateNFA(input);
      const dfaSteps = simulateDFA(input);
      data.push({ inputSize: size, nfaSteps, dfaSteps });
    }
    setChartData(data);
  }, [inputSize]);

  return (
    <div>
      <h2>NFA vs DFA Compute Steps Comparison</h2>
      <label>
        Input Size:
        <input
          type="range"
          min="1"
          max="50"
          value={inputSize}
          onChange={(e) => setInputSize(parseInt(e.target.value, 10))}
        />
        {inputSize}
      </label>

      <ResponsiveContainer width="100%" height={500}>
        <LineChart
          data={chartData}
          // margin={{ top: 20, right: 20, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="inputSize"
            label={{
              value: "Input Size",
              position: "insideBottom",
              offset: -5,
            }}
          />
          <YAxis
            label={{
              value: "Compute Steps",
              angle: -90,
              position: "insideLeft",
            }}
          />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="nfaSteps"
            stroke="#4bc0c0"
            name="NFA Compute Steps"
          />
          <Line
            type="monotone"
            dataKey="dfaSteps"
            stroke="#ff6384"
            name="DFA Compute Steps"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default NFA_DFAComparison;
