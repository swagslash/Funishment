import * as express from 'express';
import * as http from 'http';
import npmlog from 'npmlog';
import { Server } from 'socket.io';
import { CardType } from './model/card';
import { GamePhase } from './model/game-state';
import { Player } from './model/player';
import { Room } from './model/room';
import {
  addCard,
  assignCardMetadata,
  createNewPlayerCard,
  createNewPunishmentCard,
  generatePlayerCards,
  getCardVotingScore,
  getTopMostCards,
  handoutCards,
  refillHand,
  removeCardFromHand,
  voteForCard,
} from './server/core/card-manager';
import { loadCardsForAllTypes, loadQuestions } from './server/core/file-manager';
import { calculateScores, createInternalState, removeInternalState } from './server/core/game-manager';
import { closeRoom, createOrGetPlayer, createRoom, getRoom, joinRoom, leaveRoom, removePlayer } from './server/core/room-manager';
import { InternalState } from './server/core/state';
import { ClientToServerEvents, ServerToClientEvents, ServerToServerEvents } from './socket-types';

const SERVER_PORT = +(process.env.SERVER_PORT ?? 3_000);
const SERVER_LOG_PREFIX = 'server';

const CATEGORY_COUNT = 4;
const CARDS_PER_CATEGORY = 2;
const ROUNDS_TO_PLAY = 5;

const app = express();
const server = http.createServer(app);

const start = async () => {
  server.listen(SERVER_PORT, () => {
    npmlog.info(SERVER_LOG_PREFIX, 'Starting server, listening at port %s', SERVER_PORT);
  });
};

start();

const io = new Server<ClientToServerEvents, ServerToClientEvents, ServerToServerEvents, unknown>(server, {
  cors: {
    origin: '*',
    methods: ["GET", "POST"],
    credentials: true,
  },
});

