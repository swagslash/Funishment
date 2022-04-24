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

export const PUNISHMENT_PROBABILITIES = [0.15, 0.25, 1, 0.25, 0];
// export const PUNISHMENT_PROBABILITIES = [1, 1, 1, 1, 0];

