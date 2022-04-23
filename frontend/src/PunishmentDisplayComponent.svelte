<script lang="ts">
    import {createEventDispatcher, onMount} from "svelte";
    import {fade} from 'svelte/transition';
    import CardComponent from "src/CardComponent.svelte";
    import {Punishment} from "src/model/punishment";

    export let punishment: Punishment;
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
        <h1>The Looming Punishment is</h1>
        <CardComponent card="{punishment.card}" showType showAuthor></CardComponent>
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