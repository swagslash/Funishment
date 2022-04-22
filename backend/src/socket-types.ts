import { GameState } from './model/game-state';
import { Room } from './model/room';

export interface ServerToClientEvents {
  // Room actions
  roomCreated: (room: Room) => void;
  roomUpdated: (room: Room) => void;
  roomClosed: () => void;
  roomNotFound: () => void;

  /**
   * Send the whole game state to the client
   * @param state game state
   */
  update: (state: GameState) => void;
}

export interface ClientToServerEvents {
  // Room actions
  createRoom: (playerName: string) => void;
  joinRoom: (playerName: string, roomId: string) => void;
  leaveRoom: () => void;

  // Lobby actions
  startGame: () => void;

  // Punishment selection
  // createPunishment
  selectBoxes: (boxes: Box[]) => void;

  // Guessing Phase
  guessBoxes: (guesses: string[]) => void;

  // Scoring Phase

  // Misc actions
}

export interface ServerToServerEvents {
  ping: () => void;
}