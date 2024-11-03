import React, { useState } from "react";

interface BacktrackingStep {
  stepNumber: number;
  currentState: string;
  inputConsumed: string;
  remainingInput: string;
}

const problematicRegex = ".*.*=.*";
const input = "x=xx"; // Example input that causes excessive backtracking

const BacktrackingSimulation: React.FC<{ regex: string; input: string }> = ({
  regex,
  input,
}) => {
  const [steps, setSteps] = useState<BacktrackingStep[]>([]);

  const simulate = () => {
    // Simplified simulation logic
    const simulatedSteps: BacktrackingStep[] = [];
    let step = 0;
    // Example: Add steps manually or implement a RegEx engine simulator
    // For brevity, let's add dummy steps
    simulatedSteps.push({
      stepNumber: step++,
      currentState: "Start",
      inputConsumed: "",
      remainingInput: input,
    });
    // ... more steps
    setSteps(simulatedSteps);
  };

  return (
    <div>
      <button onClick={simulate}>Run Simulation</button>
      <div>
        {steps.map((step) => (
          <div key={step.stepNumber}>
            <strong>Step {step.stepNumber}:</strong> State: {step.currentState},
            Consumed: "{step.inputConsumed}", Remaining: "{step.remainingInput}"
          </div>
        ))}
      </div>
    </div>
  );
};

export default BacktrackingSimulation;
