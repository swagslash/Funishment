import { Player } from './player';

export enum CardType {
  Player,
  Person,
  Object,
  Place,
  Activity,
  Punishment,
}

export interface Card {
  id: number;
  type: CardType;
  text: string;
  author?: Player;
}

export interface PlayedCard {
  card: Card;
  player: Player;
  votes: number;
}