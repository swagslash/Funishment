<script lang="ts">
    import CardComponent from "./CardComponent.svelte";
    import {Card} from "src/model/card";

    export let playerCards: Card[] = []
    export let canPlay = false;

    function submitPlayedCard(e: Event) {
        // TODO send to server
        canPlay = false;
    }
</script>

<h3>My Cards</h3>
<div class="row row-cols-2 row-cols-sm-3 row-cols-md-3 row-cols-lg-4 row-cols-xl-5 g-1">
    {#each playerCards as card}
        <CardComponent playable={canPlay} card="{card}" on:play={submitPlayedCard}></CardComponent>
    {/each}
</div>
