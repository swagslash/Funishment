<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import {Card, CardType} from "./model/card";

  const dispatch = createEventDispatcher();

  export let text: string;
  export let card: Card;

  export let playable = false;
  export let showAuthor = false;
  export let showType = false;
  export let votable = false;
  export let votedFor = false;
  export let isWinner = false;
  export let score: number | undefined = undefined;

  const typeToStringMap = new Map<CardType, string>([
    [CardType.Object, "Object"],
    [CardType.Activity, "Activity"],
    [CardType.Person, "Person"],
    [CardType.Place, "Place"],
  ]);

  function onVote() {
    console.log("voted for " + card.id);
    dispatch("voted", { id: card.id });
  }
</script>

<div class="col">
  <div class="card text-center" class:playable class:votedFor class:isWinner>
    {#if score}
      <div
        class="card-header"
        class:bg-warning={isWinner}
        class:bg-secondary={!isWinner}
      >
        {#if isWinner}⭐{/if}
        {score} Votes {#if isWinner}⭐{/if}
      </div>
    {:else if showType}
      <div class="card-header"
           class:object={card.type === CardType.Object}
           class:person={card.type === CardType.Person}
           class:place={card.type === CardType.Place}
           class:activity={card.type === CardType.Activity}
      >
        {typeToStringMap.get(card.type)}
      </div>
    {/if}
    <div class="card-body">
      <h5 class="card-title text-dark">{card.text}</h5>
      {#if showAuthor}<p class="card-text">
          <small class="text-muted">by {card.author}</small>
        </p>{/if}
        {#if votedFor}<p class="card-text">
          <small class="text-muted">You voted for this.</small>
        </p>{/if}
    </div>
    {#if votable}
      <div class="card-footer text-muted">
        <a href="#" on:click={onVote} class="card-link">🔥 Vote</a>
      </div>
    {/if}
  </div>
</div>

<style lang="scss">
  .card {
    position: relative;
    top: 0;
    transition: top ease 0.5s;
    margin: 5px;

    /* width: 14rem; */
  }

  .votedFor {
    box-shadow: 0px 0px 25px rgba(84, 245, 51, 0.795);
  }

  .isWinner {
    box-shadow: 0px 0px 25px rgba(240, 218, 24, 0.795);
    color: black;
  }

  .card-title {
    font-family: Neucha, -apple-system, system-ui, BlinkMacSystemFont,
      "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  }

  .playable {
    cursor: pointer;
  }

  .playable:hover {
    color: rgba(255, 255, 255, 1);
    box-shadow: 0 5px 5px rgba(238, 206, 24, 0.4);
    top: -10px;
  }

  .object {
    background-color: #6610f2;
    color: white;
  }

  .person {
    background-color: #fd7e14;
    color: black;
  }

  .place {
    background-color: #198754;
    color: white;
  }

  .activity {
    background-color: #0dcaf0;
    color: white;
  }
</style>
