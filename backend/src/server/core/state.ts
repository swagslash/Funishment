import { Card } from '../../model/card';
import { GameState } from '../../model/game-state';
import { Player } from '../../model/player';
import { Room } from '../../model/room';

export const players: Player[] = [];

export const rooms: Room[] = [];

export const internalState: InternalState[] = [];

export const timeouts: Record<string, { selectionTimeout?: any, guessingTimeout?: any }> = {};

export interface InternalState {
  roomId: string;
  nextCardId: number;
  gameState: GameState;
  votedPunishment?: Card;
  hiddenPunishment?: Card;
}
