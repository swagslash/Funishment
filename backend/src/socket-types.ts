import { CardType } from './model/card';
import { GameState } from './model/game-state';
import { Player } from './model/player';
import { Room } from './model/room';

export interface ServerToClientEvents {
  // Room actions
  roomCreated: (room: Room) => void;
  roomUpdated: (room: Room) => void;
  roomClosed: (disconnectedPlayer: Player) => void;
  roomNotFound: () => void;

  /**
   * Send the whole game state to the client
   * @param state game state
   */
  update: (state: GameState) => void;
}

export interface ClientToServerEvents {
  // Room actions
  createRoom: (playerName: string, nsfw: boolean) => void;
  joinRoom: (playerName: string, roomId: string) => void;
  leaveRoom: () => void;

  // Lobby actions
  startGame: () => void;

  // Punishment selection

  /**
   * Player creates a punishment
   * @param punishmentText Punishment display text
   */
  createPunishment: (punishmentText: string) => void;

  /**
   * Player votes for a punishment
   * @param punishmentId Id of the punishment card
   */
  votePunishment: (punishmentId: number) => void;

  /**
   * Player creates all cards with types (tags)
   * @param card The cards
   */
  createCards: (cards: { type: CardType; text: string }[]) => void;

  /**
   * Player selects a card
   * @param cardId Card id of the selected card.
   */
  selectCard: (cardId: number) => void;

  /**
   * Player votes for a card other than himself
   * @param cardId Card id of the voted card
   */
  voteCard: (cardId: number) => void;

  /**
   * Host player starts next round
   */
  startNextRound: () => void;
}

export interface ServerToServerEvents {
  ping: () => void;
}