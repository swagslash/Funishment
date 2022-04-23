<script lang="ts">
    import {PlayedCard} from "./model/card"
    import CardComponent from "src/CardComponent.svelte";
    import {createEventDispatcher} from "svelte";

    export let playedCards: PlayedCard[];
    export let currentPlayerId: string;

    let maxVotes;

    $: {
        maxVotes = playedCards.map((c) => c.votes).reduce((max, current) => max > current ? max : current, 0)
    }

</script>

<div class="justify-content-center">
    <div class="row row-cols-2 row-cols-sm-3 row-cols-md-3 row-cols-lg-4 row-cols-xl-5 g-1">
        {#each playedCards as playedCard}
            <CardComponent card={playedCard.card} dealer={playedCard.dealer} currentPlayerId={currentPlayerId}
                           votes={playedCard.votes} isWinner={playedCard.votes === maxVotes} showAuthor showDealer></CardComponent>
        {/each}
    </div>
</div>
