import * as npmlog from 'npmlog';
import { PlayedCard } from '../../model/card';
import { GamePhase, GameState } from '../../model/game-state';
import { Player, PlayerState } from '../../model/player';
import { Punishment, PUNISHMENT_PROBABILITIES, PunishmentCondition } from '../../model/punishment';
import { Room } from '../../model/room';
import { InternalState, internalState } from './state';

const GAME_MANAGER_LOG_PREFIX = 'game-manager';

/**
 * Remove internal state by given room-id
 * @param roomId
 */
export const removeInternalState = (roomId: string) => {
  const index = internalState.findIndex((s) => s.roomId === roomId);
  if (index !== undefined) {
    npmlog.info(GAME_MANAGER_LOG_PREFIX, 'Removing internal state for room %s', roomId);
    internalState.splice(index, 1);
  }
};

/**
 * Create a new internal state and the initial game state with all players.
 * @param room
 */
export const createInternalState = (room: Room) => {
  const playerState: PlayerState[] = room.players.map((p) => {
    return {
      player: p,
      connected: true,
      hand: [],
      score: 0,
    };
  });

  const gameState: GameState = {
    phase: GamePhase.PunishmentCreation,
    playerState,
    round: 0,
    playedCards: [],
  };

  const state: InternalState = {
    roomId: room.id,
    nextCardId: 0,
    gameState,
    cardPool: [],
    predefinedCards: [],
    questions: [],
  };

  npmlog.info(GAME_MANAGER_LOG_PREFIX, 'Create new internal state for room %s', room.id);

  internalState.push(state);

  return state;
};

export const getInternalState = (roomId: string): InternalState => {
  npmlog.info(GAME_MANAGER_LOG_PREFIX, 'Get internal state for room %s', roomId);
  return internalState.find((state) => state.roomId === roomId);
};

export const calculateScores = ({gameState}: InternalState): void => {
  const highscore = gameState.playedCards.reduce(
    (max, current) => current.votes > max ? current.votes : max,
    0,
  );

  const winningCards = gameState.playedCards.filter((card) => card.votes === highscore);

  if (winningCards.length === 1) {
    // WIN
    const card = winningCards[0];
    const author = card.card.author;
    const dealer = card.dealer;
    updateScore(author, 1, gameState);
    updateScore(dealer, 3, gameState);
  } else {
    // TIE
    for (const winningCard of winningCards) {
      updateScore(winningCard.dealer, 2, gameState);
    }
  }
};

export const getVotedPunishment = ({votedPunishment, gameState}: InternalState): Punishment => {
  const { playerState } = gameState;

  const lowestScore = playerState.reduce((min, current) => min > current.score ? current.score : min, Number.POSITIVE_INFINITY);
  const targets = playerState.filter((ps) => ps.score === lowestScore)
    .map((ps) => ps.player);

  return {
    card: votedPunishment,
    targets,
    condition: PunishmentCondition.GameFinished,
  };
};

export const calculateHiddenPunishment = ({hiddenPunishments, gameState}: InternalState, lastPlayer: Player): Punishment | undefined => {
  const {playedCards, round} = gameState;
  const probability = PUNISHMENT_PROBABILITIES[round - 1];

  // No punishment
  if (Math.random() > probability || hiddenPunishments.length === 0) {
    return undefined;
  }

  // Check for all votes
  const playerCount = playedCards.length;
  const topPlayer = playedCards.find((ps) => ps.votes === playerCount - 1);
  if (topPlayer !== undefined) {
    return {
      condition: PunishmentCondition.AllVotes,
      targets: [topPlayer.dealer],
      card: hiddenPunishments.shift(),
    };
  }

  // Check for same votes
  const groupsMap = playedCards.reduce((groups, current) => {
    if (groups[current.votes]) {
      groups[current.votes].push(current);
    } else {
      groups[current.votes] = [current];
    }

    return groups;
  }, {} as Record<number, PlayedCard[]>);
  const playersWithSameScore = Object.entries(groupsMap)
    .filter(([score]) => (+score) > 0)
    .filter(([_, ps]) => ps.length > 1)
    .map(([, ps]) => ps)
    .flat()
    .map((ps) => ps.dealer);

  if (playersWithSameScore.length > 0) {
    return {
      condition: PunishmentCondition.SameScore,
      targets: playersWithSameScore,
      card: hiddenPunishments.shift(),
    }
  }

  return {
    condition: PunishmentCondition.LastToVote,
    targets: [lastPlayer],
    card: hiddenPunishments.shift(),
  };
};

const updateScore = (player: Player | undefined, score: number, state: GameState): void => {
  if (player === undefined) {
    return;
  }

  const playerState = state.playerState.find((playerState) => playerState.player.id === player.id);
  playerState.score += score;
};


