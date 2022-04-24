import * as npmlog from 'npmlog';
import { io, Socket } from 'socket.io-client';
import { CardType } from './model/card';
import { GamePhase, GameState } from './model/game-state';
import { Room } from './model/room';
import { ClientToServerEvents, ServerToClientEvents } from './socket-types';

const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io('http://localhost:3000');

const roomToJoin = process.env.ROOM_ID ?? undefined;
const playerName = process.env.NAME ?? '><((*>';

let playerId: string;
let myRoom: Room;
let gameState: GameState;

socket.on('connect', () => {
  npmlog.info('connect', 'New connection %s', socket.id);
  playerId = socket.id;
});

if (roomToJoin === undefined) {
  socket.emit('createRoom', playerName, true);
} else {
  socket.emit('joinRoom', playerName, roomToJoin);
}

socket.on('roomCreated', (room) => {
  npmlog.info('room',  'Room created %s', room.id);
  myRoom = room;
});

socket.on('roomUpdated', (room) => {
  myRoom = room;
  npmlog.info('room', 'Players in room %s: %s', myRoom.id, room.players.map((p) => p.name));

  if (room.players.length === 4) {
    npmlog.info('game', 'start new game');
    socket.emit('startGame');
  }
});

socket.on('roomClosed', () => {
  npmlog.info('room', 'Room closed');
});

socket.on('update', (state) => {
  if (gameState?.phase === state.phase) {
    npmlog.info('state', 'Got same state, skipping logic');

    return;
  }

  switch (state.phase) {
    case GamePhase.PunishmentCreation:
      const punishment = `Punishment from ${playerName}`;
      npmlog.info('punishment', 'Create punishment %s in 3s', punishment);
      setTimeout(() => {
        npmlog.info('punishment', 'Send punishment %s', punishment);
        socket.emit('createPunishment', punishment);
      }, 3_000);

      break;
    case GamePhase.PunishmentVoting:
      npmlog.info('punishment', 'Available punishments for voting: %s', state.playedCards.map((p) => p.card.id));

      const index = Math.floor(Math.random() * state.playedCards.length);
      const vote = state.playedCards[index]

      setTimeout(() => {
        npmlog.info('punishment', 'Vote for punishment %s', vote.card);
        socket.emit('votePunishment', vote.card.id);
      }, 3_000);

      break;
    case GamePhase.CardCreation:
      npmlog.info('cards', 'Card creation');

      setTimeout(() => {
        const cards: { type: CardType; text: string}[] = [
          { type: CardType.Person, text: `${playerName}-person1` },
          { type: CardType.Person, text: `${playerName}-person2` },
          { type: CardType.Object, text: `${playerName}-object1` },
          { type: CardType.Object, text: `${playerName}-object2` },
          { type: CardType.Place, text: `${playerName}-place1` },
          { type: CardType.Place, text: `${playerName}-place2` },
          { type: CardType.Activity, text: `${playerName}-activity1` },
          { type: CardType.Activity, text: `${playerName}-activity2` },
        ];
        npmlog.info('cards', 'Sending 8 cards');
        socket.emit('createCards', cards);
      }, 3_000);

      break;
    case GamePhase.CardPlacement:
      npmlog.info('placement', 'Question %s.', state.question.text);
      const hand = state.playerState.find((p) => p.player.id === playerId).hand;

      setTimeout(() => {
        const index = Math.floor(Math.random() * hand.length);
        const selection = hand[index];
        npmlog.info('placement', 'Answer: %s', selection);

        socket.emit('selectCard', selection.id);
      }, 3_000);

      break;
    case GamePhase.CardVoting:
      npmlog.info('voting', 'Card voting');

      setTimeout(() => {
        const index = Math.floor(Math.random() * state.playedCards.length);
        const vote = state.playedCards[index];

        npmlog.info('voting', 'Voting for %s', vote.card.text);

        socket.emit('voteCard', vote.card.id);
      }, 3_000);

      break;
    case GamePhase.CardResults:
      npmlog.info('round', 'Card results');
      const results = state.playedCards.map(({card, votes}) => {
        return `${card.text} (${votes})`;
      });
      npmlog.info('round', 'Results: %s\n\n', results);

      if (state.appliedPunishment) {
        npmlog.info('punishment', 'Punishment: Players %s have to %s', state.appliedPunishment.targets.map((p) => p.name), state.appliedPunishment.card.text);
      }

      setTimeout(() => {
        npmlog.info('round', 'Start next round');
        socket.emit('startNextRound');
      }, 3_000);

      break;
    case GamePhase.Scoreboard:
      npmlog.info('round', 'Scoreboard', state.playerState.map((ps) => {
        return {
          'player': ps.player.name,
          'score': ps.score,
        };
      }));

      if (state.appliedPunishment) {
        npmlog.info('punishment', 'FINAL Punishment: Players %s have to %s', state.appliedPunishment.targets.map((p) => p.name), state.appliedPunishment.card.text);
      }

      break;
  }

  gameState = state;
});


