import { NFA } from "../lib/types";
import React from "react";
import ReactFlow, { Elements, Position } from "react-flow-renderer";

const NFAComponent: React.FC<{ nfa: NFA }> = ({ nfa }) => {
  const elements: Elements = nfa.states.flatMap((state) => {
    const transitions = Object.entries(state.transitions).flatMap(
      ([symbol, targets]) =>
        targets.map((target) => ({
          id: `${state.id}-${symbol}-${target}`,
          source: state.id,
          target: target,
          label: symbol,
          animated: false,
        }))
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

export default NFAComponent;
