import { Player } from './player';

export interface Room {
  id: string;
  host: Player;
  players: Player[];
  open: boolean;
  nsfw: boolean;
}