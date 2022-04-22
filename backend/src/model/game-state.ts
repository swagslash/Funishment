import { PlayedCard } from './card';
import { PlayerState } from './player';
import { Punishment } from './punishment';
import { Question } from './question';

export enum GamePhase {
  /**
   * Players create their punishment
   */
  PunishmentCreation,
  /**
   * Players vote for a punishment (property: playedCards)
   */
  PunishmentVoting,
  /**
   * Show the winning punishment (property: playedCards - only 1 element)
   */
  CardCreation,

  /**
   * Refill cards (server-side)
   * Players can pick a card from their hand (property: playerState)
   * Question is shown (property: question)
   */
  CardPlacement,
  /**
   * Players can vote for cards other than their card (property: playedCards = cards to vote for)
   */
  CardVoting,
  /**
   * Show the winning card (property: playedCards)
   * Show optional the hidden punishment (property: punishment)
   */
  CardResults,

  /**
   * Show the scores of all players (property: playerState)
   * Show the voted punishment (property: punishment)
   */
  Scoreboard
}

export interface GameState {
  /**
   * Current game phase
   */
  phase: GamePhase;

  /**
   * Current round
   */
  round: number;

  /**
   * Scores and hand of each player
   */
  playerState: PlayerState[];

  /**
   * Placed cards on the table (either punishments or cards in each round)
   */
  playedCards: PlayedCard[];

  /**
   * The question for the current round
   */
  question?: Question;

  /**
   * The punishment applied in the current round (hidden or voted)
   */
  appliedPunishment?: Punishment;
}
