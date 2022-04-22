import { Player } from '../../model/player';
import { Room } from '../../model/room';

export const players: Player[] = [];

export const rooms: Room[] = [];

export const internalState: object[] = [];

export const timeouts: Record<string, { selectionTimeout?: any, guessingTimeout?: any }> = {};
