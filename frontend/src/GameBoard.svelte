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

    const dispatch = createEventDispatcher();

    export let game: GameState;
    export let userId: string;
    export let players: Player[];
</script>

<main class="px-3">
    <h1>Game running</h1>
    <div id="game">
        {#if game.phase === GamePhase.PunishmentCreation}
            <h1>PunishmentCreation</h1>
            <PunishmentCreatorComponent></PunishmentCreatorComponent>
        {:else if game.phase === GamePhase.PunishmentVoting}
            <h1>PunishmentVoting</h1>
            <VotingComponent cards={game.playedCards.map((pc) => pc.card)}></VotingComponent>
        {:else if game.phase === GamePhase.CardCreation}
            <PunishmentDisplayComponent punishment={}></PunishmentDisplayComponent>
            <CardCreatorComponent></CardCreatorComponent>
        {:else if game.phase === GamePhase.CardPlacement}
            <!-- TODO implement hand with cards (game.playerState find with id) -->
        {:else if game.phase === GamePhase.CardVoting}
            <CardPresenter cards={game.playedCards.map((pc) => pc.card)}></CardPresenter>
            <!-- TODO card to playablecard everywhere -->
        {:else if game.phase === GamePhase.CardResults}
            <PunishmentDisplayComponent punishment={game.appliedPunishment}></PunishmentDisplayComponent>
            <ScoreList scores={game.playerState}></ScoreList>
            <!-- TODO scores needs to take playerState[] -->
        {:else if game.phase === GamePhase.Scoreboard}
            <!-- endgame -->
            <PunishmentDisplayComponent punishment={game.appliedPunishment}></PunishmentDisplayComponent>
            <ScoreList scores={game.playerState}></ScoreList>
            <!-- TODO scores needs to take playerState -->
        {:else}
            <h1>Missing implementation for view of {game.phase}</h1>
        {/if}
    </div>
</main>
