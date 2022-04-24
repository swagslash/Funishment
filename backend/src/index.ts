import * as express from 'express';
import * as http from 'http';
import * as npmlog from 'npmlog';
import { Server } from 'socket.io';
import { Card, CardType } from './model/card';
import { GamePhase } from './model/game-state';
import { Player } from './model/player';
import { PunishmentCondition } from './model/punishment';
import { Room } from './model/room';
import {
  addCard,
  assignCardMetadata, CARDS_PER_CATEGORY, CATEGORY_COUNT,
  createNewPlayerCard,
  createNewPunishmentCard,
  generatePlayerCards,
  getCardVotingScore,
  getTopMostCards,
  handoutCards,
  refillHand, refillWithPredefinedCards,
  removeCardFromHand,
  voteForCard,
} from './server/core/card-manager';
import { loadCardsForAllTypes, loadQuestions } from './server/core/file-manager';
import {
  calculateHiddenPunishment,
  calculateScores,
  createInternalState,
  getInternalState,
  getVotedPunishment,
  removeInternalState,
} from './server/core/game-manager';
import {
  closeRoom,
  createOrGetPlayer,
  createRoom,
  getRoom,
  joinRoom,
  leaveRoom,
  removePlayer,
} from './server/core/room-manager';
import { InternalState } from './server/core/state';
import { ClientToServerEvents, ServerToClientEvents, ServerToServerEvents } from './socket-types';

