<div class="d-flex text-center text-white">
    <div class="cover-container d-flex w-100 h-100 p-1 mx-auto flex-column">
        <header class="mb-auto">
            <div>
                <h3 class="float-md-start mb-0">⚖️ Funishment</h3>
                <nav class="nav nav-masthead justify-content-center float-md-end">
                    <span class="nav-link" title={userId}>
                        {#if username}<span title={userId}>{username}</span>{/if}
                        {#if room}
                            {#if userId === room.host.id} hosting{:else} playing in{/if}
                            {#if room.nsfw} <span class="text-danger">NSFW</span>{/if} lobby
                            <b class="text-white">{room.id}</b>
                        {/if}
                    </span>
                </nav>
            </div>
        </header>


        {#if kitchenSinkEnabled}
            <KitchenSink></KitchenSink>
        {/if}

        {#if game}
            <GameBoard socket={socket}
                       game={game}
                       isHost={userId === room.host.id}
                       userId={userId}
                       players={room?.players ?? []}/>
        {:else}
            {#if username && room}
                <div id="chat-container">
                    <PlayerList room={room} players={room.players} lobbyId={room.id} myUserId={userId}/>
                    <br>
                    {#if userId === room.host.id}
                        <p>You are hosting this lobby.</p>
                        {#if room.players.length < 2}
                            <p>⏳ Wait for more players to start the game. ⏳</p>
                        {/if}
                        <button class="btn btn-lg btn-primary fw-bold" on:click={hostStartGame}
                                disabled="{startGameDisabled}">👉 Start Game 👈
                        </button>
                    {:else}
                        <p>⏳ Wait for your host to start the game. ⏳</p>
                    {/if}
                </div>
            {:else}
                <div class="justify-content-center">
                    <LoginForm roomNotFound="{roomNotFound}" on:join={join}/>
                </div>
            {/if}
        {/if}


        <footer class="mt-auto text-white-50">
            <p>Created by SwagSlash Studios.</p>
        </footer>
    </div>
</div>

<style lang="scss">


  /*
 * Globals
 */
  .cover-container {
    max-width: 67em;
  }


  /* Custom default button */
  .btn-secondary,
  .btn-secondary:hover,
  .btn-secondary:focus {
    color: #333;
    text-shadow: none; /* Prevent inheritance from `body` */
  }


  /*
   * Header
   */

  .nav-masthead .nav-link {
    padding: .25rem 0;
    font-weight: 700;
    color: rgba(255, 255, 255, .5);
    background-color: transparent;
    /*border-bottom: .25rem solid transparent;*/
  }

  .nav-masthead .nav-link:hover,
  .nav-masthead .nav-link:focus {
    border-bottom-color: rgba(255, 255, 255, .25);
  }

  .nav-masthead .nav-link + .nav-link {
    margin-left: 1rem;
  }

  .nav-masthead .active {
    color: #fff;
    border-bottom-color: #fff;
  }


  .bd-placeholder-img {
    font-size: 1.125rem;
    text-anchor: middle;
    -webkit-user-select: none;
    -moz-user-select: none;
    user-select: none;
  }

  @media (min-width: 768px) {
    .bd-placeholder-img-lg {
      font-size: 3.5rem;
    }
  }
</style>

<script lang="ts">
    import io from "socket.io-client";

    import PlayerList from './PlayerList.svelte';
    import LoginForm from './LoginForm.svelte';

    import GameBoard from "./GameBoard.svelte";
    import {GameState} from './model/game-state';
    import {Room} from './model/room';
    import KitchenSink from "./KitchenSink.svelte";
    import {Player} from "src/model/player";

    let game: GameState;
    let userId: string;
    let username: string;
    let room: Room;

    let roomNotFound: boolean = false;
    let startGameDisabled: boolean = false;

    const kitchenSinkEnabled = false; // TODO set to false to game to work, ONLY USED FOR DEBGUGING COMPONENTS

    // const socket = io('http://164.90.213.85:3000/');
    const socket = io('http://localhost:3000');

    socket.on('connect', () => {
        userId = socket.id
    });

    socket.on('disconnected', function () {
        reset();
    });

    function join(event) {
        const lobbyId = event.detail.lobbyId;
        username = event.detail.username;
        const isNsfw = event.detail.isNsfw;

        console.log(lobbyId, username, isNsfw);

        if (lobbyId === undefined || lobbyId === '') {
            socket.emit('createRoom', username, isNsfw);
        } else {
            socket.emit('joinRoom', username, lobbyId);
        }
    }

    function hostStartGame() {
        // start the game here
        socket.emit('startGame');
    }

    function updateRoom(_room) {
        room = _room
        startGameDisabled = room.players.length <= 1;
    }

    socket.on('roomNotFound', () => {
        roomNotFound = true;
    });

    socket.on('roomClosed', (_player: Player) => {
        alert("Room got closed, because " + _player.name + " disconnected.")
        reset();
    });

    socket.on('roomCreated', (_room: Room) => {
        console.log(_room)
        updateRoom(_room);
        roomNotFound = false;
    });

    socket.on('roomUpdated', (_room: Room) => {
        updateRoom(_room);
        roomNotFound = false;
    });

    socket.on('update', (_game: GameState) => {
        console.log("update received");
        console.log( JSON.stringify(_game));
        game = _game;
    });

    function reset() {
        game = undefined;
        userId = undefined;
        username = undefined;
        room = undefined;
    }

    function nextRound() {
        hostStartGame();
    }

    function handleVoting(e: any) {
        console.log(e.detail.id);
    }
</script>
