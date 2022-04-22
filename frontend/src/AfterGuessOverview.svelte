<script lang="ts">
    import {twemoji} from 'svelte-twemoji';
    import {Box} from "./model/game";
    import { Player } from './model/player';

    export let boxes: Box[];
    export let guesses: Record<string, string[]>;
    export let players: Player[];
    export let currentId: string;

    let lastPlayer: Player | undefined = undefined;
    let guessList: [string, string, string[]][]

    $: {
      const currentIndex = players.findIndex((p) => p.id === currentId);
      if (currentIndex >= 0) {
        const lastPlayerIndex = (currentIndex - 1 + players.length) % players.length;
        lastPlayer = players[lastPlayerIndex]
      }

      guessList = players
        .filter((p) => p.id !== lastPlayer?.id)
        .map((p) => [p.id, p.name, guesses[p.id] ?? []]);
    }
</script>

<style>
    .table {
        text-decoration: none;
        box-shadow: none;
        text-shadow: none;
        font-size: 17pt;
        background-color: white;
    }
</style>

{#if boxes.length === 0}
<h1>No boxes selected ths round!</h1>
    <br>
    {:else}
<table class="table table-responsive table-hover bg-light">
    <thead>
    <tr>
        <th scope="col">Box</th>
        <th scope="col">Labels</th>
        {#each guessList as [id, name]}
            <th scope="col">{name}</th>
        {/each}
    </tr>
    </thead>
    <tbody>
    {#each boxes as box, index}
    <tr>
        <td use:twemoji>{box.content}</td>
        <td use:twemoji>{box.labels.join('')}</td>

        {#each guessList as [id, name, g]}
            {#if box.content === g[index]}
                <td class="table-success" use:twemoji>{g[index] ?? '-'}</td>
            {:else}
                <td class="table-danger" use:twemoji>{g[index] ?? '-'}</td>
            {/if}
        {/each}
    </tr>
    {/each}
    </tbody>
</table>
    {/if}