const SERVER_PORT = +(process.env.SERVER_PORT ?? 3_000);
const SERVER_LOG_PREFIX = 'server';
const PUNISHMENT_LOG_PREFIX = 'punishment';
const CARDS_LOG_PREFIX = 'cards';
const ROUND_LOG_PREFIX = 'round';

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

  npmlog.info(SERVER_LOG_PREFIX, 'New connection: %s', socket.id);

  socket.on('createRoom', (playerName: string, nsfw: boolean) => {
    if (room && player) {
      // Leave old room if player tries to create a new room
      socket.leave(room.id);
      leaveRoom(room, player);
    }

    player = createOrGetPlayer(playerName, socket.id);
    room = createRoom(player, nsfw);

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
      socket.emit('roomClosed', player);
    }
  });

  socket.on('startGame', () => {
    if (!room || !player) {
      return;
    }

    if (room.host.id !== player.id) {
      npmlog.warn(SERVER_LOG_PREFIX, 'Current player %s of room %s not host', player.name, room.id);
      return;
    }

    removeInternalState(room.id);
    internalState = createInternalState(room);
    internalState.predefinedCards = loadCardsForAllTypes(room.nsfw, room.players.map((p) => p.name), internalState);

    room.open = false;

    socket.emit('update', internalState.gameState);
    socket.to(room.id)
        .emit('update', internalState.gameState);
  });

  socket.on('createPunishment', (punishmentText: string) => {
    if (!player || !room) {
      return;
    }

    if (!internalState) {
      internalState = getInternalState(room.id);
    }

    if (internalState.gameState.phase !== GamePhase.PunishmentCreation) {
      npmlog.warn(PUNISHMENT_LOG_PREFIX, '[Creation] Invalid state: Room %s, player %s, phase: %s', room.id, player.name, internalState.gameState.phase);
      return;
    }

    const card = createNewPunishmentCard(punishmentText);
    assignCardMetadata(card, player, internalState);
    addCard(card, player, internalState);

    npmlog.info(PUNISHMENT_LOG_PREFIX, 'Player %s in room %s created new punishment %s', player.name, room.id, punishmentText);

    // All players created punishments => proceed to next phase
    if (internalState.gameState.playedCards.length === room.players.length) {
      npmlog.info(PUNISHMENT_LOG_PREFIX, 'All players in room %s created their punishment', room.id);
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
      npmlog.warn(PUNISHMENT_LOG_PREFIX, '[Voting] Invalid state: Room %s, player %s, phase: %s', room.id, player.name, internalState.gameState.phase);
      return;
    }

    voteForCard(punishmentId, internalState);

    // All players finished voting => set punishments and proceed to next phase
    if (getCardVotingScore(internalState) === room.players.length) {
      internalState.gameState.phase = GamePhase.CardCreation;
      const punishments = getTopMostCards(internalState);
      internalState.votedPunishment = punishments.splice(0, 1)[0];
      internalState.hiddenPunishments = punishments;

      npmlog.info(PUNISHMENT_LOG_PREFIX, 'Voted punishment %s, # of hidden punishment: %s', internalState.votedPunishment,internalState.hiddenPunishments.length);

      // Reset played cards for the next phase
      internalState.gameState.playedCards = [];

      // Set punishment for the card creation phase
      internalState.gameState.appliedPunishment = {
        condition: PunishmentCondition.GameFinished,
        card: internalState.votedPunishment,
        targets: [],
      };
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
      npmlog.warn(CARDS_LOG_PREFIX, '[Creation] Invalid state: Room %s, player %s, phase: %s', room.id, player.name, internalState.gameState.phase);
      return;
    }

    const intermediatePool: Card[] = [];
    for (const {type, text} of cards) {
      const card = createNewPlayerCard(text, type);
      assignCardMetadata(card, player, internalState);
      intermediatePool.push(card);
    }

    refillWithPredefinedCards(intermediatePool, internalState);

    internalState.cardPool.push(...intermediatePool);

    // All players created cards => proceed to card placement
    if (internalState.cardPool.length === room.players.length * CARDS_PER_CATEGORY * CATEGORY_COUNT) {
      npmlog.info(CARDS_LOG_PREFIX, 'All players in room %s created cards', room.id);
      const playerCards = generatePlayerCards(internalState);
      internalState.cardPool.push(...playerCards);

      // Load predefined cards and questions
      internalState.questions = loadQuestions(room.nsfw, internalState.cardPool, internalState.predefinedCards);

      npmlog.info('lafjldksa', 'hand out cards', internalState.cardPool);

      handoutCards(internalState);

      internalState.gameState.appliedPunishment = undefined;

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
      npmlog.warn(CARDS_LOG_PREFIX, '[Placement] Invalid state: Room %s, player %s, phase: %s', room.id, player.name, internalState.gameState.phase);
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
      internalState.gameState.appliedPunishment = undefined;

      npmlog.info(ROUND_LOG_PREFIX, 'All players in room %s placed their cards', room.id);
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
      npmlog.warn(CARDS_LOG_PREFIX, '[Voting] Invalid state: Room %s, player %s, phase: %s', room.id, player.name, internalState.gameState.phase);
      return;
    }

    // Vote for target card
    voteForCard(cardId, internalState);

    // All players finished voting => proceed to next phase
    if (getCardVotingScore(internalState) === room.players.length) {
      npmlog.info(ROUND_LOG_PREFIX, 'All players in room %s finished voting', room.id);
      internalState.gameState.phase = GamePhase.CardResults;

      // Calculate scores
      calculateScores(internalState);

      const hiddenPunishment = calculateHiddenPunishment(internalState, player);
      if (hiddenPunishment) {
        npmlog.info(PUNISHMENT_LOG_PREFIX, 'Room %s: Punishment %s (%s) for players %s', room.id, hiddenPunishment.card.text, hiddenPunishment.condition, hiddenPunishment.targets.map((p) => p.name));
        internalState.gameState.appliedPunishment = hiddenPunishment;
      }
    }

    socket.emit('update', internalState.gameState);
    socket.to(room.id)
      .emit('update', internalState.gameState);
  });

  socket.on('startNextRound', () => {
    if (!player || !room || !internalState) {
      return;
    }

    if (room.host.id !== player.id) {
      npmlog.warn(SERVER_LOG_PREFIX, 'Current player %s of room %s not host', player.name, room.id);
      return;
    }

    if (internalState.gameState.phase !== GamePhase.CardResults) {
      npmlog.warn(CARDS_LOG_PREFIX, '[Results] Invalid state: Room %s, player %s, phase: %s', room.id, player.name, internalState.gameState.phase);
      return;
    }

    if (internalState.gameState.round >= ROUNDS_TO_PLAY) {
      internalState.gameState.phase = GamePhase.Scoreboard;

      // Set last punishment
      internalState.gameState.appliedPunishment = getVotedPunishment(internalState);
      npmlog.info(ROUND_LOG_PREFIX, 'Game finished for room %s', room.id);
    } else {
      startNextRound();
    }

    socket.emit('update', internalState.gameState);
    socket.to(room.id)
      .emit('update', internalState.gameState);
  });

  socket.on('disconnect', () => {
    npmlog.info(SERVER_LOG_PREFIX, 'Player %s with id %s disconnected', player?.name, socket.id);

    if (player && room) {
      removePlayer(player);
      closeRoom(room);

      socket.leave(room.id);
      socket.to(room.id)
        .emit('roomClosed', player);
      socket.emit('roomClosed', player);
    }
  });

  const startNextRound = () => {
    internalState.gameState.phase = GamePhase.CardPlacement;

    // Refill
    refillHand(internalState);

    // Set next question
    internalState.gameState.question = internalState.questions.pop();

    // Reset played cards
    internalState.gameState.playedCards = [];

    // Increase round counter
    internalState.gameState.round++;

    npmlog.info(ROUND_LOG_PREFIX, 'Starting round %s in room %s', internalState.gameState.round, room.id);
  };
});

