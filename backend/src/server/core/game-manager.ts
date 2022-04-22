import { getRandomEmojis } from '../../emojis';
import { Game, Phase, Round } from '../../model/game';
import { Room } from '../../model/room';
import { timeouts } from './state';

const SELECTION_TIMEOUT = +(process.env.SELECTION_TIMEOUT ?? 93_000); // 90 seconds + 3 grace period
const GUESSING_TIMEOUT = +(process.env.GUESSING_TIMEOUT ?? 63_000); // 60 seconds + 3 grace period

/**
 * Creates a new game or get an existing one from given room.
 * Starts a new round
 * @param room
 */
export const createOrGetGame = (room: Room): Game => {
  if (room.game === undefined) {
    console.log('[GAME][CREATE]', room.id);
    room.game = {
      current: room.players[0],
      round: createRound(),
      phase: Phase.Selection,
      scores: {},
    };
  } else {
    room.game.phase = Phase.Lobby;
    room.game.round = createRound();
  }

  return room.game;
};

export const setNextPlayer = (room: Room): void => {
  const current = room.game.current;
  const index = room.players.findIndex((p) => p.id === current.id);   // Find current player in room's player list
  let next = 0;                                                       // Fallback to first player if there was a disconnect
  if (index >= 0) {
    next = (index + 1) % room.players.length;                         // Get next player in the player list
  }
  room.game.current = room.players[next];

  console.log('[GAME][NEXT PLAYER]', room.id, room.game.current.id, room.game.current.name);
};

const createRound = (): Round => {
  const emojis = getRandomEmojis(30);
  return {
    boxes: [],
    contentPool: emojis.splice(0, 5), // Items that can be placed in boxes
    labelPool: emojis,                                // Labels that can be assigned to boxes
    guesses: {},
  };
};

export const setGamePhase = (room: Room, phase: Phase): void => {
  console.log('[GAME][PHASE]', room.id, phase);
  room.game.phase = phase;
};

export const canStartSelection = (room: Room): boolean => {
  return room.game === undefined || [Phase.Lobby, Phase.Scoring].includes(room.game?.phase);
};

export const canStartGuessing = (room: Room): boolean => {
  return Phase.Selection === room.game?.phase;
};

export const canGuess = (room: Room): boolean => {
  return Phase.Guessing === room.game?.phase;
};

export const calculateScores = (room: Room): void => {
  if (room?.game.round.boxes.length === 0) {
    console.log('[GAME][SCORING] No boxes selected this round');
    return;
  }

  console.log('[GAME][SCORING][BOX]', room.id, room.game.round.boxes);
  console.log('[GAME][SCORING][GUESS]',room.id, room.game.round.guesses);

  const alreadyGuessed: string[] = [];

  const playerBoxes = room.game.round.boxes.map((b) => b.content);
  const playerGuesses = Object.entries(room.game.round.guesses);

  let selectorScore = 0;

  for (const [playerId, guesses] of playerGuesses) {
    if (alreadyGuessed.includes(playerId)) {  // Same player cannot vote twice (safety net)
      continue;
    }

    if (guesses.length < playerBoxes.length) { // Invalid length of guesses
      continue;
    }

    let score = 0;

    for (let i = 0; i < playerBoxes.length; i++) {             // Note: Always 3 boxes
      if (playerBoxes[i] === guesses[i]) {
        score++;
      }
    }

    if (score === 3) {
      score = 5;                              // 2 Extra points for correctly guessed boxes.
    }

    room.game.scores[playerId] = (room.game.scores[playerId] ?? 0) + score;

    alreadyGuessed.push(playerId);

    selectorScore += score;

    console.log('[GAME][SCORING] Player', playerId, 'scored', score);
  }

  const selectorId = room.game.current.id;
  room.game.scores[selectorId] = (room.game.scores[selectorId] ?? 0) + selectorScore;
  console.log('[GAME][SCORING] Selector', selectorId, 'scored', selectorScore);
};

export const clearSelectionTimeout = (room: Room): void => {
  if (timeouts[room.id]?.selectionTimeout) {
    clearTimeout(timeouts[room.id].selectionTimeout);
  }
};

export const clearGuessingTimeout = (room: Room): void => {
  if (timeouts[room.id]?.guessingTimeout) {
    clearTimeout(timeouts[room.id].guessingTimeout);
  }
};

export const startSelectionTimeout = (room: Room, callback: () => void): void => {
  clearSelectionTimeout(room);

  if (!timeouts[room.id]) {
    timeouts[room.id] = {};
  }

  timeouts[room.id].selectionTimeout = setTimeout(callback, SELECTION_TIMEOUT);
};

export const startGuessingTimeout = (room: Room, callback: () => void): void => {
  clearGuessingTimeout(room);

  if (!timeouts[room.id]) {
    timeouts[room.id] = {};
  }

  timeouts[room.id].guessingTimeout = setTimeout(callback, GUESSING_TIMEOUT);
};


