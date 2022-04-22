import { Player } from '../../model/player';
import { Room } from '../../model/room';
import { players, rooms } from './state';

const generateRoomName = (): string => {
  return Math.random()
    .toString(16)
    .split('')
    .splice(-5)
    .join('')
    .toUpperCase();
};

/**
 * Creates a new player or gets a new player
 * @param playerName
 * @param playerId
 */
export const createOrGetPlayer = (playerName: string, playerId: string): Player => {
  let player = players.find((p) => p.id === playerId);

  if (player === undefined) {
    console.log('[PLAYER][CREATE]', playerId, playerName);
    player = {id: playerId, name: playerName};
    players.push(player);
  }

  console.log('[PLAYER][GET]', player.name);

  return player;
};

export const removePlayer = (player: Player): void => {
  const index = players.findIndex((p) => p.id === player.id);
  if (index >= 0) {
    console.log('[PLAYER][REMOVE]', player.name);
    players.splice(index, 1);
  }
};

export const createRoom = (): Room => {
  const id = generateRoomName();
  const room: Room = {id, open: true, players: []};
  rooms.push(room);

  console.log('[ROOM][CREATE]', room.id);

  return room;
};

export const getRoom = (roomId: string): Room | undefined => {
  return rooms.find((r) => r.id === roomId);
};

export const joinRoom = (room: Room, player: Player, asHost: boolean): boolean => {
  console.log('[ROOM][JOIN]', room.id, player.name, 'is host:', asHost);

  if (!room.open) {
    console.log('[ROOM][CLOSED]', room.id);
    return false;
  }

  room.players.push(player);

  if (asHost) {
    room.host = player;
  }

  return true;
};

export const leaveRoom = (room: Room, player: Player): void => {
  const index = room.players.findIndex((p) => p.id === player.id);
  if (index >= 0) {
    console.log('[ROOM][LEAVE]', room.id, player.name);
    room.players.splice(index, 1);
  }

  if (room.players.length === 0) {
    closeRoom(room);
  }
};

/**
 * Closes the room and removes all players of that room
 * @param room
 */
export const closeRoom = (room: Room): void => {
  const index = rooms.findIndex((r) => r.id === room.id);
  if (index >= 0) {
    console.log('[ROOM][CLOSE]', room.id);
    rooms.splice(index, 1);
  }
};
