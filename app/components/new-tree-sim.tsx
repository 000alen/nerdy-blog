"use client";

import React, { useState, useEffect } from "react";
import { Tree, TreeNode } from "react-tree-graph";
import "react-tree-graph/dist/style.css";
import * as d3 from "d3";

interface Transition {
  to: number;
  label: string;
}

interface State {
  id: number;
  transitions: Transition[];
}

const NFAComputationTree: React.FC = () => {
  const [inputSize, setInputSize] = useState<number>(5);
  const [computationTree, setComputationTree] = useState<any>({});
  const [nodeCount, setNodeCount] = useState<number>(0);

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

  const generateInputString = (size: number): string => "x=".padEnd(size, "x");

  const buildComputationTree = (inputString: string) => {
    let totalNodes = 0;
    const root = { name: "q0", children: [] };
    const queue: { node: any; currentState: number; position: number }[] = [
      { node: root, currentState: 0, position: 0 },
    ];

    while (queue.length > 0) {
      const { node, currentState, position } = queue.shift()!;
      const currentChar = inputString[position];
      const state = nfaStates.find((s) => s.id === currentState);
      if (!state) continue;

      state.transitions.forEach(({ to, label }) => {
        if (label === "ε" || label === currentChar || label === ".") {
          const childNode = { name: `q${to}`, children: [] };
          node.children.push(childNode);
          totalNodes++;
          if (position < inputString.length) {
            queue.push({
              node: childNode,
              currentState: to,
              position: label === "ε" ? position : position + 1,
            });
          }
        }
      });
    }
    setNodeCount(totalNodes + 1); // Include the root node
    return root;
  };

  useEffect(() => {
    const input = generateInputString(inputSize);
    const tree = buildComputationTree(input);
    setComputationTree(tree);
  }, [inputSize]);

  return (
    <div style={{ marginBottom: "40px" }}>
      <h4>NFA Computation Tree Visualization (nodes: {nodeCount})</h4>

      <div>
        <label>
          Input Size:
          <input
            type="range"
            min="1"
            max="20"
            value={inputSize}
            onChange={(e) => setInputSize(parseInt(e.target.value, 10))}
          />
          {inputSize}
        </label>
      </div>

      <div style={{ width: "100%", height: "500px" }}>
        {computationTree && (
          <Tree
            data={computationTree}
            height={400}
            width={800}
            animated
            nodeRadius={15}
            margins={{ top: 20, bottom: 20, left: 50, right: 50 }}
          />
        )}
      </div>
    </div>
  );
};

export default NFAComputationTree;
