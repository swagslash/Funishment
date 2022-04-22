import { PlayedCard } from './card';
import { PlayerState } from './player';
import { Punishment } from './punishment';
import { Question } from './question';

export enum GamePhase {
  PunishmentCreation,
  PunishmentVoting,
  CardCreation,

  CardRefill,
  CardPlacement,
  CardVoting,
  CardResults,
  Punishment,

  Scoreboard
}

export interface GameState {
  phase: GamePhase;

  playerState: PlayerState[];

  playedCards: PlayedCard[];

  question?: Question;

  punishment?: Punishment;
}