// import { io, Socket } from 'socket.io-client';
// import { Game } from './model/game';
// import { Room } from './model/room';
// import { ClientToServerEvents, ServerToClientEvents } from './socket-types';
//
// const roomToJoin = process.env.ROOM_ID ?? undefined;
// const playerName = process.env.NAME ?? '><((*>';
//
// const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io('http://localhost:3000');
//
// let playerId: string;
// let myRoom: Room;
// let myGame: Game;
//
// socket.on('connect', () => {
//   console.log('ID', socket.id);
//   playerId = socket.id;
// });
//
//
// if (roomToJoin === undefined) {
//   socket.emit('createRoom', playerName);
// } else {
//   socket.emit('joinRoom', playerName, roomToJoin);
// }
//
// socket.on('roomCreated', (room) => {
//   console.log('room created', room.id, room.players.map((p) => p.name));
//   myRoom = room;
// });
//
// socket.on('roomJoined', (room) => {
//   myRoom = room;
//   console.log('Room joined', 'Host:', room.host.name, room.host.id);
// });
//
// socket.on('updatePlayers', (room) => {
//   myRoom = room;
//   const players = room.players;
//   console.log('Players in room', myRoom.id, players.map((p) => p.name));
//
//   // Start game after 2 players joined
//   if (myRoom.players.length === 3 && myRoom.host.id === playerId) {
//     console.log('I will start the next game in 5 seconds');
//     socket.emit('startGame');
//   }
// });
//
// socket.on('roomClosed', () => {
//   console.log('room closed');
// });
//
// socket.on('gameStarted', (game) => {
//   myGame = game;
//   console.log('Game Started');
//   if (game.current.id === playerId) {
//     console.log('Select from', game.round.contentPool);
//     console.log('Assign labels from', game.round.labelPool);
//
//     setTimeout(() => {
//       const {contentPool, labelPool} = game.round;
//       socket.emit('selectBoxes', [
//         {
//           content: contentPool[0],
//           labels: [labelPool[0], labelPool[1]],
//         },
//         {
//           content: contentPool[1],
//           labels: [labelPool[0], labelPool[1]],
//         },
//         {
//           content: contentPool[2],
//           labels: [labelPool[0], labelPool[1]],
//         },
//       ]);
//     }, 5_000);
//   } else {
//     console.log(game.current.name, 'is packing', game.round.contentPool);
//   }
// });
//
// socket.on('guessBoxes', (game) => {
//   myGame = game;
//   if (playerId === game.current.id) {
//     console.log('I wait for other guesses');
//   } else {
//     const timeout = Math.ceil(Math.random() * 5000);
//     console.log('I give my guess', playerId, timeout);
//     setTimeout(() => {
//       const {contentPool} = myGame.round;
//       const rand = Math.random();
//       if (rand < 0.1) {
//         socket.emit('guessBoxes', [contentPool[0], contentPool[1], contentPool[2]]);
//       } else if (rand < 0.6) {
//         socket.emit('guessBoxes', [contentPool[3], contentPool[4], contentPool[2]]);
//       } else {
//         socket.emit('guessBoxes', [contentPool[0], contentPool[4], contentPool[2]]);
//       }
//     }, timeout);
//   }
// });
//
// socket.on('reportScores', (game) => {
//   console.log('Game finished:', game.scores);
//   console.log('next player', game.current.name, game.current.id);
//   console.log('\n\n');
//
//   if (game.current.id === playerId) {
//     console.log('I will start the next game in 5 seconds');
//     socket.emit('startGame');
//   }
// });