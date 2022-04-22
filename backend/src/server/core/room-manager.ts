import { Player } from '../../model/player';
import { Room } from '../../model/room';
import { players, rooms } from './state';
import npmlog from 'npmlog';

const PLAYER_LOG_PREFIX = 'player';
const ROOM_LOG_PREFIX = 'room';

const generateRoomId = (): string => {
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
    npmlog.log(PLAYER_LOG_PREFIX, 'Create new player %s with id %s', playerName, playerId);
    player = {id: playerId, name: playerName};
    players.push(player);
  }

  npmlog.log(PLAYER_LOG_PREFIX, 'Get player %s with id %s', player.name, player.id);

  return player;
};

/**
 * Remove given player
 * @param player
 */
export const removePlayer = (player: Player): void => {
  const index = players.findIndex((p) => p.id === player.id);
  if (index >= 0) {
    npmlog.log(PLAYER_LOG_PREFIX, 'Remove player %s with id %s', player.name, player.id);
    players.splice(index, 1);
  } else {
    npmlog.warn(PLAYER_LOG_PREFIX, 'Player %s with id %s not found to remove', player.name, player.id);
  }
};

/**
 * Create a new room with a random id
 * @param host The room host
 */
export const createRoom = (host: Player): Room => {
  const id = generateRoomId();
  const room: Room = {id, open: true, players: [host], host, nsfw: true};
  rooms.push(room);

  npmlog.log(ROOM_LOG_PREFIX, 'New room %s created with host player %s', room.id, host);

  return room;
};

/**
 * Get a room by id
 * @param roomId
 */
export const getRoom = (roomId: string): Room | undefined => {
  return rooms.find((r) => r.id === roomId);
};

/**
 * Join a room as player (not host)
 * @param room
 * @param player
 */
export const joinRoom = (room: Room, player: Player): boolean => {
  if (!room.open) {
    npmlog.warn(ROOM_LOG_PREFIX, 'Player %s cannot join room %s: Room closed', player.name, room.id);
    return false;
  }

  npmlog.log(ROOM_LOG_PREFIX, 'Player %s joins room %s', player.name, room.id);
  room.players.push(player);

  return true;
};

/**
 * Leave a room
 * @param room
 * @param player
 */
export const leaveRoom = (room: Room, player: Player): void => {
  const index = room.players.findIndex((p) => p.id === player.id);
  if (index >= 0) {
    npmlog.log(ROOM_LOG_PREFIX, 'Player %s leaves room %s', player.name, room.id);
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
    npmlog.log(ROOM_LOG_PREFIX, 'Close room %s', room.id);
    rooms.splice(index, 1);
  }
};
