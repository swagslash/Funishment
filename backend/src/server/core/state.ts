import { Card } from '../../model/card';
import { GameState } from '../../model/game-state';
import { Player } from '../../model/player';
import { Question } from '../../model/question';
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
  hiddenPunishments?: Card[];
  /**
   * Only user generated cards.
   * Used for
   * * player's hand
   * * question placeholder
   */
  cardPool: Card[];

  questions: Question[];
  predefinedCards: Card[];
}