// import { getRandomEmojis } from '../../emojis';
// import { Game, Phase, Round } from '../../model/game';
// import { Room } from '../../model/room';
// import { timeouts } from './state';
//
// const SELECTION_TIMEOUT = +(process.env.SELECTION_TIMEOUT ?? 93_000); // 90 seconds + 3 grace period
// const GUESSING_TIMEOUT = +(process.env.GUESSING_TIMEOUT ?? 63_000); // 60 seconds + 3 grace period
//
// /**
//  * Creates a new game or get an existing one from given room.
//  * Starts a new round
//  * @param room
//  */
// export const createOrGetGame = (room: Room): Game => {
//   if (room.game === undefined) {
//     console.log('[GAME][CREATE]', room.id);
//     room.game = {
//       current: room.players[0],
//       round: createRound(),
//       phase: Phase.Selection,
//       scores: {},
//     };
//   } else {
//     room.game.phase = Phase.Lobby;
//     room.game.round = createRound();
//   }
//
//   return room.game;
// };
//
// export const setNextPlayer = (room: Room): void => {
//   const current = room.game.current;
//   const index = room.players.findIndex((p) => p.id === current.id);   // Find current player in room's player list
//   let next = 0;                                                       // Fallback to first player if there was a disconnect
//   if (index >= 0) {
//     next = (index + 1) % room.players.length;                         // Get next player in the player list
//   }
//   room.game.current = room.players[next];
//
//   console.log('[GAME][NEXT PLAYER]', room.id, room.game.current.id, room.game.current.name);
// };
//
// const createRound = (): Round => {
//   const emojis = getRandomEmojis(30);
//   return {
//     boxes: [],
//     contentPool: emojis.splice(0, 5), // Items that can be placed in boxes
//     labelPool: emojis,                                // Labels that can be assigned to boxes
//     guesses: {},
//   };
// };
//
// export const setGamePhase = (room: Room, phase: Phase): void => {
//   console.log('[GAME][PHASE]', room.id, phase);
//   room.game.phase = phase;
// };
//
// export const canStartSelection = (room: Room): boolean => {
//   return room.game === undefined || [Phase.Lobby, Phase.Scoring].includes(room.game?.phase);
// };
//
// export const canStartGuessing = (room: Room): boolean => {
//   return Phase.Selection === room.game?.phase;
// };
//
// export const canGuess = (room: Room): boolean => {
//   return Phase.Guessing === room.game?.phase;
// };
//
// export const calculateScores = (room: Room): void => {
//   if (room?.game.round.boxes.length === 0) {
//     console.log('[GAME][SCORING] No boxes selected this round');
//     return;
//   }
//
//   console.log('[GAME][SCORING][BOX]', room.id, room.game.round.boxes);
//   console.log('[GAME][SCORING][GUESS]',room.id, room.game.round.guesses);
//
//   const alreadyGuessed: string[] = [];
//
//   const playerBoxes = room.game.round.boxes.map((b) => b.content);
//   const playerGuesses = Object.entries(room.game.round.guesses);
//
//   let selectorScore = 0;
//
//   for (const [playerId, guesses] of playerGuesses) {
//     if (alreadyGuessed.includes(playerId)) {  // Same player cannot vote twice (safety net)
//       continue;
//     }
//
//     if (guesses.length < playerBoxes.length) { // Invalid length of guesses
//       continue;
//     }
//
//     let score = 0;
//
//     for (let i = 0; i < playerBoxes.length; i++) {             // Note: Always 3 boxes
//       if (playerBoxes[i] === guesses[i]) {
//         score++;
//       }
//     }
//
//     if (score === 3) {
//       score = 5;                              // 2 Extra points for correctly guessed boxes.
//     }
//
//     room.game.scores[playerId] = (room.game.scores[playerId] ?? 0) + score;
//
//     alreadyGuessed.push(playerId);
//
//     selectorScore += score;
//
//     console.log('[GAME][SCORING] Player', playerId, 'scored', score);
//   }
//
//   const selectorId = room.game.current.id;
//   room.game.scores[selectorId] = (room.game.scores[selectorId] ?? 0) + selectorScore;
//   console.log('[GAME][SCORING] Selector', selectorId, 'scored', selectorScore);
// };
//
// export const clearSelectionTimeout = (room: Room): void => {
//   if (timeouts[room.id]?.selectionTimeout) {
//     clearTimeout(timeouts[room.id].selectionTimeout);
//   }
// };
//
// export const clearGuessingTimeout = (room: Room): void => {
//   if (timeouts[room.id]?.guessingTimeout) {
//     clearTimeout(timeouts[room.id].guessingTimeout);
//   }
// };
//
// export const startSelectionTimeout = (room: Room, callback: () => void): void => {
//   clearSelectionTimeout(room);
//
//   if (!timeouts[room.id]) {
//     timeouts[room.id] = {};
//   }
//
//   timeouts[room.id].selectionTimeout = setTimeout(callback, SELECTION_TIMEOUT);
// };
//
// export const startGuessingTimeout = (room: Room, callback: () => void): void => {
//   clearGuessingTimeout(room);
//
//   if (!timeouts[room.id]) {
//     timeouts[room.id] = {};
//   }
//
//   timeouts[room.id].guessingTimeout = setTimeout(callback, GUESSING_TIMEOUT);
// };
//
//
