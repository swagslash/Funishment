<script lang="ts">
    import {GamePhase, GameState} from './model/game-state';
    import {Player} from './model/player';
    import {createEventDispatcher} from 'svelte';

    const dispatch = createEventDispatcher();

    export let game: GameState;
    export let userId: string;
    export let players: Player[];
</script>

<main class="px-3">
    <div id="game">
        {#if game.phase === GamePhase.PunishmentCreation}
            <h1>PunishmentCreation</h1>
        {:else if game.phase === GamePhase.PunishmentVoting}
            <h1>PunishmentVoting</h1>
        {:else}
            <h1>Missing implementation for view of {game.phase}</h1>
        {/if}
    </div>
</main>
