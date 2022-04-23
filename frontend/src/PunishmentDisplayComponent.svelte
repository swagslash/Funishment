<script lang="ts">
    import {createEventDispatcher, onMount} from "svelte";
    import {fade} from 'svelte/transition';
    import CardComponent from "src/CardComponent.svelte";
    import {Punishment} from "src/model/punishment";
    import PunishmentComponent from "src/PunishmentComponent.svelte";
    import {Card} from "src/model/card";

    export let punishment: Punishment;
    export let card: Card;
    export let duration: number = 0;
    export let animationDuration = 2000;

    const dispatch = createEventDispatcher();

    let finishedInterval = false;

    onMount(() => {
        if (duration !== 0) {
            setTimeout(() => {
                finishedInterval = true;
                dispatch('durationOver');
            }, duration);
        }
    });
</script>

{#if !finishedInterval}
    <div out:fade="{{ duration: animationDuration }}">
        {#if !punishment}
            <h1>The Looming Punishment is</h1>
            <CardComponent card="{card}" showType showAuthor=""></CardComponent>
        {:else}
            <PunishmentComponent punishment="{punishment}"></PunishmentComponent>
        {/if}

    </div>
{/if}

<style lang="scss">
  .punishment {
    h1 {
      font-size: 28pt;
    }

    padding: 2em 0;
    font-family: Neucha, -apple-system, system-ui, BlinkMacSystemFont,
    "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  }

</style>