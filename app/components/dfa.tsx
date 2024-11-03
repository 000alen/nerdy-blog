import { DFA } from "../lib/types";
import React from "react";
import ReactFlow, { Elements, Position } from "react-flow-renderer";

const DFAComponent: React.FC<{ dfa: DFA }> = ({ dfa }) => {
  const elements: Elements = dfa.states.flatMap((state) => {
    const transitions = Object.entries(state.transitions).map(
      ([symbol, target]) => ({
        id: `${state.id}-${symbol}`,
        source: state.id,
        target: target,
        label: symbol,
        animated: false,
      })
    );
    return [
      {
        id: state.id,
        data: { label: state.id },
        position: { x: Math.random() * 250, y: Math.random() * 250 },
        type: state.isAccepting ? "default" : "default",
      },
      ...transitions,
    ];
  });

  return (
    <div style={{ height: 500 }}>
      <ReactFlow
        elements={elements}
        nodesDraggable={false}
        elementsSelectable={false}
      />
    </div>
  );
};

export default DFAComponent;
