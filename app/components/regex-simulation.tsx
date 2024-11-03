"use client";

import React, { useState, useEffect } from "react";

const RegexSimulation = () => {
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

export default RegexSimulation;
