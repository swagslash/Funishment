import { Game } from './game';
import { Player } from './player';

export interface Room {
  id: string;
  game?: Game;
  host?: Player;
  players: Player[];
  open: boolean;
}