io.on('connection', (socket) => {
  let room: Room | undefined = undefined;
  let player: Player | undefined = undefined;
  let internalState: InternalState | undefined = undefined;

  console.log('[CONNECT]', socket.id);

  socket.on('createRoom', (playerName: string) => {
    if (room && player) {
      // Leave old room if player tries to create a new room
      socket.leave(room.id);
      leaveRoom(room, player);
    }

    player = createOrGetPlayer(playerName, socket.id);
    room = createRoom(player);

    socket.join(room.id);
    socket.emit('roomCreated', room);
  });

  socket.on('joinRoom', (playerName: string, roomId: string) => {
    if (room && player) {
      // Leave old room if player tries to join a new room
      socket.leave(room.id);
      leaveRoom(room, player);
    }

    room = getRoom(roomId);

    if (room === undefined) {
      socket.emit('roomNotFound');
      npmlog.warn(SERVER_LOG_PREFIX, 'Room %s not found', roomId);
      return;
    }

    player = createOrGetPlayer(playerName, socket.id);
    const success = joinRoom(room, player);

    if (success) {
      socket.join(room.id);

      socket.to(room.id)
        .emit('roomUpdated', room);
      socket.emit('roomUpdated', room);
    } else {
      // Game is open, no new players allowed
      socket.emit('roomClosed');
    }
  });

  socket.on('startGame', () => {
    if (!room || !player) {
      return;
    }

    removeInternalState(room.id);
    internalState = createInternalState(room);

    room.open = false;

    socket.emit('update', internalState.gameState);
    socket.to(room.id)
        .emit('update', internalState.gameState);

    //
    // if (canStartSelection(room)) {
    //   room.open = false;
    //   room.game = createOrGetGame(room);
    //
    //   if (room.game.current !== player) {
    //     // This player cannot start a game
    //     return;
    //   }
    //
    //   console.log('guesses', room.game.round.guesses);
    //
    //   setGamePhase(room, Phase.Selection);
    //
    //   socket.emit('gameStarted', room.game);
    //   socket.to(room.id)
    //     .emit('gameStarted', room.game);
    //
    //   clearSelectionTimeout(room);
    //   startSelectionTimeout(room, () => {
    //     console.log('[GAME][SELECTING TIMEOUT]', room.id);
    //     startNextRound();
    //   });
    // }
  });

  socket.on('createPunishment', (punishmentText: string) => {
    if (!player || !room || !internalState) {
      return;
    }

    if (internalState.gameState.phase !== GamePhase.PunishmentCreation) {
      npmlog.warn(SERVER_LOG_PREFIX, 'Room %s is not in %s state', room.id, GamePhase.PunishmentCreation);
      return;
    }

    const card = createNewPunishmentCard(punishmentText);
    assignCardMetadata(card, player, internalState);
    addCard(card, player, internalState);

    // All players created punishments => proceed to next phase
    if (internalState.gameState.playedCards.length === room.players.length) {
      internalState.gameState.phase = GamePhase.PunishmentVoting;
    }

    socket.emit('update', internalState.gameState);
    socket.to(room.id)
      .emit('update', internalState.gameState);
  });

  socket.on('votePunishment', (punishmentId: number) => {
    if (!player || !room || !internalState) {
      return;
    }

    if (internalState.gameState.phase !== GamePhase.PunishmentVoting) {
      npmlog.warn(SERVER_LOG_PREFIX, 'Room %s is not in %s state', room.id, GamePhase.PunishmentCreation);
      return;
    }

    voteForCard(punishmentId, internalState);

    // All players finished voting => set punishments and proceed to next phase
    if (getCardVotingScore(internalState) === room.players.length) {
      internalState.gameState.phase = GamePhase.CardCreation;
      const [voted, hidden] = getTopMostCards(internalState);
      internalState.votedPunishment = voted;
      internalState.hiddenPunishment = hidden;

      // Reste played cards for the next phase
      internalState.gameState.playedCards = [];
    }

    socket.emit('update', internalState.gameState);
    socket.to(room.id)
      .emit('update', internalState.gameState);
  });

  socket.on('createCards', (cards: {type: CardType; text: string}[]) => {
    if (!player || !room || !internalState) {
      return;
    }

    if (internalState.gameState.phase !== GamePhase.CardCreation) {
      npmlog.warn(SERVER_LOG_PREFIX, 'Room %s is not in %s state', room.id, GamePhase.CardCreation);
      return;
    }

    for (const {type, text} of cards) {
      const card = createNewPlayerCard(text, type);
      assignCardMetadata(card, player, internalState);

      internalState.cardPool.push(card);
    }

    // All players created cards => proceed to card placement
    if (internalState.cardPool.length === room.players.length * CARDS_PER_CATEGORY * CATEGORY_COUNT) {
      const playerCards = generatePlayerCards(internalState);
      internalState.cardPool.push(...playerCards);

      // Load predefined cards and questions
      internalState.predefinedCards = loadCardsForAllTypes(room.nsfw);
      internalState.questions = loadQuestions(room.nsfw, null, null);

      handoutCards(internalState);

      startNextRound();
    }

    socket.emit('update', internalState.gameState);
    socket.to(room.id)
      .emit('update', internalState.gameState);
  });

  socket.on('selectCard', (cardId: number) => {
    if (!player || !room || !internalState) {
      return;
    }

    if (internalState.gameState.phase !== GamePhase.CardPlacement) {
      npmlog.warn(SERVER_LOG_PREFIX, 'Room %s is not in %s state', room.id, GamePhase.CardPlacement);
      return;
    }

    // Remove card from hand
    const card = removeCardFromHand(cardId, internalState);

    // Add card to played cards
    if (card !== undefined) {
      internalState.gameState.playedCards.push({
        card,
        votes: 0,
        dealer: player,
      });
    }

    // All players have selected => proceed to next phase
    if (internalState.gameState.playedCards.length === room.players.length) {
      internalState.gameState.phase = GamePhase.CardVoting;
    }

    socket.emit('update', internalState.gameState);
    socket.to(room.id)
      .emit('update', internalState.gameState);
  });

  socket.on('voteCard', (cardId: number) => {
    if (!player || !room || !internalState) {
      return;
    }

    if (internalState.gameState.phase !== GamePhase.CardVoting) {
      npmlog.warn(SERVER_LOG_PREFIX, 'Room %s is not in %s state', room.id, GamePhase.CardVoting);
      return;
    }

    // Vote for target card
    voteForCard(cardId, internalState);

    // All players finished voting => proceed to next phase
    if (getCardVotingScore(internalState) === room.players.length) {
      internalState.gameState.phase = GamePhase.CardResults;

      // Calculate scores
      calculateScores(internalState);

    }

    socket.emit('update', internalState.gameState);
    socket.to(room.id)
      .emit('update', internalState.gameState);
  });

  socket.on('startNextRound', () => {
    if (!player || !room || !internalState) {
      return;
    }

    if (internalState.gameState.phase !== GamePhase.CardResults) {
      npmlog.warn(SERVER_LOG_PREFIX, 'Room %s is not in %s state', room.id, GamePhase.CardVoting);
      return;
    }

    if (internalState.gameState.round >= ROUNDS_TO_PLAY) {
      internalState.gameState.phase = GamePhase.Scoreboard;
    } else {
      startNextRound();
    }

    socket.emit('update', internalState.gameState);
    socket.to(room.id)
      .emit('update', internalState.gameState);
  });

  // socket.on('selectBoxes', (boxes) => {
    // if (!room || !player) {
    //   return;
    // }
    //
    // if (canStartGuessing(room)) {
    //
    //   clearSelectionTimeout(room);
    //   clearGuessingTimeout(room);
    //   startGuessingTimeout(room, () => {
    //     console.log('[GAME][GUESS TIMEOUT]', room.id);
    //     startNextRound();
    //   });
    //
    //   setGamePhase(room, Phase.Guessing);
    //   console.log('[GAME][BOXES]', room.id, player.name, boxes);
    //   room.game.round.boxes = boxes;
    //
    //   socket.to(room.id)
    //     .emit('guessBoxes', room.game);
    //   socket.emit('guessBoxes', room.game);
    // }
  // });

  // socket.on('guessBoxes', (guess) => {
    // if (!room || !player) {
    //   return;
    // }
    //
    // if (canGuess(room)) {
    //   console.log('[GAME][GUESS]', room.id, player.name, guess);
    //   room.game.round.guesses[player.id] = guess;
    //
    //   const alreadyGuessed = Object.keys(room.game.round.guesses).length;
    //   const maxGuesses = room.players.length - 1;               // -1 for active player
    //
    //   console.log('already guessed', alreadyGuessed);
    //   console.log('players to guess', room.players.length - 1);
    //
    //   if (alreadyGuessed === maxGuesses) {
    //     clearGuessingTimeout(room);
    //     startNextRound();
    //   } else {
    //     console.log('[GAME][GUESS MISSING]', room.id, maxGuesses - alreadyGuessed);
    //   }
    // }
  // });

  socket.on('disconnect', () => {
    npmlog.log(SERVER_LOG_PREFIX, 'Player %s with id %s disconnected', player?.name, socket.id);

    if (player && room) {
      removePlayer(player);
      closeRoom(room);

      socket.to(room.id)
        .emit('roomClosed');
      socket.emit('roomClosed');
    }
  });

  const startNextRound = () => {
    internalState.gameState.phase = GamePhase.CardPlacement;

    // Refill
    refillHand(internalState);

    // Set next question
    // TODO: @Alex

    // Reset played cards
    internalState.gameState.playedCards = [];

    // Increase round counter
    internalState.gameState.round++;
  };
});
