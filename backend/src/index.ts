import * as express from 'express';
import * as http from 'http';
import { Server } from 'socket.io';
import { Phase } from './model/game';
import { Player } from './model/player';
import { Room } from './model/room';
import {
  calculateScores,
  canGuess,
  canStartGuessing,
  canStartSelection, clearGuessingTimeout, clearSelectionTimeout,
  createOrGetGame,
  setGamePhase,
  setNextPlayer, startGuessingTimeout, startSelectionTimeout,
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
import { SocketData } from './socket-data';
import { ClientToServerEvents, ServerToClientEvents, ServerToServerEvents } from './socket-types';

const SERVER_PORT = +(process.env.SERVER_PORT ?? 3_000);

const app = express();
const server = http.createServer(app);

const start = async () => {
  server.listen(SERVER_PORT, () => {
    console.log('Listening at port ', SERVER_PORT);
  });
};

start();

app.get('/', (req, res) => {
  res.send('hello world');
});

const io = new Server<ClientToServerEvents, ServerToClientEvents, ServerToServerEvents, SocketData>(server, {
  cors: {
    origin: '*',
    methods: ["GET", "POST"],
    credentials: true,
  },
});

io.on('connection', (socket) => {
  let room: Room | undefined = undefined;
  let player: Player | undefined = undefined;

  console.log('[CONNECT]', socket.id);

  socket.on('createRoom', (playerName: string) => {
    if (room && player) {
      // Leave old room if player tries to create a new room
      socket.leave(room.id);
      leaveRoom(room, player);
    }

    room = createRoom();
    player = createOrGetPlayer(playerName, socket.id);

    joinRoom(room, player, true);

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
      return;
    }

    player = createOrGetPlayer(playerName, socket.id);
    const success = joinRoom(room, player, false);

    if (success) {
      socket.join(room.id);
      socket.emit('roomJoined', room);

      socket.to(room.id)
        .emit('updatePlayers', room);
      socket.emit('updatePlayers', room);
    } else {
      // Game is open, no new players allowed
      socket.emit('roomClosed');
    }
  });

  socket.on('startGame', () => {
    if (!room || !player) {
      return;
    }

    if (canStartSelection(room)) {
      room.open = false;
      room.game = createOrGetGame(room);

      if (room.game.current !== player) {
        // This player cannot start a game
        return;
      }

      console.log('guesses', room.game.round.guesses);

      setGamePhase(room, Phase.Selection);

      socket.emit('gameStarted', room.game);
      socket.to(room.id)
        .emit('gameStarted', room.game);

      clearSelectionTimeout(room);
      startSelectionTimeout(room, () => {
        console.log('[GAME][SELECTING TIMEOUT]', room.id);
        startNextRound();
      });
    }
  });

  socket.on('selectBoxes', (boxes) => {
    if (!room || !player) {
      return;
    }

    if (canStartGuessing(room)) {

      clearSelectionTimeout(room);
      clearGuessingTimeout(room);
      startGuessingTimeout(room, () => {
        console.log('[GAME][GUESS TIMEOUT]', room.id);
        startNextRound();
      });

      setGamePhase(room, Phase.Guessing);
      console.log('[GAME][BOXES]', room.id, player.name, boxes);
      room.game.round.boxes = boxes;

      socket.to(room.id)
        .emit('guessBoxes', room.game);
      socket.emit('guessBoxes', room.game);
    }
  });

  socket.on('guessBoxes', (guess) => {
    if (!room || !player) {
      return;
    }

    if (canGuess(room)) {
      console.log('[GAME][GUESS]', room.id, player.name, guess);
      room.game.round.guesses[player.id] = guess;

      const alreadyGuessed = Object.keys(room.game.round.guesses).length;
      const maxGuesses = room.players.length - 1;               // -1 for active player

      console.log('already guessed', alreadyGuessed);
      console.log('players to guess', room.players.length - 1);

      if (alreadyGuessed === maxGuesses) {
        clearGuessingTimeout(room);
        startNextRound();
      } else {
        console.log('[GAME][GUESS MISSING]', room.id, maxGuesses - alreadyGuessed);
      }
    }
  });

  socket.on('disconnect', () => {
    console.log('[DISCONNECT]', socket.id);
    if (player && room) {
      removePlayer(player);

      if (room.host === player) {
        closeRoom(room);

        socket.to(room.id)
          .emit('roomClosed');
        socket.emit('roomClosed');
      } else {
        leaveRoom(room, player);

        socket.to(room.id)
          .emit('updatePlayers', room);
        socket.emit('updatePlayers', room);
      }
    }
  });

  const startNextRound = () => {
    calculateScores(room);
    setNextPlayer(room);
    setGamePhase(room, Phase.Scoring);

    socket.to(room.id)
      .emit('reportScores', room.game);
    socket.emit('reportScores', room.game);
  };
});
