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
// import "./App.css"; // Assuming CSS for custom animations and styles
// import "./Simulation.css"; // CSS specifically for the grid and animations

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

export const RegexBacktrackingDemo = () => {
  const [input, setInput] = useState("x=x");
  const [steps, setSteps] = useState(0);
  const [simulationData, setSimulationData] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (simulationData.length > 0 && currentStep < simulationData.length) {
      const timer = setTimeout(() => {
        setCurrentStep((prev) => prev + 1);
      }, 500); // Adjust speed of the animation

      return () => clearTimeout(timer);
    }
  }, [simulationData, currentStep]);

  const calculateBacktracking = (input) => {
    let steps = 0;
    const regex = /.*.*=.*/;
    const data = [];

    // Simulate backtracking by counting checks (detailed simulation)
    for (let i = 0; i < input.length; i++) {
      for (let j = i; j <= input.length; j++) {
        steps++;
        data.push({
          position: `(${i}, ${j})`,
          steps: steps,
          highlight: i === currentStep || j === currentStep,
        });
        if (regex.test(input.slice(i, j))) break;
      }
    }
    setSteps(steps);
    setSimulationData(data);
    setCurrentStep(0);
  };

  return (
    <div>
      <h3>Backtracking Simulation</h3>
      <input
        type="text"
        value={input}
        onChange={(e) => {
          setInput(e.target.value);
          calculateBacktracking(e.target.value);
        }}
      />
      <p>
        Input Length: {input.length} | Estimated Steps: {steps}
      </p>
      <div className="simulation-grid">
        {simulationData.map((point, index) => (
          <div
            key={index}
            className={`grid-point ${currentStep === index ? "highlight" : ""}`}
            title={`Step ${point.steps}: ${point.position}`}
          >
            ■
          </div>
        ))}
      </div>
      <p>
        Explanation: Each additional character significantly increases the
        number of potential checks. The highlighted cells show the current step
        being processed.
      </p>
    </div>
  );
};

const App = () => {
  return (
    <div>
      <h2>Cloudflare Outage Interactive Visuals</h2>
      <CPUChart />
      <RegexBacktrackingDemo />
    </div>
  );
};
