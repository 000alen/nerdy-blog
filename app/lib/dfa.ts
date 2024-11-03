import { DFA } from "./types";

export const processDFA = (dfa: DFA, input: string): boolean => {
  let currentState = dfa.startState;
  for (const char of input) {
    const state = dfa.states.find((s) => s.id === currentState);
    if (!state) return false;
    const nextState = state.transitions[char];
    if (!nextState) return false;
    currentState = nextState;
  }
  const finalState = dfa.states.find((s) => s.id === currentState);
  return finalState?.isAccepting || false;
};
