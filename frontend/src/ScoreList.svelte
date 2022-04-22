<script lang="ts">
  import {twemoji} from 'svelte-twemoji';
  import { Player } from './model/player';

  export let scores: Record<string, number> = {};
  export let myUserId: string = ''; // user id
  export let currentUserId: string = ''; // user id
  export let players: Player[] = [];

  let scoreList: [string, string, number][];

  $: {
    scoreList = players.map((p) => [p.id, p.name, scores[p.id] ?? 0])
    .sort(([,,score1], [,,score2]) => score2 - score1);
  }
</script>

<style>
  .score-list {
    text-decoration: none;
    box-shadow: none;
    text-shadow: none;
    font-size: 17pt;
  }
</style>

<main class="px-3">
  <div id="scores">
    <ul class="list-group score-list" use:twemoji>
      {#each scoreList as [id, name, score], index}
        {#if index === 0}
          <li class="list-group-item d-flex justify-content-between align-items-center active">
            {#if id === myUserId}
              🥇 {name} (You)
            {:else}
              🥇 {name}
            {/if}
            <span class="badge bg-light text-dark rounded-pill" style="font-weight: bold">Score: {score} 🌟</span>
          </li>
        {:else}
          <li class="list-group-item d-flex justify-content-between align-items-center">
            {#if id === myUserId}
              🧒 {name} (You)
            {:else}
              🧒 {name}
            {/if}
            <span class="badge bg-secondary rounded-pill" style="font-weight: bold">Score: {score} 🌟</span>
          </li>
        {/if}
      {:else}
      <li>No players?</li>
      {/each}
    </ul>
  </div>
</main>
