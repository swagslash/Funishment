import { Player } from './player';

export interface Game {
  current: Player;
  phase: Phase;
  round: Round;
  scores: Record<string, number>;   // Player scores <player-id, score>
}

export interface Round {
  boxes: Box[];           // Boxes
  contentPool: string[];  // Available items to put in boxes
  labelPool: string[];    // Available labels to assign to boxes
  guesses: Record<string, string[]>;       // Player to Guess map
}

export interface Box {
  content: string;        // Content of box
  labels: string[];        // Labels of box
}

export enum Phase {
  Lobby,
  Selection,
  Guessing,
  Scoring,
}
