<script lang="ts">
    import CardComponent from "./CardComponent.svelte";
    import {Card} from "src/model/card";
    import {createEventDispatcher} from "svelte";

    export let cards: Card[] = []
    export let canPlay = false;

    const dispatch = createEventDispatcher();

    function submitPlayedCard(e: any) {
        canPlay = false;
        dispatch('play', e.detail)
    }
</script>

<h2>Answer the question</h2>
<p class="badge bg-warning text-black-50" hidden={!canPlay}>Choose one answer from your cards below</p>
<div class="row row-cols-2 row-cols-sm-3 row-cols-md-3 row-cols-lg-4 row-cols-xl-5 g-1">
    {#each cards as card}
        <CardComponent playable={canPlay} card="{card}" showType on:play={submitPlayedCard}></CardComponent>
    {/each}
</div>
