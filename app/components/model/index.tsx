"use client";

import * as React from "react";
import { useDebounce } from "use-debounce";

interface SimulationState {
  R1: number;
  R2: number;
  Rrej1: number;
  Rrej2: number;
}

interface ChartData {
  time: number;
  R1: number;
  R2: number;
  D: number;
  S: number;
  T1: number;
  T2: number;
  Rrej1: number;
  Rrej2: number;
  rejRate1: number;
  rejRate2: number;
}

interface ISimContext {
  E1_coefficient: number;
  setE1Coefficient: (value: number) => void;
  E2_coefficient: number;
  setE2Coefficient: (value: number) => void;
  mu_n: number;
  setMuN: (value: number) => void;
  sigma_n: number;
  setSigmaN: (value: number) => void;
  C: number;
  setC: (value: number) => void;
  T1_0: number;
  setT1_0: (value: number) => void;
  T2_0: number;
  setT2_0: (value: number) => void;
  lambda1: number;
  setLambda1: (value: number) => void;
  lambda2: number;
  setLambda2: (value: number) => void;
  T1_max: number;
  setT1Max: (value: number) => void;
  T2_max: number;
  setT2Max: (value: number) => void;

  // Debounced parameters
  debouncedE1_coefficient: number;
  debouncedE2_coefficient: number;
  debouncedMu_n: number;
  debouncedSigma_n: number;
  debouncedC: number;
  debouncedT1_0: number;
  debouncedT2_0: number;
  debouncedLambda1: number;
  debouncedLambda2: number;
  debouncedT1_max: number;
  debouncedT2_max: number;

  // Chart data
  chartData: ChartData[];
  isLoading: boolean;
}

const SimContext = React.createContext<ISimContext | null>(null);

const DEBOUNCE_DELAY = 500;

export const useSimContext = () => {
  const context = React.useContext(SimContext);
  if (!context) {
    throw new Error("useSimContext must be used within a SimContextProvider");
  }
  return context;
};

const SimContextProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const [E1_coefficient, setE1Coefficient] = React.useState<number>(1.0);
  const [E2_coefficient, setE2Coefficient] = React.useState<number>(1.0);
  const [mu_n, setMuN] = React.useState<number>(10.0);
  const [sigma_n, setSigmaN] = React.useState<number>(2.0);
  const [C, setC] = React.useState<number>(1000.0);
  const [T1_0, setT1_0] = React.useState<number>(1.0);
  const [T2_0, setT2_0] = React.useState<number>(1.0);
  const [lambda1, setLambda1] = React.useState<number>(50.0);
  const [lambda2, setLambda2] = React.useState<number>(50.0);
  const [T1_max, setT1Max] = React.useState<number>(10.0);
  const [T2_max, setT2Max] = React.useState<number>(10.0);

  // Debounced parameters
  const [debouncedE1_coefficient] = useDebounce(E1_coefficient, DEBOUNCE_DELAY);
  const [debouncedE2_coefficient] = useDebounce(E2_coefficient, DEBOUNCE_DELAY);
  const [debouncedMu_n] = useDebounce(mu_n, DEBOUNCE_DELAY);
  const [debouncedSigma_n] = useDebounce(sigma_n, DEBOUNCE_DELAY);
  const [debouncedC] = useDebounce(C, DEBOUNCE_DELAY);
  const [debouncedT1_0] = useDebounce(T1_0, DEBOUNCE_DELAY);
  const [debouncedT2_0] = useDebounce(T2_0, DEBOUNCE_DELAY);
  const [debouncedLambda1] = useDebounce(lambda1, DEBOUNCE_DELAY);
  const [debouncedLambda2] = useDebounce(lambda2, DEBOUNCE_DELAY);
  const [debouncedT1_max] = useDebounce(T1_max, DEBOUNCE_DELAY);
  const [debouncedT2_max] = useDebounce(T2_max, DEBOUNCE_DELAY);

  const [chartData, setChartData] = React.useState<ChartData[]>([]);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);

  React.useEffect(() => {
    if (
      debouncedE1_coefficient === undefined ||
      debouncedE2_coefficient === undefined
    )
      return;

    setIsLoading(true);

    // Simulation Parameters from debounced state
    const E1_coef = debouncedE1_coefficient; // Coefficient for O(n^2) algorithm
    const E2_coef = debouncedE2_coefficient; // Coefficient for O(n) algorithm

    const mu_n_val = debouncedMu_n; // Mean of request size n
    const sigma_n_val = debouncedSigma_n; // Standard deviation of request size n

    const E1_avg = E1_coef * (mu_n_val ** 2 + sigma_n_val ** 2); // Expected E1 per request
    const E2_avg = E2_coef * mu_n_val; // Expected E2 per request

    const C_val = debouncedC; // Total compute capacity

    const T10 = debouncedT1_0; // Base processing time for O(n^2)
    const T20 = debouncedT2_0; // Base processing time for O(n)

    const lambda1_val = debouncedLambda1; // Arrival rate for O(n^2) requests
    const lambda2_val = debouncedLambda2; // Arrival rate for O(n) requests

    const T1max = debouncedT1_max; // Max latency for O(n^2)
    const T2max = debouncedT2_max; // Max latency for O(n)

    // Simulation Settings
    const t_start = 0;
    const t_end = 50;
    const num_points = 1000;
    const dt = (t_end - t_start) / num_points;

    // Initialize state
    let state: SimulationState = {
      R1: 0.0,
      R2: 0.0,
      Rrej1: 0.0,
      Rrej2: 0.0,
    };

    const data: ChartData[] = [];

    // Euler's Method Simulation
    for (let i = 0; i <= num_points; i++) {
      const t = t_start + i * dt;

      const { R1, R2, Rrej1, Rrej2 } = state;

      // Compute demand
      const D = E1_avg * R1 + E2_avg * R2;

      // Scaling factor
      const S = D > C_val ? D / C_val : 1.0;

      // Processing times with scaling
      const T1 = T10 * Math.pow(S, 2); // Quadratic scaling for O(n^2)
      const T2 = T20 * S; // Linear scaling for O(n)

      // Effective arrival rates based on latency thresholds
      const lambda1_eff = T1 <= T1max ? lambda1_val : 0.0;
      const lambda2_eff = T2 <= T2max ? lambda2_val : 0.0;

      // Processing rates
      const mu1 = T1 > 0 ? R1 / T1 : 0.0;
      const mu2 = T2 > 0 ? R2 / T2 : 0.0;

      // Rejection rates
      const rejRate1 = T1 <= T1max ? 0.0 : lambda1_val;
      const rejRate2 = T2 <= T2max ? 0.0 : lambda2_val;

      // Update state using Euler's Method
      const dR1_dt = lambda1_eff - mu1;
      const dR2_dt = lambda2_eff - mu2;
      const dRrej1_dt = lambda1_val - lambda1_eff;
      const dRrej2_dt = lambda2_val - lambda2_eff;

      state.R1 += dR1_dt * dt;
      state.R2 += dR2_dt * dt;
      state.Rrej1 += dRrej1_dt * dt;
      state.Rrej2 += dRrej2_dt * dt;

      // Ensure no negative values
      state.R1 = Math.max(state.R1, 0);
      state.R2 = Math.max(state.R2, 0);
      state.Rrej1 = Math.max(state.Rrej1, 0);
      state.Rrej2 = Math.max(state.Rrej2, 0);

      // Record data for plotting
      data.push({
        time: parseFloat(t.toFixed(2)),
        R1: parseFloat(state.R1.toFixed(2)),
        R2: parseFloat(state.R2.toFixed(2)),
        D: parseFloat(D.toFixed(2)),
        S: parseFloat(S.toFixed(2)),
        T1: parseFloat(T1.toFixed(2)),
        T2: parseFloat(T2.toFixed(2)),
        Rrej1: parseFloat(state.Rrej1.toFixed(2)),
        Rrej2: parseFloat(state.Rrej2.toFixed(2)),
        rejRate1: rejRate1,
        rejRate2: rejRate2,
      });
    }

    setChartData(data);
    setIsLoading(false);
  }, [
    debouncedE1_coefficient,
    debouncedE2_coefficient,
    debouncedMu_n,
    debouncedSigma_n,
    debouncedC,
    debouncedT1_0,
    debouncedT2_0,
    debouncedLambda1,
    debouncedLambda2,
    debouncedT1_max,
    debouncedT2_max,
  ]);

  const context = React.useMemo(
    () => ({
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
      debouncedE1_coefficient,
      debouncedE2_coefficient,
      debouncedMu_n,
      debouncedSigma_n,
      debouncedC,
      debouncedT1_0,
      debouncedT2_0,
      debouncedLambda1,
      debouncedLambda2,
      debouncedT1_max,
      debouncedT2_max,
      chartData,
      isLoading,
    }),
    [
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
      debouncedE1_coefficient,
      debouncedE2_coefficient,
      debouncedMu_n,
      debouncedSigma_n,
      debouncedC,
      debouncedT1_0,
      debouncedT2_0,
      debouncedLambda1,
      debouncedLambda2,
      debouncedT1_max,
      debouncedT2_max,
      chartData,
      isLoading,
    ]
  );

  return <SimContext.Provider value={context}>{children}</SimContext.Provider>;
};

export default SimContextProvider;
