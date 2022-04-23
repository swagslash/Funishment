<script lang="ts">
    import {GamePhase, GameState} from './model/game-state';
    import {Player} from './model/player';
    import {createEventDispatcher} from 'svelte';

    import PunishmentCreatorComponent from "./PunishmentCreatorComponent.svelte";
    import VotingComponent from "./VotingComponent.svelte";
    import PunishmentDisplayComponent from "./PunishmentDisplayComponent.svelte";
    import CardCreatorComponent from "./CardCreatorComponent.svelte";
    import CardPresenter from "./CardPresenter.svelte";
    import ScoreList from "./ScoreList.svelte";
    import VotingResultComponent from "./VotingResultComponent.svelte";
    import HandCards from "./HandCards.svelte";
    import {Socket} from "socket.io-client";
    import QuestionComponent from "./QuestionComponent.svelte";

    export let socket: Socket;
    export let game: GameState;
    export let userId: string;
    export let isHost: boolean;
    export let players: Player[];

    function getMyHand() {
        for (const playerState of game.playerState) {
            if (playerState.player.id === userId) {
                return playerState.hand;
            }
        }
        return [];
    }

    function sendPunishment(e: any) {
        socket.emit('createPunishment', e.detail.text)
        console.log("Emit createPunishment to server " + e.detail.text)
    }

    function sendPunishmentVote(e: any) {
        socket.emit('votePunishment', e.detail.id)
        console.log("Emit votePunishment to server " + e.detail.id)
    }

    function sendCardsCreated(e: any) {
        socket.emit('createCards', e.detail.userCards)
        console.log("Emit createCards to server " + e.detail.userCards)
    }

    function sendPlayedCard(e: any) {
        socket.emit('selectCard', e.detail.id)
        console.log("Emit selectCard to server " + e.detail.id)
    }

    function sendNextRound(e: any) {
        socket.emit('startNextRound')
        console.log("Emit startNextRound to server")
    }

    function sendVotes(e: any) {
        socket.emit('voteCard', e.detail.id)
        console.log("Emit voteCard to server " + e.detail.id)
    }
</script>

<main class="px-3">
    <h1>Game running</h1>
    <div id="game">
        {#if game.phase === GamePhase.PunishmentCreation}
            <h1>PunishmentCreation</h1>
            <PunishmentCreatorComponent on:created={sendPunishment}></PunishmentCreatorComponent>
        {:else if game.phase === GamePhase.PunishmentVoting}
            <h1>PunishmentVoting</h1>
            <VotingComponent cards={game.playedCards} on:voted={sendPunishmentVote}></VotingComponent>
        {:else if game.phase === GamePhase.CardCreation}
            <PunishmentDisplayComponent punishment={game.appliedPunishment}></PunishmentDisplayComponent>
            <CardCreatorComponent on:created={sendCardsCreated}></CardCreatorComponent>
        {:else if game.phase === GamePhase.CardPlacement}
            <QuestionComponent question={game.question}></QuestionComponent>
            <HandCards canPlay={true} cards={getMyHand()} on:play={sendPlayedCard}></HandCards>
        {:else if game.phase === GamePhase.CardVoting}
            <QuestionComponent question={game.question}></QuestionComponent>
            <CardPresenter currentPlayerId={userId} playedCards={game.playedCards} on:voted={sendVotes}></CardPresenter>
        {:else if game.phase === GamePhase.CardResults}
            <QuestionComponent question={game.question}></QuestionComponent>
            <VotingResultComponent currentPlayerId={userId} playedCards={game.playedCards}></VotingResultComponent>

            <PunishmentDisplayComponent punishment={game.appliedPunishment}></PunishmentDisplayComponent>

            {#if isHost}
                <button class="btn btn-primary" on:click={sendNextRound}>Next round</button>
            {/if}
        {:else if game.phase === GamePhase.Scoreboard}
            <!-- endgame -->
            <PunishmentDisplayComponent punishment={game.appliedPunishment}></PunishmentDisplayComponent>
            <ScoreList playerStates={game.playerState}></ScoreList>
            <!-- TODO scores needs to take playerState -->
        {:else}
            <h1>Missing implementation for view of {game.phase}</h1>
        {/if}
    </div>
</main>
