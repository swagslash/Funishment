import { Box, Game } from './model/game';
import { Room } from './model/room';

export interface ServerToClientEvents {
  // Room actions
  roomCreated: (room: Room) => void;
  roomJoined: (room: Room) => void;
  updatePlayers: (room: Room) => void;
  roomClosed: () => void;
  roomNotFound: () => void;

  // Selection Phase
  /**
   * Starts the game for all players. Game specifies active player
   */
  gameStarted: (game: Game) => void;

  // Guessing Phase
  /**
   * Instructs other players to select boxes
   * @param payload
   */
  guessBoxes: (game: Game) => void;


  // Scoring Phase
  /**
   * All boxes guessed, report calculated scores
   * @param payload
   */
  reportScores: (game: Game) => void;
}

export interface ClientToServerEvents {
  // Room actions
  createRoom: (playerName: string) => void;
  joinRoom: (playerName: string, roomId: string) => void;
  leaveRoom: () => void;

  // Lobby actions
  startGame: () => void;

  // Selection Phase
  selectBoxes: (boxes: Box[]) => void;

  // Guessing Phase
  guessBoxes: (guesses: string[]) => void;

  // Scoring Phase

  // Misc actions
}

export interface ServerToServerEvents {
  ping: () => void;
}