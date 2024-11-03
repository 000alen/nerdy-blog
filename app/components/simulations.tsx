// SimulationSection.tsx
import React from "react";
import DFAComponent from "./dfa";
import NFAComponent from "./nfa";
import { DFA, NFA } from "app/lib/types";
import BacktrackingSimulation from "./backtracking-simulation";

const dfaExample: DFA = {
  states: [
    { id: "q0", transitions: { x: "q1", "=": "q0" }, isAccepting: false },
    { id: "q1", transitions: { "=": "q2" }, isAccepting: true },
    { id: "q2", transitions: {}, isAccepting: true },
  ],
  startState: "q0",
  alphabet: ["x", "="],
};

const nfaExample: NFA = {
  states: [
    {
      id: "p0",
      transitions: { x: ["p1", "p0"], "=": ["p2"] },
      isAccepting: false,
    },
    { id: "p1", transitions: { "=": ["p2"] }, isAccepting: false },
    { id: "p2", transitions: { x: ["p1"] }, isAccepting: true },
  ],
  startState: "p0",
  alphabet: ["x", "="],
};

const SimulationSection: React.FC = () => {
  return (
    <div>
      <section>
        <h2>DFA Simulation</h2>
        <DFAComponent dfa={dfaExample} />
      </section>
      <section>
        <h2>NFA Simulation</h2>
        <NFAComponent nfa={nfaExample} />
      </section>
      <section>
        <h2>Backtracking Simulation</h2>
        <BacktrackingSimulation regex=".*.*=.*" input="x=xx" />
      </section>
    </div>
  );
};

export default SimulationSection;
