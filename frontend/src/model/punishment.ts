import { Card } from './card';
import { Player } from './player';

export interface Punishment {
  card: Card;
  targets: Player[];
}
