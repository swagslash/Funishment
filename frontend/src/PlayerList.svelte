<style>
    .player-list {
        text-decoration: none;
        box-shadow: none;
        text-shadow: none;
        font-size: 17pt;
    }
</style>

<main class="px-3">
    <div id="pre-lobby">
        <h1>Your Lobby <span class="text-primary fw-bold">{room.id}</span></h1>
        <ul class="list-group player-list">
            {#each players as player}
                {#if player.id === myUserId}
                    <li class="list-group-item d-flex justify-content-between align-items-center active">
                        {#if player.id === room.host.id}
                            👻 {player.name} (You)
                            <span class="badge bg-warning rounded-pill" style="font-weight: bold">Host</span>
                        {:else}
                            🧒 {player.name} (You)
                            <span class="badge bg-secondary rounded-pill" style="font-weight: bold">Player</span>
                        {/if}
                    </li>
                {:else}
                    <li class="list-group-item d-flex justify-content-between align-items-center">
                        {#if player.id === room.host.id}
                            👻 {player.name}
                            <span class="badge bg-warning rounded-pill" style="font-weight: bold">Host</span>
                        {:else}
                            🧒 {player.name}
                            <span class="badge bg-primary rounded-pill" style="font-weight: bold">Player</span>
                        {/if}
                    </li>
                {/if}
            {/each}
        </ul>
    </div>
</main>

<script lang="ts">
    import {Room} from './model/room';

    export let players;
    export let myUserId;
    export let room: Room;
</script>
