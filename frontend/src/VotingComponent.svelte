<script lang="ts">
    import {Question} from "./model/question";
    import {Card} from "./model/card"
    import CardComponent from "src/CardComponent.svelte";
    import {createEventDispatcher} from "svelte";

    const dispatch = createEventDispatcher();

    export let cards: Card[];

    let votable = true;

    function handleVoting(e:any) {
        votable = false;
        dispatch('votingComplete', {id: e.detail.id})
    }

</script>

<div class="justify-content-center">
    <div class="row row-cols-2 row-cols-sm-3 row-cols-md-3 row-cols-lg-4 row-cols-xl-5 g-1">
        {#each cards as card}
            <CardComponent card="{card}" votable="{votable}" on:voted={handleVoting}></CardComponent>
        {/each}
    </div>

</div>

<style lang="scss">
  .question {
    h1 {
      font-size: 48pt;
    }

    padding: 2em 0;
    font-family: Neucha, -apple-system, system-ui, BlinkMacSystemFont,
    "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  }

</style>