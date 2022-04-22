import { Card } from './card';

export interface Player {
  id: string;         // Socket ID
  name: string;
}

export interface PlayerState {
  player: Player;
  score: number;
  hand: Card[];
  connected: boolean;
}
