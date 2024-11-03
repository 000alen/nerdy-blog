import { NFA } from "./types";

export const processNFA = (nfa: NFA, input: string): boolean => {
  const currentStates = new Set<string>();
  currentStates.add(nfa.startState);

  for (const char of input) {
    const nextStates = new Set<string>();
    currentStates.forEach((stateId) => {
      const state = nfa.states.find((s) => s.id === stateId);
      if (state && state.transitions[char]) {
        state.transitions[char].forEach((target) => nextStates.add(target));
      }
    });
    currentStates.clear();
    nextStates.forEach((state) => currentStates.add(state));
  }

  for (const stateId of Array.from(currentStates)) {
    const state = nfa.states.find((s) => s.id === stateId);
    if (state?.isAccepting) return true;
  }
  return false;
};
