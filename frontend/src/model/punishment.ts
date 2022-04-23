import { Card } from './card';
import { Player } from './player';

export interface Punishment {
  card: Card;
  targets: Player[];
  condition: PunishmentCondition;
}

export enum PunishmentCondition {
  GameFinished,
  AllVotes,
  SameScore,
  LastToVote,
}

export const PUNISHMENT_PROBABILITIES = [0.05, 0.10, 0.20, 0.08, 0];
// export const PUNISHMENT_PROBABILITIES = [1, 1, 1, 1, 0];

