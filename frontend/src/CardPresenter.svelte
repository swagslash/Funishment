<script lang="ts">
    import CardComponent from "./CardComponent.svelte";
    import {Card} from "src/model/card";
    import {onMount} from "svelte";
    import {fade, fly} from 'svelte/transition';

    export let cards: Card[];
    export let animationDuration: number = 2000;
    export let slideTime: number = 7000;

    let index = 0;

    let card = cards[index];

    let visibleFirst = false;
    let visibleSecond = false;

    let finishedSlideshow = false;

    onMount(() => {
        visibleFirst = true;

        const interval = setInterval(() => {
            let makeVisible = visibleFirst ? 2 : 1;

            // Hide all
            visibleFirst = false;
            visibleSecond = false;

            index++;
            if (index >= cards.length) {
                finishedSlideshow = true;
                return;
            }
            card = cards[index];
            setTimeout(() => {
                if (makeVisible === 2) {
                    visibleSecond = true;
                } else if (makeVisible === 1) {
                    visibleFirst = true
                }
            }, animationDuration);

        }, slideTime);

        return () => {
            clearInterval(interval);
        };
    });
</script>

{#if !finishedSlideshow}
    <div style="height: 150px; width: auto" out:fade="{{ duration: animationDuration }}">
        {#if index % 2 === 0 && visibleFirst}
            <div class="presented" in:fly="{{ x: +200, duration: animationDuration }}"
                 out:fly="{{ x: -200, duration: animationDuration }}">
                <CardComponent presenterTheme card="{card}"></CardComponent>
            </div>
        {:else if visibleSecond}
            <div class="presented" in:fly="{{ x: +200, duration: animationDuration }}"
                 out:fly="{{ x: -200, duration: animationDuration }}">
                <CardComponent presenterTheme card="{card}"></CardComponent>
            </div>
        {/if}
    </div>
{:else}
    <div>
        <code>VotingComponent Placeholder</code>
    </div>
{/if}

<style>
    CardComponent {

    }
    .presented {
        position: relative;
        top: 0;
    }
</style>