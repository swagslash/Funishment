<script lang="ts">
    import {createEventDispatcher} from "svelte";
    import {Card, CardType} from "./model/card";
    import {Player} from "./model/player";

    const dispatch = createEventDispatcher();

    export let card: Card;

    export let dealer: Player | undefined = undefined;
    export let votes: number | undefined = undefined;
    export let currentPlayerId: string | undefined;

    export let playable = false;
    export let played = false;
    export let showAuthor = false;
    export let showDealer = false;
    export let showType = false;
    export let votable = false;
    export let votedFor = false;
    export let isWinner = false;
    export let presenterTheme = false;

    const typeToStringMap = new Map<CardType, string>([
        [CardType.Object, "Object"],
        [CardType.Activity, "Activity"],
        [CardType.Person, "Person"],
        [CardType.Place, "Place"],
        [CardType.Punishment, "Punishment"],
    ]);

    function onVote() {
        console.log("voted for " + card.id);
        votedFor = true;
        dispatch("voted", {id: card.id});
    }

    function onSelected() {
        if (playable) {
            console.log("played " + card.id);
            played = true;
            playable = false;
            dispatch("play", {id: card.id});
        }
    }
</script>

<div class="col">
    <div class="card text-center" class:playable class:votedFor class:isWinner class:presenterTheme class:played
         on:click={onSelected}>
        {#if votes}
            <div class="card-header"
                 class:bg-warning={isWinner}
                 class:bg-secondary={!isWinner}>
                {#if isWinner}⭐{/if}{votes} Votes
                {#if isWinner}⭐{/if}
            </div>
        {:else if showType}
            <div class="card-header"
                 class:object={card.type === CardType.Object}
                 class:person={card.type === CardType.Person}
                 class:place={card.type === CardType.Place}
                 class:activity={card.type === CardType.Activity}
                 class:punishment={card.type === CardType.Punishment}
            >
                {typeToStringMap.get(card.type)}
            </div>
        {/if}
        <div class="card-body">
            <h5 class="card-title text-dark" class:presenterTheme>{card.text}</h5>
            <p class="card-text">
                {#if showAuthor}
                    <small class="text-muted">created by {card.author?.name ?? 'SwagSlash'}</small>
                {/if}
                {#if showDealer && dealer}
                    <small class="text-muted">played by {dealer.name}</small>
                {/if}
                {#if votedFor}
                    <small class="text-muted">You voted for this.</small>
                {/if}
                {#if played}
                    <small class="text-muted fw-bold">You played this.</small>
                {/if}
            </p>
        </div>
        {#if votable}
            <div class="card-footer text-muted">
                {#if dealer.id !== currentPlayerId}
                    <button on:click={onVote} class="btn btn-outline-secondary">🔥 Vote</button>
                {:else}
                    <small class="text-muted">☠️ Can't vote yours</small>
                {/if}
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

  .played {
    box-shadow: 0px 0px 25px rgba(51, 129, 245, 0.79);
  }

  .isWinner {
    box-shadow: 0px 0px 25px rgba(240, 218, 24, 0.795);
    color: black;
  }

  .presenterTheme {
    font-size: 24pt;
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

  .punishment {
    background-color: #dc3545;
    color: white;
  }

  .activity {
    background-color: #0dcaf0;
    color: white;
  }
</style>
