export interface DFAState {
  id: string;
  transitions: { [symbol: string]: string };
  isAccepting: boolean;
}

export interface DFA {
  states: DFAState[];
  startState: string;
  alphabet: string[];
}

export interface NFAState {
  id: string;
  transitions: { [symbol: string]: string[] };
  isAccepting: boolean;
}

export interface NFA {
  states: NFAState[];
  startState: string;
  alphabet: string[];
}
