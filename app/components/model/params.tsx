"use client";

import React, { useState } from "react";
import { useSimContext } from ".";
import { ChevronDown, ChevronUp } from "lucide-react";

const SimParams: React.FC = () => {
  const {
    E1_coefficient,
    setE1Coefficient,
    E2_coefficient,
    setE2Coefficient,
    mu_n,
    setMuN,
    sigma_n,
    setSigmaN,
    C,
    setC,
    T1_0,
    setT1_0,
    T2_0,
    setT2_0,
    lambda1,
    setLambda1,
    lambda2,
    setLambda2,
    T1_max,
    setT1Max,
    T2_max,
    setT2Max,
  } = useSimContext();

  // State to manage the visibility of the parameters
  const [isCollapsed, setIsCollapsed] = useState(true);

  // Toggle function to show/hide parameters
  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

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
    <div style={{ marginBottom: "40px" }}>
      <h4>Adjust Simulation Parameters</h4>

      {/* Toggle Button */}
      <div>
        <button
          onClick={toggleCollapse}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
        >
          {isCollapsed ? (
            <>
              <ChevronDown size={16} />
              <span>Parameters</span>
            </>
          ) : (
            <>
              <ChevronUp size={16} />
              <span>Parameters</span>
            </>
          )}
        </button>
      </div>

      {/* Collapsible Parameters Section */}
      {!isCollapsed && (
        <div>
          {/* Reset Button */}
          <div style={{ marginBottom: "20px" }}>
            <button onClick={resetParameters}>
              Reset to Default Parameters
            </button>
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
      )}
    </div>
  );
};

export default SimParams;
