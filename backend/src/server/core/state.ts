import { Card, CardType } from '../../model/card';
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
  hiddenPunishment?: Card;
  /**
   * Only user generated cards.
   * Used for
   * * player's hand
   * * question placeholder
   */
  cardPool: Map<CardType, Card[]>;

  /**
   * All played cards (id) which cannot be reused.
   */
  playedCardIds: number[];

  questions: Question[];
  predefinedCards: Map<CardType, Card[]>;
}
